"use server";

// Server-acties voor de admin. Beveiligd met een wachtwoord uit ADMIN_PASSWORD
// (server-side env). Na inloggen staat er een httpOnly-cookie; die is niet
// leesbaar vanuit de browser-JavaScript.
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import type { ProductStatus } from "@/lib/supabase/types";

const COOKIE = "mw_admin";

function expectedToken(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD ontbreekt in .env.local.");
  return pw;
}

export async function isAuthenticated(): Promise<boolean> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  return cookies().get(COOKIE)?.value === pw;
}

function assertAuthed() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || cookies().get(COOKIE)?.value !== pw) {
    throw new Error("Niet ingelogd.");
  }
}

export async function login(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const password = String(formData.get("password") ?? "");
  if (password !== expectedToken()) {
    return "Onjuist wachtwoord.";
  }
  cookies().set(COOKIE, password, {
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
  cookies().delete(COOKIE);
  revalidatePath("/admin");
}

// Zet de status en (bij afwijzen) de reden.
export async function setStatus(formData: FormData): Promise<void> {
  assertAuthed();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ProductStatus;
  const reason = String(formData.get("rejection_reason") ?? "").trim() || null;

  const supabase = createServerClient();
  const { error } = await supabase
    .from("products")
    .update({
      status,
      rejection_reason: status === "rejected" ? reason : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/");
}

// Werk foto, keurmerken, kenmerken en koop-/affiliate-link bij (los van goedkeuren).
export async function updateDetails(formData: FormData): Promise<void> {
  assertAuthed();
  const id = String(formData.get("id"));
  const affiliate = String(formData.get("affiliate_url") ?? "").trim() || null;
  const imageUrl = String(formData.get("image_url") ?? "").trim() || null;

  // Aangevinkte keurmerken + los ingevoerde kenmerken samenvoegen tot tags.
  const certifications = formData.getAll("cert").map((c) => String(c));
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

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/product/[slug]", "page");
}
