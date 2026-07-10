// Controleert of de Supabase-verbinding werkt en of alle tabellen bestaan.
// Draaien met:  node --env-file=.env.local scripts/check-db.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "\n❌ NEXT_PUBLIC_SUPABASE_URL of SUPABASE_SERVICE_ROLE_KEY ontbreekt in .env.local.\n"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const tables = ["products", "signals", "scores", "newsletter_subscribers"];
let allOk = true;

console.log(`\nVerbinden met ${url} ...\n`);

for (const table of tables) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    allOk = false;
    console.log(`❌ ${table.padEnd(24)} → ${error.message}`);
  } else {
    console.log(`✅ ${table.padEnd(24)} → bestaat (${count ?? 0} rijen)`);
  }
}

console.log(
  allOk
    ? "\n🎉 Alles staat klaar: de database is verbonden en alle tabellen bestaan.\n"
    : "\n⚠️  Niet alle tabellen zijn gevonden. Heb je beide migraties uitgevoerd?\n"
);
process.exit(allOk ? 0 : 1);
