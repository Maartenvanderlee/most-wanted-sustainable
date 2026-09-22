// Regressietest voor de paginering van de scores-query.
//
// Achtergrond: een kale Supabase-select geeft maximaal 1000 rijen terug ZONDER
// foutmelding. De scores-tabel groeit met ~100 rijen per dag, dus die grens werd
// in augustus 2026 stil gepasseerd. De homepage zag daarna alleen nog snapshots
// t/m 13 augustus en toonde voor bijna elk product dezelfde, bevroren score.
// Dezelfde valkuil zat eerder in fetchAllSignals (zie lib/scoring/__tests__).
import { describe, it, expect } from "vitest";
import {
  fetchScoresSince,
  publicRanks,
  type LatestScore,
  type ScoreRow,
} from "../score-window";

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

describe("publicRanks (afgewezen producten tellen niet mee)", () => {
  const score = (s: number, rank: number): LatestScore => ({
    score: s,
    rank,
    snapshot_date: "2026-09-22",
  });

  it("nummert zonder gaten, ook als er afgewezen producten tussen zitten", () => {
    // De pipeline meet vier producten; 'afgewezen' staat op plek 2 en hoort
    // niet in de publieke lijst. Zonder deze fix werd het #1, #3, #4.
    const latest = new Map<string, LatestScore>([
      ["goed-a", score(50, 1)],
      ["afgewezen", score(40, 2)],
      ["goed-b", score(30, 3)],
      ["goed-c", score(20, 4)],
    ]);

    const ranks = publicRanks(["goed-a", "goed-b", "goed-c"], latest);

    expect([...ranks.entries()]).toEqual([
      ["goed-a", 1],
      ["goed-b", 2],
      ["goed-c", 3],
    ]);
    expect(ranks.has("afgewezen")).toBe(false);
  });

  it("gaat op score, niet op de opgeslagen rang", () => {
    const latest = new Map<string, LatestScore>([
      ["laag", score(1, 1)],
      ["hoog", score(99, 2)],
    ]);

    const ranks = publicRanks(["laag", "hoog"], latest);

    expect(ranks.get("hoog")).toBe(1);
    expect(ranks.get("laag")).toBe(2);
  });

  it("geeft bij gelijke scores een stabiele volgorde", () => {
    const latest = new Map<string, LatestScore>([
      ["b", score(7.02, 15)],
      ["a", score(7.02, 14)],
    ]);

    // Zelfde invoer in een andere volgorde moet hetzelfde resultaat geven.
    expect(publicRanks(["a", "b"], latest).get("a")).toBe(1);
    expect(publicRanks(["b", "a"], latest).get("a")).toBe(1);
  });

  it("slaat producten zonder score over in plaats van ze bovenaan te zetten", () => {
    const latest = new Map<string, LatestScore>([["met-score", score(10, 1)]]);

    const ranks = publicRanks(["nieuw", "met-score"], latest);

    expect(ranks.get("met-score")).toBe(1);
    expect(ranks.has("nieuw")).toBe(false);
  });
});
