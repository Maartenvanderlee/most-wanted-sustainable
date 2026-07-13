// Reddit-adapter: telt hoe vaak elk zoekwoord voorkomt in de topposts
// (afgelopen week) van een paar duurzaamheids-subreddits.
import type { Signal, SourceAdapter } from "./types";
import { fetchWithRetry, sleep, DELAY_MS } from "./http";
import { getCached, setCached } from "./cache";

const SUBREDDITS = [
  "BuyItForLife",
  "ZeroWaste",
  "sustainability",
  "Anticonsumption",
];

// Reddit vereist een herkenbare User-Agent.
const HEADERS = { "User-Agent": "most-wanted-sustainable/0.1 (pipeline)" };

type RedditPost = { title?: string; selftext?: string };

async function fetchSubredditText(subreddit: string): Promise<string[]> {
  const cacheKey = `reddit:${subreddit}`;
  const cached = await getCached<string[]>(cacheKey);
  if (cached) return cached;

  const url = `https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=100`;
  const res = await fetchWithRetry(url, { headers: HEADERS });
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
    const measuredAt = new Date().toISOString();
    const allTexts: string[] = [];

    for (const subreddit of SUBREDDITS) {
      try {
        const texts = await fetchSubredditText(subreddit);
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
