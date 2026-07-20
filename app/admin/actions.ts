"use server";

// Server-acties voor de admin. Beveiligd met een wachtwoord uit ADMIN_PASSWORD
// (server-side env). Na inloggen staat er een httpOnly-cookie met een
// afgeleide sessiewaarde (nooit het wachtwoord zelf) — zo lekt een gestolen
// cookie niet het wachtwoord. Mislukte pogingen worden per IP vertraagd.
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { findImageFor, hasPexelsKey } from "@/lib/images";
import { isRateLimited, recordFailedAttempt, clientIp } from "@/lib/rate-limit";
import { isCertification } from "@/lib/certifications";
import {
  ADMIN_COOKIE,
  sessionValue,
  timingSafeStringEqual,
  isAdminRequestAuthed,
} from "@/lib/admin-auth";
import type { ProductStatus } from "@/lib/supabase/types";

export async function isAuthenticated(): Promise<boolean> {
  return isAdminRequestAuthed();
}

function assertAuthed() {
  if (!isAdminRequestAuthed()) {
    throw new Error("Niet ingelogd.");
  }
}

export async function login(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD ontbreekt in .env.local.");

  const ip = clientIp(headers());
  if (await isRateLimited(ip)) {
    return "Te veel mislukte pogingen. Probeer het over 15 minuten opnieuw.";
  }

  const password = String(formData.get("password") ?? "");
  if (!timingSafeStringEqual(password, pw)) {
    await recordFailedAttempt(ip);
    return "Onjuist wachtwoord.";
  }

  cookies().set(ADMIN_COOKIE, sessionValue(pw), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 uur
  });
  revalidatePath("/admin");
  return null;
}

export async function logout(): Promise<void> {
  cookies().delete(ADMIN_COOKIE);
  revalidatePath("/admin");
}

