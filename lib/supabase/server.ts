// Supabase-verbinding voor de server (geheime service-role-sleutel).
// Deze omzeilt RLS en mag NOOIT in de browser terechtkomen.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Supabase-serveromgevingsvariabelen ontbreken. Vul NEXT_PUBLIC_SUPABASE_URL " +
      "en SUPABASE_SERVICE_ROLE_KEY in .env.local in (zie .env.example)."
  );
}

// Nieuwe client per aanroep; niet cachen tussen requests op de server.
export function createServerClient() {
  return createClient<Database>(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
