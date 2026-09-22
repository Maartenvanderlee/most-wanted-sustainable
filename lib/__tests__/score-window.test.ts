// Regressietest voor de paginering van de scores-query.
//
// Achtergrond: een kale Supabase-select geeft maximaal 1000 rijen terug ZONDER
// foutmelding. De scores-tabel groeit met ~100 rijen per dag, dus die grens werd
// in augustus 2026 stil gepasseerd. De homepage zag daarna alleen nog snapshots
// t/m 13 augustus en toonde voor bijna elk product dezelfde, bevroren score.
// Dezelfde valkuil zat eerder in fetchAllSignals (zie lib/scoring/__tests__).
import { describe, it, expect } from "vitest";
import { fetchScoresSince, type ScoreRow } from "../score-window";

function fakeClient(totalRows: number) {
  const calls: { from: number; to: number }[] = [];
  const gteValues: string[] = [];
  const rows: ScoreRow[] = Array.from({ length: totalRows }, (_, i) => ({
    product_id: `p${i}`,
    score: i,
    rank: i + 1,
    snapshot_date: "2026-09-21",
  }));

  const client = {
    from: () => ({
      select: () => ({
        gte: (_column: string, value: string) => {
          gteValues.push(value);
          return {
            order: () => ({
              range: async (from: number, to: number) => {
                calls.push({ from, to });
                return { data: rows.slice(from, to + 1), error: null };
              },
            }),
          };
        },
      }),
    }),
  };

  return { client, calls, gteValues };
}

describe("fetchScoresSince (paginering)", () => {
  it("haalt ALLE rijen op, niet alleen de eerste 1000", async () => {
    const { client, calls } = fakeClient(2500);

    const rows = await fetchScoresSince(client, "2026-09-07");

    expect(rows).toHaveLength(2500);
    expect(calls).toEqual([
      { from: 0, to: 999 },
      { from: 1000, to: 1999 },
      { from: 2000, to: 2999 },
    ]);
  });

  it("stopt na één pagina als er minder dan 1000 rijen zijn", async () => {
    const { client, calls } = fakeClient(120);

    const rows = await fetchScoresSince(client, "2026-09-07");

    expect(rows).toHaveLength(120);
    expect(calls).toHaveLength(1);
  });

  it("geeft een lege lijst terug als er niets in het venster valt", async () => {
    const { client } = fakeClient(0);

    expect(await fetchScoresSince(client, "2026-09-07")).toEqual([]);
  });

  it("filtert op de meegegeven begindatum", async () => {
    const { client, gteValues } = fakeClient(10);

    await fetchScoresSince(client, "2026-09-07");

    expect(gteValues).toEqual(["2026-09-07"]);
  });

  it("gooit een fout door in plaats van stil een halve lijst terug te geven", async () => {
    const client = {
      from: () => ({
        select: () => ({
          gte: () => ({
            order: () => ({
              range: async () => ({ data: null, error: { message: "boem" } }),
            }),
          }),
        }),
      }),
    };

    await expect(fetchScoresSince(client, "2026-09-07")).rejects.toThrow(
      "Scores laden: boem"
    );
  });
});
