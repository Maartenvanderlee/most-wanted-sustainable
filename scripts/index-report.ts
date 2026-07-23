// Risegoods Index — genereert een maandelijks B2B-rapport uit de eigen
// scores/signals-historie: welke duurzame productcategorieën versnellen.
//
// Hergebruikt EXACT de methodologie van de site (growth() + WEIGHTS +
// FORMULA_VERSION uit lib/scoring); dit rapport kan dus niet afwijken van de
// publieke ranglijst. Alle cijfers zijn herleidbaar tot onze eigen metingen —
// niets verzonnen.
//
// Gebruik:  npm run report            (huidige maand)
//           npm run report -- 2026-07 (specifieke maand)
//
// Output:   data/reports/risegoods-index-<YYYY-MM>.md   (PDF-vriendelijk)
//           data/reports/risegoods-index-<YYYY-MM>.json (machine/data-afnemer)
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import { growth, type SignalRow } from "../lib/scoring/score";
import { FORMULA_VERSION, WEIGHTS } from "../lib/scoring/version";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  isCategory,
  type Category,
} from "../lib/categories";
import type { SourceName } from "../lib/supabase/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SOURCES = Object.keys(WEIGHTS) as SourceName[];
const SOURCE_LABELS: Record<string, string> = {
  google_trends: "Google Trends",
  youtube: "YouTube",
  wikipedia: "Wikipedia",
  gdelt_news: "Nieuws (GDELT)",
};
const MONTHS_NL = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

