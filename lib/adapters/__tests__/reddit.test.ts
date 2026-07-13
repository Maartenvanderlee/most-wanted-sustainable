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

function mockPosts(posts: { title: string; selftext?: string }[]) {
  return {
    ok: true,
    json: async () => ({
      data: { children: posts.map((p) => ({ data: p })) },
    }),
  };
}

describe("reddit adapter", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () =>
      mockPosts([
        { title: "Best bamboo toothbrush ever", selftext: "" },
        { title: "Something unrelated", selftext: "no keywords here" },
      ])
    ) as unknown as typeof fetch;
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

  it("faalt geïsoleerd en geeft een lege lijst terug", async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 500,
    })) as unknown as typeof fetch;
    const signals = await adapter.fetchSignals(["bamboo toothbrush"]);
    expect(signals).toEqual([]);
  });
});
