import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../cache", () => ({
  getCached: async () => null,
  setCached: async () => {},
}));
vi.mock("../http", async (importActual) => {
  const actual = await importActual<typeof import("../http")>();
  return { ...actual, sleep: async () => {} };
});

import { adapter } from "../wikipedia";

describe("wikipedia adapter", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async (url: string) => {
      if (url.includes("list=search")) {
        return {
          ok: true,
          json: async () => ({
            query: { search: [{ title: "Bamboo toothbrush" }] },
          }),
        };
      }
      // pageviews per-article
      return {
        ok: true,
        json: async () => ({
          items: [{ views: 100 }, { views: 250 }, { views: 50 }],
        }),
      };
    }) as unknown as typeof fetch;
  });

  it("telt paginaweergaven van het best passende artikel op", async () => {
    const signals = await adapter.fetchSignals(["bamboo toothbrush"]);
    expect(signals).toHaveLength(1);
    expect(signals[0].value).toBe(400);
    expect(signals[0].source).toBe("wikipedia");
  });

  it("slaat een zoekwoord zonder passend artikel over", async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ query: { search: [] } }),
    })) as unknown as typeof fetch;
    const signals = await adapter.fetchSignals(["iets heel obscuurs"]);
    expect(signals).toEqual([]);
  });
});
