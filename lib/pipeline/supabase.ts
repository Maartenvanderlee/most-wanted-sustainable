// Supabase-verbinding met de service-role-sleutel voor de pipeline.
// Gebruikt bewust geen "server-only" zodat dit ook draait via het
// commando (tsx), buiten Next.js om. Wordt nooit in de browser geïmporteerd.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/types";

export function createPipelineClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase-omgevingsvariabelen ontbreken. Vul NEXT_PUBLIC_SUPABASE_URL en " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local in (zie .env.example)."
    );
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
