// Supabase-verbinding voor de browser (publieke, veilige anon-sleutel).
// Kan alleen bij data die het RLS-beleid publiek toestaat.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Supabase-omgevingsvariabelen ontbreken. Vul NEXT_PUBLIC_SUPABASE_URL en " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local in (zie .env.example)."
  );
}

export const supabase = createClient<Database>(url, anonKey);
