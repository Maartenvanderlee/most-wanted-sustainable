import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../cache", () => ({
  getCached: async () => null,
  setCached: async () => {},
}));
vi.mock("../http", async (importActual) => {
  const actual = await importActual<typeof import("../http")>();
  return { ...actual, sleep: async () => {} };
});

import { adapter } from "../gdelt";

describe("gdelt adapter", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        timeline: [
          { data: [{ value: 10 }, { value: 20 }, { value: 5 }] },
        ],
      }),
    })) as unknown as typeof fetch;
  });

  it("telt het nieuwsvolume over de week op", async () => {
    const signals = await adapter.fetchSignals(["solar power bank"]);
    expect(signals).toHaveLength(1);
    expect(signals[0].value).toBe(35);
    expect(signals[0].source).toBe("gdelt_news");
  });

  it("slaat een zoekwoord over als GDELT geen geldige JSON teruggeeft (bv. rate-limit-melding)", async () => {
    // Een niet-JSON-antwoord is een tijdelijke fout, geen echte nul: we slaan
    // dit zoekwoord over in plaats van een misleidende 0 vast te leggen.
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => {
        throw new Error("not json");
      },
    })) as unknown as typeof fetch;
    const signals = await adapter.fetchSignals(["solar power bank"]);
    expect(signals).toEqual([]);
  });
});
