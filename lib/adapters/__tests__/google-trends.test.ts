import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../cache", () => ({
  getCached: async () => null,
  setCached: async () => {},
}));
vi.mock("../http", async (importActual) => {
  const actual = await importActual<typeof import("../http")>();
  return { ...actual, sleep: async () => {} };
});

import { adapter } from "../google-trends";

// Google Trends-responses beginnen met een beveiligingsprefix.
const PREFIX = ")]}',\n";

describe("google trends adapter", () => {
  beforeEach(() => {
    global.fetch = vi.fn(async (url: string) => {
      if (url.includes("/explore")) {
        return {
          ok: true,
          text: async () =>
            PREFIX +
            JSON.stringify({
              widgets: [
                { id: "TIMESERIES", token: "tok", request: { foo: 1 } },
              ],
            }),
        };
      }
      // /widgetdata/multiline: de tijdreeks
      return {
        ok: true,
        text: async () =>
          PREFIX +
          JSON.stringify({
            default: {
              timelineData: [{ value: [10] }, { value: [42] }],
            },
          }),
      };
    }) as unknown as typeof fetch;
  });

  it("neemt de laatste interesse-waarde als ruwe waarde", async () => {
    const signals = await adapter.fetchSignals(["cork yoga mat"]);
    expect(signals).toHaveLength(1);
    expect(signals[0].value).toBe(42);
    expect(signals[0].source).toBe("google_trends");
  });

  it("slaat een zoekwoord over als de tijdreeks-widget ontbreekt", async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      text: async () => PREFIX + JSON.stringify({ widgets: [] }),
    })) as unknown as typeof fetch;
    const signals = await adapter.fetchSignals(["cork yoga mat"]);
    expect(signals).toEqual([]);
  });
});
