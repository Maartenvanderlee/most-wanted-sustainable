"use server";

// Slaat een nieuwsbrief-inschrijving op in Supabase. Gebruikt de anon-sleutel;
// het RLS-beleid staat publiek alleen INSERT toe (nooit lezen).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type SubscribeState = { ok: boolean; message: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!EMAIL.test(email)) {
    return { ok: false, message: "Vul een geldig e-mailadres in." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient<Database>(url, anonKey);

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email });

  if (error) {
    // 23505 = unieke sleutel bestaat al: e-mail is al ingeschreven.
    if (error.code === "23505") {
      return { ok: true, message: "Je bent al ingeschreven — bedankt!" };
    }
    return { ok: false, message: "Er ging iets mis. Probeer het later opnieuw." };
  }

  return { ok: true, message: "Gelukt! Je ontvangt binnenkort onze updates." };
}
