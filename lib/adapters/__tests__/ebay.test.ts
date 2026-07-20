import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../cache", () => ({
  getCached: async () => null,
  setCached: async () => {},
}));
vi.mock("../http", async (importActual) => {
  const actual = await importActual<typeof import("../http")>();
  return { ...actual, sleep: async () => {} };
});

import { adapter } from "../ebay";

describe("ebay adapter", () => {
  beforeEach(() => {
    process.env.EBAY_CLIENT_ID = "test-id";
    process.env.EBAY_CLIENT_SECRET = "test-secret";
    global.fetch = vi.fn(async (url: string) => {
      if (url.includes("/oauth2/token")) {
        return { ok: true, json: async () => ({ access_token: "tok" }) };
      }
      // Browse API: item_summary/search
      return { ok: true, json: async () => ({ total: 1234 }) };
    }) as unknown as typeof fetch;
  });

  it("gebruikt het aantal actieve aanbiedingen als signaal", async () => {
    const signals = await adapter.fetchSignals(["safety razor"]);
    expect(signals).toHaveLength(1);
    expect(signals[0].value).toBe(1234);
    expect(signals[0].source).toBe("ebay");
  });

  it("slaat de bron over zonder API-sleutels", async () => {
    delete process.env.EBAY_CLIENT_ID;
    delete process.env.EBAY_CLIENT_SECRET;
    const signals = await adapter.fetchSignals(["safety razor"]);
    expect(signals).toEqual([]);
  });
});
