// Lange-termijn databorging: dumpt de volledige inhoud van de belangrijkste
// tabellen naar JSON-bestanden in data/archive/<datum>/, als offline backup
// naast de append-only tabellen in Supabase. Handig voor:
//   - een periodieke veilige kopie los van de database
//   - jaar-op-jaar rapportage (bewaar de map, vergelijk later met een verse export)
//
// De tabellen signals en scores zijn al append-only (historie wordt nooit
// overschreven); dit script is de EXTRA verzekering — een echte kopie buiten
// de database die je kunt archiveren of aan een data-afnemer kunt geven.
//
// Gebruik:  node --env-file=.env.local scripts/export-archive.mjs
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Tabellen die we volledig wegschrijven, met een stabiele sorteervolgorde.
const TABLES = [
  { name: "products", order: "created_at" },
  { name: "signals", order: "measured_at" },
  { name: "scores", order: "snapshot_date" },
  { name: "curation_history", order: "decided_at" },
  { name: "product_certifications", order: "created_at" },
  { name: "product_offers", order: "created_at" },
  { name: "newsletter_subscribers", order: "created_at" },
];

// Alles ophalen met paginering (Supabase geeft standaard max 1000 rijen).
async function fetchAll(table, order) {
  const all = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(order, { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    all.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return all;
}

const today = new Date().toISOString().slice(0, 10);
const outDir = path.join(process.cwd(), "data", "archive", today);
await fs.mkdir(outDir, { recursive: true });

const summary = { exportedAt: new Date().toISOString(), tables: {} };

for (const { name, order } of TABLES) {
  try {
    const rows = await fetchAll(name, order);
    await fs.writeFile(
      path.join(outDir, `${name}.json`),
      JSON.stringify(rows, null, 2),
      "utf-8"
    );
    summary.tables[name] = rows.length;
    console.log(`✅ ${name}: ${rows.length} rijen`);
  } catch (err) {
    summary.tables[name] = `FOUT: ${err.message}`;
    console.log(`❌ ${name}: ${err.message}`);
  }
}

await fs.writeFile(
  path.join(outDir, "_summary.json"),
  JSON.stringify(summary, null, 2),
  "utf-8"
);

console.log(`\nKlaar. Export opgeslagen in: data/archive/${today}/`);
console.log("Tip: bewaar deze map op een veilige plek (of in een aparte backup-repo).");
