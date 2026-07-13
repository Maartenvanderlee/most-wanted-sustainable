import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../cache", () => ({
  getCached: async () => null,
  setCached: async () => {},
}));
vi.mock("../http", async (importActual) => {
  const actual = await importActual<typeof import("../http")>();
  return { ...actual, sleep: async () => {} };
});

import { adapter } from "../youtube";

describe("youtube adapter", () => {
  beforeEach(() => {
    process.env.YOUTUBE_API_KEY = "test-key";
    global.fetch = vi.fn(async (url: string) => {
      if (url.includes("/search")) {
        return {
          ok: true,
          json: async () => ({
            items: [{ id: { videoId: "a" } }, { id: { videoId: "b" } }],
          }),
        };
      }
      // /videos: weergavecijfers
      return {
        ok: true,
        json: async () => ({
          items: [
            { statistics: { viewCount: "1000" } },
            { statistics: { viewCount: "500" } },
          ],
        }),
      };
    }) as unknown as typeof fetch;
  });

  it("telt weergaven van recente video's op", async () => {
    const signals = await adapter.fetchSignals(["solar power bank"]);
    expect(signals).toHaveLength(1);
    expect(signals[0].value).toBe(1500);
    expect(signals[0].source).toBe("youtube");
  });

  it("slaat de bron over zonder API-sleutel", async () => {
    delete process.env.YOUTUBE_API_KEY;
    const signals = await adapter.fetchSignals(["solar power bank"]);
    expect(signals).toEqual([]);
  });
});
