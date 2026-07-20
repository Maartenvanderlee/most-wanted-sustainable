// Wikipedia-adapter: meet de aandacht voor een zoekwoord aan de hand van het
// aantal paginaweergaven van het best passende Wikipedia-artikel (laatste 30
// dagen). Gebruikt uitsluitend officiële, gratis Wikimedia-API's — geen
// sleutel nodig. Onafhankelijk van Google, dus goede bronspreiding.
import type { Signal, SourceAdapter } from "./types";
import { fetchWithRetry, sleep, DELAY_MS } from "./http";
import { getCached, setCached } from "./cache";

// Wikimedia vraagt om een herkenbare User-Agent met contactinfo.
const UA =
  "most-wanted-sustainable/0.1 (https://most-wanted-sustainable.vercel.app) trend-pipeline";
const SEARCH_API = "https://en.wikipedia.org/w/api.php";
const PAGEVIEWS_API =
  "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user";

function yyyymmdd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

// Zoekt de titel van het best passende Engelstalige Wikipedia-artikel.
async function findArticleTitle(keyword: string): Promise<string | null> {
  const cacheKey = `wikipedia:title:${keyword}`;
  const cached = await getCached<string | null>(cacheKey);
  if (cached !== null) return cached === "" ? null : cached;

  const url =
    `${SEARCH_API}?action=query&list=search&format=json&srlimit=1` +
    `&srsearch=${encodeURIComponent(keyword)}`;
  const res = await fetchWithRetry(url, { headers: { "User-Agent": UA } });
  if (!res) return null;

  const json = (await res.json()) as {
    query?: { search?: { title?: string }[] };
  };
  const title = json.query?.search?.[0]?.title ?? null;
  await setCached(cacheKey, title ?? ""); // "" onthoudt "geen artikel"
  return title;
}

// Telt de paginaweergaven van de afgelopen 30 dagen voor een artikeltitel.
async function pageviewsForTitle(title: string): Promise<number | null> {
  const cacheKey = `wikipedia:views:${title}`;
  const cached = await getCached<number>(cacheKey);
  if (cached !== null) return cached;

  // Wikimedia loopt 1-2 dagen achter; vraag een ruim venster op.
  const end = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const article = encodeURIComponent(title.replace(/ /g, "_"));
  const url = `${PAGEVIEWS_API}/${article}/daily/${yyyymmdd(start)}/${yyyymmdd(end)}`;

  const res = await fetchWithRetry(url, { headers: { "User-Agent": UA } });
  if (!res) return null;

  const json = (await res.json()) as { items?: { views?: number }[] };
  const total = (json.items ?? []).reduce((sum, i) => sum + (i.views ?? 0), 0);
  await setCached(cacheKey, total);
  return total;
}

export const adapter: SourceAdapter = {
  name: "wikipedia",

  async fetchSignals(keywords: string[]): Promise<Signal[]> {
    const measuredAt = new Date().toISOString();
    const signals: Signal[] = [];

    // In groepjes: Wikimedia is ruimhartig maar we blijven netjes.
    const CHUNK = 5;
    for (let i = 0; i < keywords.length; i += CHUNK) {
      const chunk = keywords.slice(i, i + CHUNK);
      const results = await Promise.all(
        chunk.map(async (keyword): Promise<Signal | null> => {
          try {
            const title = await findArticleTitle(keyword);
            if (!title) return null; // geen passend artikel: bron mist voor dit woord
            const views = await pageviewsForTitle(title);
            return views !== null
              ? { keyword, source: "wikipedia", value: views, measuredAt }
              : null;
          } catch (err) {
            console.error(`[wikipedia] mislukt voor "${keyword}":`, err);
            return null;
          }
        })
      );
      signals.push(...results.filter((s): s is Signal => s !== null));
      await sleep(DELAY_MS);
    }

    return signals;
  },
};
