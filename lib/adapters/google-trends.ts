// Google Trends-adapter: haalt de "interesse over tijd" per zoekwoord op
// via de onofficiële API. Google blokkeert kale verzoeken (429); daarom
// halen we eerst een sessie-cookie op en sturen die mee, met een korte pauze
// vóór de dataronde. Blijft best-effort: bij fouten slaan we het zoekwoord over.
import type { Signal, SourceAdapter } from "./types";
import { sleep, DELAY_MS } from "./http";
import { getCached, setCached } from "./cache";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Knipt de beveiligingsprefix ()]}',) van de responses af.
function stripPrefix(text: string): string {
  const idx = text.indexOf("{");
  return idx === -1 ? text : text.slice(idx);
}

// Leest eventuele Set-Cookie-headers en houdt de cookiestring actueel.
function mergeCookie(res: Response, current: string): string {
  const set = res.headers?.getSetCookie?.() ?? [];
  const pairs = set.map((c) => c.split(";")[0]);
  return pairs.length ? pairs.join("; ") : current;
}

// Haalt een sessie-cookie op (ook als de pagina zelf 429 geeft, komt de cookie mee).
async function primeCookie(): Promise<string> {
  try {
    const res = await fetch("https://trends.google.com/?geo=NL", {
      headers: { "User-Agent": UA },
    });
    return mergeCookie(res, "");
  } catch {
    return "";
  }
}

async function latestInterest(
  keyword: string,
  cookieRef: { value: string }
): Promise<number | null> {
  const cacheKey = `google_trends:${keyword}`;
  const cached = await getCached<number>(cacheKey);
  if (cached !== null) return cached;

  const headers = () => ({
    "User-Agent": UA,
    Cookie: cookieRef.value,
    Referer: "https://trends.google.com/trends/explore",
  });

  // Stap 1: explore -> widget-token voor de tijdreeks.
  const exploreReq = {
    comparisonItem: [{ keyword, geo: "", time: "today 3-m" }],
    category: 0,
    property: "",
  };
  const exploreUrl =
    `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=` +
    encodeURIComponent(JSON.stringify(exploreReq));
  const exploreRes = await fetch(exploreUrl, { headers: headers() });
  cookieRef.value = mergeCookie(exploreRes, cookieRef.value);
  if (!exploreRes.ok) return null;

  const explore = JSON.parse(stripPrefix(await exploreRes.text())) as {
    widgets?: { id: string; token: string; request: unknown }[];
  };
  const widget = explore.widgets?.find((w) => w.id === "TIMESERIES");
  if (!widget) return null;

  // Stap 2: de tijdreeks ophalen, met pauze en enkele herhaalpogingen (429).
  const dataUrl =
    `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=0&req=` +
    encodeURIComponent(JSON.stringify(widget.request)) +
    `&token=${widget.token}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    await sleep(800 * attempt);
    const dataRes = await fetch(dataUrl, { headers: headers() });
    cookieRef.value = mergeCookie(dataRes, cookieRef.value);
    if (dataRes.ok) {
      const data = JSON.parse(stripPrefix(await dataRes.text())) as {
        default?: { timelineData?: { value?: number[] }[] };
      };
      const timeline = data.default?.timelineData ?? [];
      if (timeline.length === 0) return null;
      const value = timeline[timeline.length - 1].value?.[0] ?? 0;
      await setCached(cacheKey, value);
      return value;
    }
    if (dataRes.status !== 429) return null; // andere fout: niet blijven proberen
  }
  return null;
}

export const adapter: SourceAdapter = {
  name: "google_trends",

  async fetchSignals(keywords: string[]): Promise<Signal[]> {
    const measuredAt = new Date().toISOString();
    const signals: Signal[] = [];
    const cookieRef = { value: await primeCookie() };

    for (const keyword of keywords) {
      try {
        const value = await latestInterest(keyword, cookieRef);
        if (value !== null) {
          signals.push({ keyword, source: "google_trends", value, measuredAt });
        }
        await sleep(DELAY_MS);
      } catch (err) {
        console.error(`[google_trends] mislukt voor "${keyword}":`, err);
      }
    }

    return signals;
  },
};
