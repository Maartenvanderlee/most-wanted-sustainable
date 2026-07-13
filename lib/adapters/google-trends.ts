// Google Trends-adapter: haalt de "interesse over tijd" per zoekwoord op
// via de onofficiële API. Deze API is niet gegarandeerd stabiel; bij elke
// fout slaan we het zoekwoord over (nooit gooien).
import type { Signal, SourceAdapter } from "./types";
import { fetchWithRetry, sleep, DELAY_MS } from "./http";
import { getCached, setCached } from "./cache";

// De responses beginnen met een beveiligingsprefix die we eraf knippen.
function stripPrefix(text: string): string {
  const idx = text.indexOf("{");
  const arrIdx = text.indexOf("[");
  const start =
    idx === -1 ? arrIdx : arrIdx === -1 ? idx : Math.min(idx, arrIdx);
  return start === -1 ? text : text.slice(start);
}

async function latestInterest(keyword: string): Promise<number | null> {
  const cacheKey = `google_trends:${keyword}`;
  const cached = await getCached<number>(cacheKey);
  if (cached !== null) return cached;

  // Stap 1: explore -> widget-token voor de tijdreeks ophalen.
  const exploreReq = {
    comparisonItem: [{ keyword, geo: "", time: "today 3-m" }],
    category: 0,
    property: "",
  };
  const exploreUrl =
    `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=` +
    encodeURIComponent(JSON.stringify(exploreReq));
  const exploreRes = await fetchWithRetry(exploreUrl);
  if (!exploreRes) return null;

  const explore = JSON.parse(stripPrefix(await exploreRes.text())) as {
    widgets?: { id: string; token: string; request: unknown }[];
  };
  const widget = explore.widgets?.find((w) => w.id === "TIMESERIES");
  if (!widget) return null;

  // Stap 2: de eigenlijke tijdreeks ophalen.
  const dataUrl =
    `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=0&req=` +
    encodeURIComponent(JSON.stringify(widget.request)) +
    `&token=${widget.token}`;
  const dataRes = await fetchWithRetry(dataUrl);
  if (!dataRes) return null;

  const data = JSON.parse(stripPrefix(await dataRes.text())) as {
    default?: { timelineData?: { value?: number[] }[] };
  };
  const timeline = data.default?.timelineData ?? [];
  if (timeline.length === 0) return null;

  // Laatste beschikbare waarde als ruwe interesse-indicator.
  const last = timeline[timeline.length - 1];
  const value = last.value?.[0] ?? 0;
  await setCached(cacheKey, value);
  return value;
}

export const adapter: SourceAdapter = {
  name: "google_trends",

  async fetchSignals(keywords: string[]): Promise<Signal[]> {
    const measuredAt = new Date().toISOString();
    const signals: Signal[] = [];

    for (const keyword of keywords) {
      try {
        const value = await latestInterest(keyword);
        if (value !== null) {
          signals.push({ keyword, source: "google_trends", value, measuredAt });
        }
        await sleep(DELAY_MS);
      } catch (err) {
        console.error(`[google_trends] mislukt voor "${keyword}":`, err);
        // Doorgaan met het volgende zoekwoord.
      }
    }

    return signals;
  },
};
