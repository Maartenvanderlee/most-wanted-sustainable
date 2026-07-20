// eBay-adapter: meet de marktactiviteit voor een zoekwoord aan het aantal
// actieve aanbiedingen op eBay. Dit is een écht commerce-signaal (vraag/aanbod
// in een marktplaats), niet alleen online buzz — waardevol om te toetsen of
// een trend ook tot handel leidt.
//
// Gebruikt de officiële eBay Browse API. Die vereist gratis app-sleutels
// (client id + secret → een application access token via client_credentials).
// Zonder die sleutels slaat de bron zichzelf over — precies zoals de
// Reddit-adapter. Zo staat eBay klaar zodra je een eBay-developeraccount hebt.
import type { Signal, SourceAdapter } from "./types";
import { fetchWithRetry, sleep, DELAY_MS } from "./http";
import { getCached, setCached } from "./cache";

const OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const BROWSE_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const SCOPE = "https://api.ebay.com/oauth/api_scope";

// Haalt een application access token op (client_credentials; geen gebruiker).
async function getAccessToken(): Promise<string | null> {
  const id = process.env.EBAY_CLIENT_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) return null;

  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetchWithRetry(OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&scope=${encodeURIComponent(SCOPE)}`,
  });
  if (!res) return null;

  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

// Aantal actieve aanbiedingen voor een zoekwoord (het total-veld).
async function listingCount(
  keyword: string,
  token: string
): Promise<number | null> {
  const cacheKey = `ebay:${keyword}`;
  const cached = await getCached<number>(cacheKey);
  if (cached !== null) return cached;

  const url = `${BROWSE_URL}?q=${encodeURIComponent(keyword)}&limit=1`;
  const res = await fetchWithRetry(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      // Levering naar NL, zodat het aanbod bij onze markt past.
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_NL",
    },
  });
  if (!res) return null;

  const json = (await res.json()) as { total?: number };
  const total = json.total ?? 0;
  await setCached(cacheKey, total);
  return total;
}

export const adapter: SourceAdapter = {
  name: "ebay",

  async fetchSignals(keywords: string[]): Promise<Signal[]> {
    const token = await getAccessToken();
    if (!token) {
      console.warn(
        "[ebay] EBAY_CLIENT_ID/SECRET ontbreken of token mislukt — bron overgeslagen."
      );
      return [];
    }

    const measuredAt = new Date().toISOString();
    const signals: Signal[] = [];

    const CHUNK = 5;
    for (let i = 0; i < keywords.length; i += CHUNK) {
      const chunk = keywords.slice(i, i + CHUNK);
      const results = await Promise.all(
        chunk.map(async (keyword): Promise<Signal | null> => {
          try {
            const value = await listingCount(keyword, token);
            return value !== null
              ? { keyword, source: "ebay", value, measuredAt }
              : null;
          } catch (err) {
            console.error(`[ebay] mislukt voor "${keyword}":`, err);
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
