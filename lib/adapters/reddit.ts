// Reddit-adapter: telt hoe vaak elk zoekwoord voorkomt in de topposts
// (afgelopen week) van een paar duurzaamheids-subreddits.
//
// Reddit blokkeert niet-ingelogde verzoeken, dus we gebruiken "app-only"
// OAuth (client_credentials): met een gratis Reddit-app krijg je een
// client id + secret. Zonder die sleutels slaat de bron zichzelf over.
import type { Signal, SourceAdapter } from "./types";
import { fetchWithRetry, sleep, DELAY_MS } from "./http";
import { getCached, setCached } from "./cache";

const SUBREDDITS = [
  "BuyItForLife",
  "ZeroWaste",
  "sustainability",
  "Anticonsumption",
];

// Reddit vereist een herkenbare, unieke User-Agent.
const USER_AGENT = "windows:most-wanted-sustainable:v0.1 (trend pipeline)";

type RedditPost = { title?: string; selftext?: string };

// Haalt een app-only OAuth-token op (geldig ~1u). Geen gebruikerslogin nodig.
async function getAccessToken(): Promise<string | null> {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;

  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetchWithRetry("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });
  if (!res) return null;

  const json = (await res.json()) as { access_token?: string };
  return json.access_token ?? null;
}

async function fetchSubredditText(
  subreddit: string,
  token: string
): Promise<string[]> {
  const cacheKey = `reddit:${subreddit}`;
  const cached = await getCached<string[]>(cacheKey);
  if (cached) return cached;

  const url = `https://oauth.reddit.com/r/${subreddit}/top.json?t=week&limit=100`;
  const res = await fetchWithRetry(url, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": USER_AGENT },
  });
  if (!res) return [];

  const json = (await res.json()) as {
    data?: { children?: { data?: RedditPost }[] };
  };
  const posts = json.data?.children ?? [];
  const texts = posts.map((p) =>
    `${p.data?.title ?? ""} ${p.data?.selftext ?? ""}`.toLowerCase()
  );
  await setCached(cacheKey, texts);
  return texts;
}

export const adapter: SourceAdapter = {
  name: "reddit",

  async fetchSignals(keywords: string[]): Promise<Signal[]> {
    const token = await getAccessToken();
    if (!token) {
      console.warn(
        "[reddit] REDDIT_CLIENT_ID/SECRET ontbreken of token mislukt — bron overgeslagen."
      );
      return [];
    }

    const measuredAt = new Date().toISOString();
    const allTexts: string[] = [];

    for (const subreddit of SUBREDDITS) {
      try {
        const texts = await fetchSubredditText(subreddit, token);
        allTexts.push(...texts);
        await sleep(DELAY_MS);
      } catch (err) {
        console.error(`[reddit] subreddit "${subreddit}" mislukt:`, err);
        // Doorgaan met de volgende subreddit — nooit gooien.
      }
    }

    // Niets opgehaald: geef een lege lijst terug (pipeline draait door).
    if (allTexts.length === 0) return [];

    return keywords.map((keyword) => {
      const needle = keyword.toLowerCase();
      const count = allTexts.reduce(
        (n, text) => (text.includes(needle) ? n + 1 : n),
        0
      );
      return { keyword, source: "reddit", value: count, measuredAt };
    });
  },
};
