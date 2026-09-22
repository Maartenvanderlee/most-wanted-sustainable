// Bepaalt welke trendscore "de huidige" is voor een product.
//
// Apart van lib/queries.ts gehouden omdat dat bestand de server-only
// Supabase-client importeert en daardoor niet te unit-testen is. Deze module
// krijgt de client als parameter — dezelfde opzet als lib/scoring/score.ts.

export type ScoreRow = {
  product_id: string;
  score: number;
  rank: number;
  snapshot_date: string;
};

export type LatestScore = { score: number; rank: number; snapshot_date: string };

// Minimale vorm van de Supabase-client die deze module nodig heeft.
type QueryClient = { from: (table: string) => any };

// Hoeveel dagen terug we scores ophalen, geteld vanaf de nieuwste snapshot in
// de tabel (niet vanaf vandaag). Zo blijft de ranglijst staan als de pipeline
// een paar dagen stilvalt, en vangen we op dat de pipeline in twee batches
// draait: mist een product de laatste run, dan telt zijn vorige dag nog mee.
export const SCORE_WINDOW_DAYS = 14;

// Begindatum van het venster, SCORE_WINDOW_DAYS vóór de nieuwste snapshot.
export function windowStart(newestSnapshot: string): string {
  const d = new Date(`${newestSnapshot}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - SCORE_WINDOW_DAYS);
  return d.toISOString().slice(0, 10);
}

// Haalt scores op met paginering. Zonder `.range()` geeft Supabase maximaal
// 1000 rijen terug ZONDER foutmelding. De `scores`-tabel groeit met ~100 rijen
// per dag, dus die grens was in augustus 2026 gepasseerd: de site zag alleen
// nog snapshots van 19 juli t/m 13 augustus en toonde daardoor bevroren, voor
// bijna elk product identieke scores. Sorteren op de unieke `id` houdt de
// pagina's sluitend. Zie ook fetchAllSignals in lib/scoring/score.ts — dezelfde
// valkuil, daar in de pipeline.
export async function fetchScoresSince(
  supabase: QueryClient,
  since: string
): Promise<ScoreRow[]> {
  const all: ScoreRow[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("scores")
      .select("product_id, score, rank, snapshot_date")
      .gte("snapshot_date", since)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`Scores laden: ${error.message}`);
    const page = (data ?? []) as ScoreRow[];
    all.push(...page);
    if (page.length < PAGE) break;
  }
  return all;
}

// Pakt per product de meest recente scorerij uit het opgehaalde venster.
export function latestScoreByProduct(scores: ScoreRow[]): Map<string, LatestScore> {
  const map = new Map<string, LatestScore>();
  for (const s of scores) {
    const current = map.get(s.product_id);
    if (!current || s.snapshot_date > current.snapshot_date) {
      map.set(s.product_id, {
        score: s.score,
        rank: s.rank,
        snapshot_date: s.snapshot_date,
      });
    }
  }
  return map;
}

// Haalt het volledige venster op: nieuwste snapshot zoeken, dan de scores van
// de dagen daarvóór. Lege map als er nog geen enkele score bestaat.
export async function getLatestScores(
  supabase: QueryClient
): Promise<Map<string, LatestScore>> {
  const { data: newestRows } = await supabase
    .from("scores")
    .select("snapshot_date")
    .order("snapshot_date", { ascending: false })
    .limit(1);

  const newest = newestRows?.[0]?.snapshot_date;
  if (!newest) return new Map();

  return latestScoreByProduct(await fetchScoresSince(supabase, windowStart(newest)));
}
