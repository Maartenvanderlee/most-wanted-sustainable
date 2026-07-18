"use server";

// Slaat een nieuwsbrief-inschrijving op in Supabase. Gebruikt de anon-sleutel;
// het RLS-beleid staat publiek alleen INSERT toe (nooit lezen).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type SubscribeState = { ok: boolean; message: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Meldingen in de taal van de pagina waar het formulier op staat.
const MESSAGES = {
  nl: {
    invalid: "Vul een geldig e-mailadres in.",
    already: "Je bent al ingeschreven — bedankt!",
    error: "Er ging iets mis. Probeer het later opnieuw.",
    done: "Gelukt! Je ontvangt binnenkort onze updates.",
  },
  en: {
    invalid: "Please enter a valid email address.",
    already: "You are already subscribed — thank you!",
    error: "Something went wrong. Please try again later.",
    done: "Done! You'll receive our updates soon.",
  },
} as const;

export async function subscribe(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const locale = formData.get("locale") === "en" ? "en" : "nl";
  const m = MESSAGES[locale];
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!EMAIL.test(email)) {
    return { ok: false, message: m.invalid };
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
      return { ok: true, message: m.already };
    }
    return { ok: false, message: m.error };
  }

  return { ok: true, message: m.done };
}
