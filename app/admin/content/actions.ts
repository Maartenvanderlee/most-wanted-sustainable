"use server";

// Server-acties voor het CMS: concepten opslaan en publiceren.
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/categories";

function assertAuthed() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || cookies().get("mw_admin")?.value !== pw) {
    throw new Error("Niet ingelogd.");
  }
}

// Alle content__-velden uit het formulier halen: key -> waarde.
function contentEntries(formData: FormData): [string, string][] {
  const entries: [string, string][] = [];
  for (const [name, value] of formData.entries()) {
    if (name.startsWith("content__")) {
      entries.push([name.slice("content__".length), String(value)]);
    }
  }
  return entries;
}

// Sla de ingevulde teksten op als concept (alleen zichtbaar in previewmodus).
export async function saveDrafts(formData: FormData): Promise<void> {
  assertAuthed();
  const supabase = createServerClient();
  const now = new Date().toISOString();

  for (const [key, value] of contentEntries(formData)) {
    const { error } = await supabase
      .from("site_content")
      .upsert({ key, draft: value, updated_at: now }, { onConflict: "key" });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/content");
}

// Publiceer de ingevulde teksten direct naar de live site.
export async function publishContent(formData: FormData): Promise<void> {
  assertAuthed();
  const supabase = createServerClient();
  const now = new Date().toISOString();

  for (const [key, value] of contentEntries(formData)) {
    const { error } = await supabase
      .from("site_content")
      .upsert(
        { key, published: value, draft: null, updated_at: now },
        { onConflict: "key" }
      );
    if (error) throw new Error(error.message);
  }

  // Cache van de publieke pagina's verversen zodat de tekst direct live staat.
  revalidatePath("/");
  for (const c of CATEGORIES) {
    revalidatePath(`/trending/${CATEGORY_SLUGS[c]}`);
  }
  revalidatePath("/admin/content");
}
