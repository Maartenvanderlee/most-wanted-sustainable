// GDELT-adapter: meet hoeveel de wereldwijde nieuwsmedia over een zoekwoord
// berichten (afgelopen week). Gebruikt de officiële, gratis GDELT Doc 2.0 API
// — geen sleutel nodig. Een onafhankelijke "nieuws-buzz"-bron naast zoek- en
// videodata, wat de bronspreiding vergroot.
//
// Twee belangrijke eigenschappen van GDELT waar deze adapter rekening mee houdt:
//  1. GDELT staat maximaal één verzoek per 5 seconden toe. We draaien daarom
//     STRIKT serieel met een ruime pauze — nooit parallel.
//  2. Omdat dat traag is, hanteert de adapter een intern tijdsbudget: hij stopt
//     netjes met wat hij heeft zodra dat budget op is, zodat de pipeline-functie
//     nooit over zijn tijdslimiet gaat. Best-effort, net als Google Trends.
//
// We gebruiken mode=timelinevol: dat geeft het nieuwsvolume als (klein)
// percentage van alle berichtgeving. Dat is veel gevoeliger dan de ruwe
// artikelentelling, die voor nicheproducten vaak 0 is. De absolute schaal maakt
// niet uit: de scoring normaliseert per bron en meet week-op-week groei.
import type { Signal, SourceAdapter } from "./types";
import { fetchWithRetry, sleep } from "./http";
import { getCached, setCached } from "./cache";

const DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc";
const REQUEST_SPACING_MS = 5500; // GDELT: max. 1 verzoek / 5s
const TIME_BUDGET_MS = 180_000; // stop na ~3 min; laat ruimte voor de rest

// Som van het genormaliseerde nieuwsvolume over de afgelopen week voor één term.
async function newsVolume(keyword: string): Promise<number | null> {
  const cacheKey = `gdelt:${keyword}`;
  const cached = await getCached<number>(cacheKey);
  if (cached !== null) return cached;

  // Als exacte frase zoeken (aanhalingstekens) voorkomt losse-woordruis.
  const query = `"${keyword}"`;
  const url =
    `${DOC_API}?query=${encodeURIComponent(query)}` +
    `&mode=timelinevol&timespan=1w&format=json`;

  const res = await fetchWithRetry(url, {
    headers: { "User-Agent": "most-wanted-sustainable/0.1 trend-pipeline" },
  });
  if (!res) return null;

  // GDELT geeft bij overbelasting of een ongeldige query platte tekst i.p.v.
  // JSON terug (bv. "Please limit requests..."); vang dat netjes op.
  let json: { timeline?: { data?: { value?: number }[] }[] };
  try {
    json = (await res.json()) as typeof json;
  } catch {
    return null; // niet cachen: dit is een tijdelijke fout, geen echte 0
  }

  const points = json.timeline?.[0]?.data ?? [];
  const total = points.reduce((sum, p) => sum + (p.value ?? 0), 0);
  await setCached(cacheKey, total);
  return total;
}

export const adapter: SourceAdapter = {
  name: "gdelt_news",

  async fetchSignals(keywords: string[]): Promise<Signal[]> {
    const measuredAt = new Date().toISOString();
    const signals: Signal[] = [];
    const start = Date.now();

    // Strikt serieel met ruime pauze (rate limit), tot het tijdsbudget op is.
    for (const keyword of keywords) {
      if (Date.now() - start > TIME_BUDGET_MS) {
        console.warn(
          `[gdelt] tijdsbudget bereikt; ${signals.length}/${keywords.length} zoekwoorden verwerkt.`
        );
        break;
      }
      try {
        const value = await newsVolume(keyword);
        if (value !== null) {
          signals.push({ keyword, source: "gdelt_news", value, measuredAt });
        }
      } catch (err) {
        console.error(`[gdelt] mislukt voor "${keyword}":`, err);
      }
      await sleep(REQUEST_SPACING_MS);
    }

    return signals;
  },
};
