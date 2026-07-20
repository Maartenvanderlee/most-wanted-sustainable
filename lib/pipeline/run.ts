// De volledige data-pipeline. Bestand voor bestand:
//  1. zoekwoorden inlezen
//  2. producten aanmaken/behouden met status 'pending'
//  3. alle adapters draaien (elke bron faalt geïsoleerd)
//  4. ruwe signalen opslaan (append-only)
//  5. trendscore berekenen en wegschrijven
import { adapters } from "../adapters";
import type { Signal } from "../adapters/types";
import type { TablesInsert } from "../supabase/types";
import { loadSeedKeywords, slugify } from "../keywords";
import { computeAndStoreScores } from "../scoring/score";
import { createPipelineClient } from "./supabase";

// offset + limit maken batches mogelijk: de dagelijkse run is gesplitst in
// twee cron-aanroepen zodat elke helft binnen de Vercel-tijdslimiet blijft.
export type PipelineOptions = { limit?: number; offset?: number };

export type PipelineResult = {
  keywords: number;
  productsUpserted: number;
  signalsBySource: Record<string, number>;
  signalsStored: number;
  scoresWritten: number;
  scoresSkipped: number;
  errors: string[];
};

export async function runPipeline(
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const supabase = createPipelineClient();
  const errors: string[] = [];

  // 1. Zoekwoorden inlezen (optioneel een deelvenster voor batches/testruns).
  let seeds = await loadSeedKeywords();
  const offset = options.offset && options.offset > 0 ? options.offset : 0;
  if (offset > 0) seeds = seeds.slice(offset);
  if (options.limit && options.limit > 0) seeds = seeds.slice(0, options.limit);
  const keywords = seeds.map((s) => s.keyword);

  // 2. Producten aanmaken/behouden (status 'pending' is de standaard).
  //    ignoreDuplicates: bestaande producten worden NIET overschreven,
  //    zodat handmatige curatie (approved/rejected) behouden blijft.
  const productRows: TablesInsert<"products">[] = seeds.map((s) => ({
    name: s.keyword,
    slug: slugify(s.keyword),
    category: s.category,
  }));
  const { error: upsertError } = await supabase
    .from("products")
    .upsert(productRows, { onConflict: "slug", ignoreDuplicates: true });
  if (upsertError) errors.push(`Producten opslaan: ${upsertError.message}`);

  // Slug -> product_id ophalen voor het koppelen van signalen.
  const slugs = productRows.map((p) => p.slug);
  const { data: products, error: readError } = await supabase
    .from("products")
    .select("id, slug")
    .in("slug", slugs);
  if (readError) errors.push(`Producten lezen: ${readError.message}`);
  const idBySlug = new Map((products ?? []).map((p) => [p.slug, p.id]));

  // 3. Alle adapters parallel draaien (scheelt veel tijd; elke bron heeft
  //    intern zijn eigen tempo). Eén falende bron mag de rest niet stoppen.
  const signalsBySource: Record<string, number> = {};
  const allSignals: Signal[] = [];
  const adapterResults = await Promise.all(
    adapters.map(async (adapter) => {
      try {
        return { name: adapter.name, signals: await adapter.fetchSignals(keywords) };
      } catch (err) {
        errors.push(`Bron ${adapter.name}: ${(err as Error).message}`);
        return { name: adapter.name, signals: [] as Signal[] };
      }
    })
  );
  for (const result of adapterResults) {
    signalsBySource[result.name] = result.signals.length;
    allSignals.push(...result.signals);
  }

  // 4. Ruwe signalen opslaan (append-only), PER BRON in een aparte insert.
  //    Zo blijft een bron geïsoleerd: als één bron faalt bij het opslaan
  //    (bijvoorbeeld een nieuwe enum-waarde die pas ná de deploy via een
  //    migratie in de database komt), verliezen we alleen die bron en
  //    blijven de andere bronnen gewoon bewaard.
  const rowsBySource = new Map<string, TablesInsert<"signals">[]>();
  for (const sig of allSignals) {
    const productId = idBySlug.get(slugify(sig.keyword));
    if (!productId) continue;
    const row: TablesInsert<"signals"> = {
      product_id: productId,
      source: sig.source,
      value: sig.value,
      measured_at: sig.measuredAt,
    };
    const list = rowsBySource.get(sig.source) ?? [];
    list.push(row);
    rowsBySource.set(sig.source, list);
  }

  let signalsStored = 0;
  for (const [source, rows] of rowsBySource) {
    const { error: signalError } = await supabase.from("signals").insert(rows);
    if (signalError) errors.push(`Signalen opslaan (${source}): ${signalError.message}`);
    else signalsStored += rows.length;
  }

  // 5. Trendscore berekenen voor vandaag.
  const snapshotDate = new Date().toISOString().slice(0, 10);
  let scoresWritten = 0;
  let scoresSkipped = 0;
  try {
    const result = await computeAndStoreScores(supabase, snapshotDate);
    scoresWritten = result.written;
    scoresSkipped = result.skipped;
  } catch (err) {
    errors.push(`Scores berekenen: ${(err as Error).message}`);
  }

  return {
    keywords: keywords.length,
    productsUpserted: productRows.length,
    signalsBySource,
    signalsStored,
    scoresWritten,
    scoresSkipped,
    errors,
  };
}
