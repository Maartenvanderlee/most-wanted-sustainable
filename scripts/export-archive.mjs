// Lange-termijn databorging: dumpt de belangrijkste tabellen naar JSON, als
// offline backup naast de append-only tabellen in Supabase. Handig voor:
//   - een periodieke veilige kopie los van de database
//   - jaar-op-jaar rapportage (bewaar de kopie, vergelijk later met een verse export)
//
// De tabellen signals en scores zijn al append-only (historie wordt nooit
// overschreven); dit script is de EXTRA verzekering — een echte kopie buiten
// de database die je kunt archiveren of aan een data-afnemer kunt geven.
//
// Twee modi:
//   Lokaal (standaard):  node --env-file=.env.local scripts/export-archive.mjs
//     → data/archive/<datum>/ , ALLE tabellen, gitignored (blijft op je laptop).
//   Duurzaam (CI):       ARCHIVE_TARGET=committed node scripts/export-archive.mjs
//     → data/backup/ (vast pad, overschrijft), ZONDER newsletter_subscribers.
//       Bedoeld voor de wekelijkse GitHub Action die dit naar de repo commit;
//       git-historie wordt zo de versiebeheerde, duurzame kopie buiten Supabase.
//       Subscriber-e-mails (persoonsgegevens) blijven bewust buiten git.
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const COMMITTED = process.env.ARCHIVE_TARGET === "committed";

// Tabellen die we volledig wegschrijven, met een stabiele sorteervolgorde.
// pii: true = bevat persoonsgegevens; die slaan we over in de commit-modus.
const TABLES = [
  { name: "products", order: "created_at" },
  { name: "signals", order: "measured_at" },
  { name: "scores", order: "snapshot_date" },
  { name: "curation_history", order: "decided_at" },
  { name: "product_certifications", order: "created_at" },
  { name: "product_offers", order: "created_at" },
  { name: "newsletter_subscribers", order: "created_at", pii: true },
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

// Vast pad in de commit-modus (git-historie = versiebeheer); gedateerde map lokaal.
const today = new Date().toISOString().slice(0, 10);
const outDir = COMMITTED
  ? path.join(process.cwd(), "data", "backup")
  : path.join(process.cwd(), "data", "archive", today);
await fs.mkdir(outDir, { recursive: true });

const tablesToExport = COMMITTED ? TABLES.filter((t) => !t.pii) : TABLES;

const summary = {
  exportedAt: new Date().toISOString(),
  mode: COMMITTED ? "committed" : "local",
  tables: {},
};

for (const { name, order } of tablesToExport) {
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

const rel = COMMITTED ? "data/backup" : `data/archive/${today}`;
console.log(`\nKlaar. Export opgeslagen in: ${rel}/`);
if (!COMMITTED) {
  console.log("Tip: bewaar deze map op een veilige plek (of in een aparte backup-repo).");
}
