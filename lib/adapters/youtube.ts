// YouTube-adapter: telt het totaal aantal weergaven van video's van de
// afgelopen 30 dagen per zoekwoord (YouTube Data API v3).
// Let op: elke zoekopdracht kost 100 quota-eenheden (10.000/dag).
import type { Signal, SourceAdapter } from "./types";
import { fetchWithRetry, sleep, DELAY_MS } from "./http";
import { getCached, setCached } from "./cache";

const API = "https://www.googleapis.com/youtube/v3";

async function viewsForKeyword(
  keyword: string,
  apiKey: string
): Promise<number | null> {
  const cacheKey = `youtube:${keyword}`;
  const cached = await getCached<number>(cacheKey);
  if (cached !== null) return cached;

  const publishedAfter = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Stap 1: zoek recente video's (id's).
  const searchUrl =
    `${API}/search?part=id&type=video&maxResults=25&order=viewCount` +
    `&publishedAfter=${publishedAfter}&q=${encodeURIComponent(keyword)}` +
    `&key=${apiKey}`;
  const searchRes = await fetchWithRetry(searchUrl);
  if (!searchRes) return null;

  const search = (await searchRes.json()) as {
    items?: { id?: { videoId?: string } }[];
  };
  const ids = (search.items ?? [])
    .map((i) => i.id?.videoId)
    .filter((id): id is string => Boolean(id));
  if (ids.length === 0) {
    await setCached(cacheKey, 0);
    return 0;
  }

  // Stap 2: haal de weergavecijfers op en tel ze op.
  const statsUrl =
    `${API}/videos?part=statistics&id=${ids.join(",")}&key=${apiKey}`;
  const statsRes = await fetchWithRetry(statsUrl);
  if (!statsRes) return null;

  const stats = (await statsRes.json()) as {
    items?: { statistics?: { viewCount?: string } }[];
  };
  const totalViews = (stats.items ?? []).reduce(
    (sum, v) => sum + Number(v.statistics?.viewCount ?? 0),
    0
  );
  await setCached(cacheKey, totalViews);
  return totalViews;
}

export const adapter: SourceAdapter = {
  name: "youtube",

  async fetchSignals(keywords: string[]): Promise<Signal[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn("[youtube] YOUTUBE_API_KEY ontbreekt — bron overgeslagen.");
      return [];
    }

    const measuredAt = new Date().toISOString();
    const signals: Signal[] = [];

    for (const keyword of keywords) {
      try {
        const value = await viewsForKeyword(keyword, apiKey);
        if (value !== null) {
          signals.push({ keyword, source: "youtube", value, measuredAt });
        }
        await sleep(DELAY_MS);
      } catch (err) {
        console.error(`[youtube] mislukt voor "${keyword}":`, err);
        // Doorgaan met het volgende zoekwoord.
      }
    }

    return signals;
  },
};