// Zet de status en (bij afwijzen) de reden.
export async function setStatus(formData: FormData): Promise<void> {
  assertAuthed();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ProductStatus;
  const reason = String(formData.get("rejection_reason") ?? "").trim() || null;

  const supabase = createServerClient();

  // Slug/naam zelf opzoeken (niet uit het formulier vertrouwen) zodat de
  // curatiegeschiedenis altijd het echte product beschrijft.
  const { data: product, error: lookupError } = await supabase
    .from("products")
    .select("slug, name")
    .eq("id", id)
    .single();
  if (lookupError) throw new Error(lookupError.message);

  const { error } = await supabase
    .from("products")
    .update({
      status,
      rejection_reason: status === "rejected" ? reason : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // Append-only: elke beslissing komt er als NIEUWE rij bij, nooit een
  // overschrijving. Zo blijft de volledige geschiedenis van een product
  // (ook na meerdere afwijzingen) bewaard voor toekomstige curatie.
  if (status === "approved" || status === "rejected") {
    const { error: historyError } = await supabase.from("curation_history").insert({
      product_slug: product.slug,
      product_name: product.name,
      decision: status,
      reason: status === "rejected" ? reason : null,
    });
    if (historyError) throw new Error(historyError.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

// Zoekt via Pexels automatisch een foto voor elk product dat er nog geen
// heeft. Idempotent: bestaande (ook handmatig gekozen) foto's blijven staan.
export async function fillMissingImages(): Promise<void> {
  assertAuthed();
  if (!hasPexelsKey()) {
    throw new Error(
      "PEXELS_API_KEY ontbreekt. Maak een gratis sleutel op pexels.com/api en " +
        "zet die in .env.local en in de Vercel environment variables."
    );
  }

  const supabase = createServerClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name")
    .is("image_url", null);
  if (error) throw new Error(error.message);

  for (const p of products ?? []) {
    const imageUrl = await findImageFor(p.name);
    if (!imageUrl) continue; // niets gevonden: overslaan, later opnieuw te proberen
    await supabase.from("products").update({ image_url: imageUrl }).eq("id", p.id);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/trending/[category]", "page");
}

// Werk foto, keurmerken, kenmerken en koop-/affiliate-link bij (los van goedkeuren).
export async function updateDetails(formData: FormData): Promise<void> {
  assertAuthed();
  const id = String(formData.get("id"));
  const affiliate = String(formData.get("affiliate_url") ?? "").trim() || null;
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;
  const lifespan = String(formData.get("lifespan") ?? "").trim() || null;
  const endOfLife = String(formData.get("end_of_life") ?? "").trim() || null;
  const textField = (name: string) =>
    String(formData.get(name) ?? "").trim() || null;
  const description = textField("description");
  const descriptionEn = textField("description_en");
  const whySustainable = textField("why_sustainable");
  const whySustainableEn = textField("why_sustainable_en");
  const co2Note = textField("co2_note");
  const co2NoteEn = textField("co2_note_en");

  // Aangevinkte keurmerken + los ingevoerde kenmerken samenvoegen tot tags.
  // Alleen bekende keurmerk-slugs toestaan: dit voorkomt dat een onverwachte
  // waarde in de handmatig opgebouwde SQL-filter hieronder terechtkomt.
  const certifications = formData
    .getAll("cert")
    .map((c) => String(c))
    .filter(isCertification);
  const characteristics = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const tags = Array.from(new Set([...certifications, ...characteristics]));

  const supabase = createServerClient();
  const { error } = await supabase
    .from("products")
    .update({
      sustainability_tags: tags,
      affiliate_url: affiliate,
      image_url: imageUrl,
      lifespan,
      end_of_life: endOfLife,
      description,
      description_en: descriptionEn,
      why_sustainable: whySustainable,
      why_sustainable_en: whySustainableEn,
      co2_note: co2Note,
      co2_note_en: co2NoteEn,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // Bewijs per aangevinkt keurmerk (registratienummer + link naar register).
  const evidenceRows = certifications.map((cert) => ({
    product_id: id,
    certification: cert,
    registration_number:
      String(formData.get(`evidence_number__${cert}`) ?? "").trim() || null,
    evidence_url:
      String(formData.get(`evidence_url__${cert}`) ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  }));

  if (evidenceRows.length > 0) {
    const { error: evidenceError } = await supabase
      .from("product_certifications")
      .upsert(evidenceRows, { onConflict: "product_id,certification" });
    if (evidenceError) throw new Error(evidenceError.message);
  }

  // Bewijs opruimen van keurmerken die niet meer aangevinkt zijn.
  const { error: cleanupError } = await supabase
    .from("product_certifications")
    .delete()
    .eq("product_id", id)
    .not(
      "certification",
      "in",
      `(${certifications.length > 0 ? certifications.map((c) => `"${c}"`).join(",") : '""'})`
    );
  if (cleanupError) throw new Error(cleanupError.message);

  // Verkoopkanalen (max 3): ingevulde rijen opslaan, leeggemaakte verwijderen.
  for (const position of [1, 2, 3]) {
    const retailer = String(
      formData.get(`offer_retailer__${position}`) ?? ""
    ).trim();
    const url = String(formData.get(`offer_url__${position}`) ?? "").trim();
    // Prijs: optioneel; accepteert zowel "14,99" als "14.99".
    const priceRaw = String(formData.get(`offer_price__${position}`) ?? "")
      .trim()
      .replace(",", ".");
    const priceNum = Number(priceRaw);
    const price = priceRaw && Number.isFinite(priceNum) && priceNum > 0 ? priceNum : null;

    if (retailer && url) {
      const { error: offerError } = await supabase.from("product_offers").upsert(
        {
          product_id: id,
          position,
          retailer,
          url,
          price,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "product_id,position" }
      );
      if (offerError) throw new Error(offerError.message);
    } else {
      const { error: offerDelete } = await supabase
        .from("product_offers")
        .delete()
        .eq("product_id", id)
        .eq("position", position);
      if (offerDelete) throw new Error(offerDelete.message);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/product/[slug]", "page");
}
