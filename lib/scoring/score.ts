// Berekent de trendscore per product en schrijft één snapshot per dag.
// Meet VERSNELLING (week-op-week groei), niet volume. Volgt trend-score skill.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, SourceName, TablesInsert } from "../supabase/types";
import { FORMULA_VERSION, WEIGHTS } from "./version";

type Client = SupabaseClient<Database>;

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_HISTORY_MS = 14 * 24 * 60 * 60 * 1000; // min. 2 weken historie
const SOURCES = Object.keys(WEIGHTS) as SourceName[];

export type SignalRow = {
  product_id: string;
  source: SourceName;
  value: number;
  measured_at: string;
};

// Week-op-week groei voor één reeks metingen; null als er te weinig historie is.
// Geëxporteerd zodat het los te testen is.
export function growth(signals: SignalRow[]): number | null {
  if (signals.length < 2) return null;
  const sorted = [...signals].sort(
    (a, b) => +new Date(a.measured_at) - +new Date(b.measured_at)
  );
  const latest = sorted[sorted.length - 1];
  const target = +new Date(latest.measured_at) - WEEK_MS;
  // Laatste meting van ~een week eerder (of ouder).
  const prior = [...sorted]
    .reverse()
    .find((s) => +new Date(s.measured_at) <= target);
  if (!prior) return null;
  return (latest.value - prior.value) / Math.max(prior.value, 1);
}

// Min-max normalisatie naar 0-100 over de hele productset van deze snapshot.
// Geëxporteerd zodat het los te testen is.
export function normalize(values: Map<string, number>): Map<string, number> {
  const nums = [...values.values()];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min;
  const out = new Map<string, number>();
  for (const [id, v] of values) {
    out.set(id, range === 0 ? 0 : ((v - min) / range) * 100);
  }
  return out;
}

// v4: dynamische herweging. Telt alleen de bronnen die voor dít product
// daadwerkelijk een groeicijfer opleverden, en schaalt hun gewichten naar 100%.
// Zo blijft de score vergelijkbaar tussen producten en drukt een stilgevallen
// bron niet iedereen omlaag — precies de bronspreiding die dit project belooft.
// Geëxporteerd zodat het los te testen is.
export function combineWeighted(
  values: Partial<Record<SourceName, number>>
): number {
  let weighted = 0;
  let weightSum = 0;
  for (const source of SOURCES) {
    const value = values[source];
    if (value === undefined) continue;
    const weight = WEIGHTS[source] ?? 0;
    weighted += weight * value;
    weightSum += weight;
  }
  // Geen enkele bron met data: geen uitspraak mogelijk, dus 0.
  const score = weightSum > 0 ? weighted / weightSum : 0;
  return Math.round(score * 100) / 100;
}

export type ScoreResult = { written: number; skipped: number };

// Haalt ALLE signalen op, met paginering. Cruciaal: Supabase/PostgREST geeft
// standaard maximaal 1000 rijen terug. Zonder deze lus zag de scoring alleen
// de oudste 1000 metingen, waardoor de scores maandenlang bevroren bleven op
// verouderde data terwijl er verse metingen binnenkwamen. Sorteren op de
// unieke `id` houdt de pagina's sluitend (geen overgeslagen of dubbele rijen).
// Geëxporteerd zodat de paginering los te testen is.
export async function fetchAllSignals(supabase: Client): Promise<SignalRow[]> {
  const all: SignalRow[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("signals")
      .select("product_id, source, value, measured_at")
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Signals laden mislukt: ${error.message}`);
    const page = (data ?? []) as SignalRow[];
    all.push(...page);
    if (page.length < PAGE) break;
  }
  return all;
}

export async function computeAndStoreScores(
  supabase: Client,
  snapshotDate: string // 'YYYY-MM-DD'
): Promise<ScoreResult> {
  const rows = await fetchAllSignals(supabase);
  if (rows.length === 0) return { written: 0, skipped: 0 };

  // Groepeer signalen per product en per bron.
  const byProduct = new Map<string, Map<SourceName, SignalRow[]>>();
  for (const row of rows) {
    if (!byProduct.has(row.product_id)) byProduct.set(row.product_id, new Map());
    const sourceMap = byProduct.get(row.product_id)!;
    if (!sourceMap.has(row.source)) sourceMap.set(row.source, []);
    sourceMap.get(row.source)!.push(row);
  }

  const now = Date.now();
  const qualifying: string[] = [];
  let skipped = 0;

  for (const [productId, sourceMap] of byProduct) {
    const all = [...sourceMap.values()].flat();
    const earliest = Math.min(...all.map((s) => +new Date(s.measured_at)));
    if (now - earliest >= MIN_HISTORY_MS) qualifying.push(productId);
    else skipped++;
  }

  if (qualifying.length === 0) return { written: 0, skipped };

  // Ruwe groei per bron. v4: een bron zonder meetbare groei doet NIET mee
  // (geen meting is iets anders dan nulgroei). Producten zonder waarde staan
  // dus niet in de map, en vervuilen ook de min/max van de normalisatie niet.
  const rawBySource = new Map<SourceName, Map<string, number>>();
  for (const source of SOURCES) {
    const map = new Map<string, number>();
    for (const productId of qualifying) {
      const g = growth(byProduct.get(productId)!.get(source) ?? []);
      if (g !== null) map.set(productId, g);
    }
    rawBySource.set(source, map);
  }

  // Normaliseer per bron over uitsluitend de producten die die bron wél hebben.
  const normBySource = new Map<SourceName, Map<string, number>>();
  for (const source of SOURCES) {
    normBySource.set(source, normalize(rawBySource.get(source)!));
  }

  const scored = qualifying
    .map((productId) => {
      const present: Partial<Record<SourceName, number>> = {};
      for (const source of SOURCES) {
        const value = normBySource.get(source)!.get(productId);
        if (value !== undefined) present[source] = value;
      }
      return { productId, score: combineWeighted(present) };
    })
    .sort((a, b) => b.score - a.score);

  // Schrijf één rij per product voor deze snapshotdag.
  const scoreRows = scored.map((s, i) => ({
    product_id: s.productId,
    score: s.score,
    rank: i + 1,
    formula_version: FORMULA_VERSION,
    snapshot_date: snapshotDate,
  }));

  const { error: writeError } = await supabase
    .from("scores")
    .upsert(scoreRows, { onConflict: "product_id,snapshot_date" });
  if (writeError) throw new Error(`Scores schrijven mislukt: ${writeError.message}`);

  return { written: scoreRows.length, skipped };
}
