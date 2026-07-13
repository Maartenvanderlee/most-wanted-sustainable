import { describe, it, expect, vi, beforeEach } from "vitest";

// Cache uitschakelen en de wachttijd tussen requests op nul zetten.
vi.mock("../cache", () => ({
  getCached: async () => null,
  setCached: async () => {},
}));
vi.mock("../http", async (importActual) => {
  const actual = await importActual<typeof import("../http")>();
  return { ...actual, sleep: async () => {} };
});

import { adapter } from "../reddit";

function postsResponse(posts: { title: string; selftext?: string }[]) {
  return {
    ok: true,
    json: async () => ({
      data: { children: posts.map((p) => ({ data: p })) },
    }),
  };
}

// Bootst zowel het token-endpoint als de data-endpoints na.
function mockRedditFetch(posts: { title: string; selftext?: string }[]) {
  return vi.fn(async (url: string) => {
    if (url.includes("access_token")) {
      return { ok: true, json: async () => ({ access_token: "test-token" }) };
    }
    return postsResponse(posts);
  }) as unknown as typeof fetch;
}

describe("reddit adapter", () => {
  beforeEach(() => {
    process.env.REDDIT_CLIENT_ID = "id";
    process.env.REDDIT_CLIENT_SECRET = "secret";
    global.fetch = mockRedditFetch([
      { title: "Best bamboo toothbrush ever", selftext: "" },
      { title: "Something unrelated", selftext: "no keywords here" },
    ]);
  });

  it("telt hoe vaak een zoekwoord voorkomt", async () => {
    const signals = await adapter.fetchSignals([
      "bamboo toothbrush",
      "unicorn widget",
    ]);
    const bamboo = signals.find((s) => s.keyword === "bamboo toothbrush");
    const unicorn = signals.find((s) => s.keyword === "unicorn widget");

    // 4 subreddits × 1 passende post = 4.
    expect(bamboo?.value).toBe(4);
    expect(unicorn?.value).toBe(0);
    expect(bamboo?.source).toBe("reddit");
  });

  it("slaat de bron over zonder client-sleutels", async () => {
    delete process.env.REDDIT_CLIENT_ID;
    delete process.env.REDDIT_CLIENT_SECRET;
    const signals = await adapter.fetchSignals(["bamboo toothbrush"]);
    expect(signals).toEqual([]);
  });

  it("faalt geïsoleerd en geeft een lege lijst terug", async () => {
    // Token lukt, maar de data-endpoints geven een fout.
    global.fetch = vi.fn(async (url: string) => {
      if (url.includes("access_token")) {
        return { ok: true, json: async () => ({ access_token: "t" }) };
      }
      return { ok: false, status: 500 };
    }) as unknown as typeof fetch;
    const signals = await adapter.fetchSignals(["bamboo toothbrush"]);
    expect(signals).toEqual([]);
  });
});
