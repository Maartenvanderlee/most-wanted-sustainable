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

// Alle tabellen uit supabase/migrations/, met de migratie die ze aanmaakt.
// Ontbreekt er één, dan is die migratie nooit in Supabase uitgevoerd.
const tables = [
  ["products", "0001"],
  ["signals", "0001"],
  ["scores", "0001"],
  ["newsletter_subscribers", "0001"],
  ["events", "0003"],
  ["product_certifications", "0004"],
  ["product_offers", "0005"],
  ["site_content", "0007"],
  ["admin_login_attempts", "0009"],
  ["curation_history", "0011"],
];

let allOk = true;

console.log(`\nVerbinden met ${url} ...\n`);

for (const [table, migration] of tables) {
  // Let op: een `head: true`-telling geeft bij een ONTBREKENDE tabel geen
  // foutmelding maar stil `null` terug. Daarom eerst een echte select (die
  // wél een fout geeft) en pas daarna tellen.
  const { error } = await supabase.from(table).select("*").limit(1);

  if (error) {
    allOk = false;
    console.log(
      `❌ ${table.padEnd(24)} → ontbreekt (migratie ${migration} niet uitgevoerd)`
    );
    continue;
  }

  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  console.log(`✅ ${table.padEnd(24)} → bestaat (${count ?? 0} rijen)`);
}

console.log(
  allOk
    ? "\n🎉 Alles staat klaar: de database is verbonden en alle tabellen bestaan.\n"
    : "\n⚠️  Niet alle tabellen zijn gevonden. Voer de genoemde migratie(s) uit\n" +
        "   in de Supabase SQL Editor (bestanden in supabase/migrations/).\n"
);
process.exit(allOk ? 0 : 1);