async function fetchAll<T>(table: string, order: string): Promise<T[]> {
  const all: T[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(order, { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    all.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE) break;
  }
  return all;
}

type ProductRow = { id: string; name: string; category: string; status: string };
type ScoreRow = { product_id: string; score: number; rank: number; snapshot_date: string };

function pct(n: number): string {
  const v = Math.round(n * 100);
  return `${v >= 0 ? "+" : ""}${v}%`;
}

function mean(xs: number[]): number | null {
  const v = xs.filter((x) => Number.isFinite(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

async function main() {
  const arg = process.argv[2];
  const now = new Date();
  const [year, month] = arg
    ? arg.split("-").map(Number)
    : [now.getUTCFullYear(), now.getUTCMonth() + 1];
  const ym = `${year}-${String(month).padStart(2, "0")}`;
  const monthLabel = `${MONTHS_NL[month - 1]} ${year}`;

  const products = await fetchAll<ProductRow>("products", "created_at");
  const signals = await fetchAll<SignalRow>("signals", "measured_at");
  const scores = await fetchAll<ScoreRow>("scores", "snapshot_date");

  const approved = products.filter((p) => p.status === "approved" && isCategory(p.category));
  const nameById = new Map(approved.map((p) => [p.id, p.name]));
  const catById = new Map(approved.map((p) => [p.id, p.category as Category]));
  const approvedIds = new Set(approved.map((p) => p.id));

  // Signalen per product per bron (alleen goedgekeurde producten).
  const sigByProductSource = new Map<string, Map<SourceName, SignalRow[]>>();
  for (const s of signals) {
    if (!approvedIds.has(s.product_id)) continue;
    if (!sigByProductSource.has(s.product_id)) sigByProductSource.set(s.product_id, new Map());
    const m = sigByProductSource.get(s.product_id)!;
    if (!m.has(s.source)) m.set(s.source, []);
    m.get(s.source)!.push(s);
  }

  // Scores: laatste snapshot + snapshot ~28 dagen eerder (voor rangverandering).
  const snapshotDates = [...new Set(scores.map((s) => s.snapshot_date))].sort();
  const latestDate = snapshotDates[snapshotDates.length - 1] ?? null;
  const priorTarget = latestDate
    ? new Date(+new Date(latestDate) - 28 * 864e5).toISOString().slice(0, 10)
    : null;
  const priorDate =
    [...snapshotDates].reverse().find((d) => d <= (priorTarget ?? "")) ?? snapshotDates[0] ?? null;

  const latestScore = new Map<string, ScoreRow>();
  const priorRank = new Map<string, number>();
  for (const s of scores) {
    if (s.snapshot_date === latestDate && approvedIds.has(s.product_id)) latestScore.set(s.product_id, s);
    if (s.snapshot_date === priorDate && approvedIds.has(s.product_id)) priorRank.set(s.product_id, s.rank);
  }

  // Per categorie: ruwe week-op-week groei per bron (de eerlijke marktversnelling).
  const categoryData = CATEGORIES.map((cat) => {
    const ids = approved.filter((p) => p.category === cat).map((p) => p.id);
    const tracked = ids.filter((id) => sigByProductSource.has(id)).length;
    const scored = ids.filter((id) => latestScore.has(id)).length;

    const growthBySource: Record<string, number | null> = {};
    for (const src of SOURCES) {
      const perProduct = ids
        .map((id) => growth(sigByProductSource.get(id)?.get(src) ?? []))
        .filter((g): g is number => g !== null);
      growthBySource[src] = mean(perProduct);
    }
    // Samengestelde versnellingsindicator: gewogen gemiddelde van de bron-groei.
    let composite: number | null = null;
    const parts: number[] = [];
    let wsum = 0;
    for (const src of SOURCES) {
      const g = growthBySource[src];
      if (g !== null) {
        parts.push((WEIGHTS[src] ?? 0) * g);
        wsum += WEIGHTS[src] ?? 0;
      }
    }
    if (wsum > 0) composite = parts.reduce((a, b) => a + b, 0) / wsum;

    const topProducts = ids
      .filter((id) => latestScore.has(id))
      .map((id) => {
        const ls = latestScore.get(id)!;
        const pr = priorRank.get(id);
        return {
          name: nameById.get(id)!,
          score: ls.score,
          rank: ls.rank,
          rankDelta: pr !== undefined ? pr - ls.rank : null,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return { cat, tracked, scored, growthBySource, composite, topProducts };
  });

  const ranked = [...categoryData]
    .filter((c) => c.composite !== null)
    .sort((a, b) => (b.composite ?? 0) - (a.composite ?? 0));
  const fastest = ranked[0] ?? null;

  const topMovers = [...latestScore.values()]
    .map((s) => ({
      name: nameById.get(s.product_id)!,
      category: CATEGORY_LABELS[catById.get(s.product_id)!],
      score: s.score,
      rank: s.rank,
      rankDelta: priorRank.has(s.product_id) ? priorRank.get(s.product_id)! - s.rank : null,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // --- Markdown-rapport (PDF-vriendelijk) ---
  const L: string[] = [];
  L.push(`# Risegoods Index — ${monthLabel}`);
  L.push("");
  L.push("> **Vertrouwelijk B2B-rapport.** Welke duurzame productcategorieën versnellen,");
  L.push("> gemeten als week-op-week groei (versnelling), niet volume. Markt:");
  L.push("> internationaal (Engelstalige zoektermen). Alle cijfers zijn afgeleid uit");
  L.push("> onze eigen metingen — zie Methodologie onderaan.");
  L.push("");
  L.push("## Samenvatting");
  L.push("");
  L.push(`- Datavenster: laatste snapshot ${latestDate ?? "—"}${priorDate && priorDate !== latestDate ? `, rangverandering t.o.v. ${priorDate}` : ""}.`);
  L.push(`- Goedgekeurde producten gevolgd: ${approved.filter((p) => sigByProductSource.has(p.id)).length} · met voldoende historie voor een trendscore: ${latestScore.size}.`);
  if (fastest) {
    L.push(`- Snelst versnellende categorie: **${CATEGORY_LABELS[fastest.cat]}** (samengestelde versnelling ${pct(fastest.composite!)}).`);
  }
  L.push("");
  L.push("## Per categorie");
  for (const c of categoryData) {
    L.push("");
    L.push(`### ${CATEGORY_LABELS[c.cat]}`);
    L.push("");
    L.push(`Gevolgd: ${c.tracked} producten · met trendscore: ${c.scored}.`);
    if (c.composite !== null) {
      L.push("");
      L.push(`**Marktversnelling (week-op-week, ruwe signalen):** ${pct(c.composite)} samengesteld.`);
      L.push("");
      L.push("| Bron | Versnelling |");
      L.push("|---|---|");
      for (const src of SOURCES) {
        const g = c.growthBySource[src];
        L.push(`| ${SOURCE_LABELS[src] ?? src} | ${g === null ? "—" : pct(g)} |`);
      }
    } else {
      L.push("");
      L.push("_Onvoldoende data deze maand._");
    }
    if (c.topProducts.length) {
      L.push("");
      L.push("| Product | Trendscore | Rang | Δ rang |");
      L.push("|---|---:|---:|---:|");
      for (const p of c.topProducts) {
        const d = p.rankDelta === null ? "—" : p.rankDelta > 0 ? `▲ ${p.rankDelta}` : p.rankDelta < 0 ? `▼ ${-p.rankDelta}` : "—";
        L.push(`| ${p.name} | ${p.score} | #${p.rank} | ${d} |`);
      }
    }
  }
  if (topMovers.length) {
    L.push("");
    L.push("## Top-versnellers (alle categorieën)");
    L.push("");
    L.push("| Product | Categorie | Trendscore | Rang | Δ rang |");
    L.push("|---|---|---:|---:|---:|");
    for (const p of topMovers) {
      const d = p.rankDelta === null ? "—" : p.rankDelta > 0 ? `▲ ${p.rankDelta}` : p.rankDelta < 0 ? `▼ ${-p.rankDelta}` : "—";
      L.push(`| ${p.name} | ${p.category} | ${p.score} | #${p.rank} | ${d} |`);
    }
  }
  L.push("");
  L.push("## Methodologie & databronnen");
  L.push("");
  L.push(`- **Formule ${FORMULA_VERSION}.** Trendscore meet versnelling (week-op-week groei), niet volume, per bron min-max-genormaliseerd (0–100) en gewogen opgeteld.`);
  L.push(`- **Gewichten:** ${SOURCES.map((s) => `${SOURCE_LABELS[s] ?? s} ${Math.round((WEIGHTS[s] ?? 0) * 100)}%`).join(" · ")}.`);
  L.push("- **Drempel:** een product krijgt pas een trendscore na minimaal 2 weken historie.");
  L.push("- **Databronnen:** publieke bronnen (Google Trends, YouTube, Wikipedia, GDELT-nieuws). Score is 100% onafhankelijk van affiliate of sponsoring.");
  L.push(`- **Rapport gegenereerd:** ${new Date().toISOString()} uit onze append-only historie.`);
  L.push("");
  L.push("### Beperkingen van deze editie");
  L.push("");
  L.push("- De metingen gebruiken Engelstalige zoektermen (internationaal signaal); een aparte Nederlandse meetlaag ontbreekt nog (zie zoekwoord-marktkaart).");
  L.push(`- De historie is nog jong (${snapshotDates.length} snapshot-dag(en) met scores). Het rapport wordt maand op maand rijker naarmate de tijdreeks groeit.`);
  L.push("- Bij kleine aantallen producten per categorie kan de week-op-week versnelling sterk schommelen door één uitschieter; lees percentages deze editie als richting, niet als exacte marktgroei.");

  // --- JSON-begeleider (machine / data-afnemer) ---
  const json = {
    generatedAt: new Date().toISOString(),
    month: ym,
    formulaVersion: FORMULA_VERSION,
    weights: WEIGHTS,
    market: "international (English keywords)",
    window: { latestSnapshot: latestDate, priorSnapshot: priorDate, snapshotDays: snapshotDates.length },
    coverage: { approvedTracked: approved.filter((p) => sigByProductSource.has(p.id)).length, scored: latestScore.size },
    categories: categoryData.map((c) => ({
      category: c.cat,
      tracked: c.tracked,
      scored: c.scored,
      compositeAcceleration: c.composite,
      accelerationBySource: c.growthBySource,
      topProducts: c.topProducts,
    })),
    topMovers,
  };

  const outDir = path.join(process.cwd(), "data", "reports");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, `risegoods-index-${ym}.md`), L.join("\n") + "\n", "utf-8");
  await fs.writeFile(path.join(outDir, `risegoods-index-${ym}.json`), JSON.stringify(json, null, 2), "utf-8");

  console.log(`✅ Rapport geschreven: data/reports/risegoods-index-${ym}.md (+ .json)`);
  console.log(`   Categorieën met versnellingsdata: ${ranked.length}/${CATEGORIES.length} · gescoorde producten: ${latestScore.size}`);
}

main().catch((err) => {
  console.error("❌ Rapport mislukt:", err.message);
  process.exit(1);
});
