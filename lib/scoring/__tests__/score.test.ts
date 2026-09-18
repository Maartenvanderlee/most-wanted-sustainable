import { describe, it, expect } from "vitest";
import { WEIGHTS } from "../version";
import {
  combineWeighted,
  fetchAllSignals,
  growth,
  normalize,
  type SignalRow,
} from "../score";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

function signal(value: number, ageDays: number): SignalRow {
  return {
    product_id: "p1",
    source: "reddit",
    value,
    measured_at: daysAgo(ageDays),
  };
}

describe("growth (week-op-week)", () => {
  it("berekent positieve groei tussen vorige week en nu", () => {
    // Vorige week 10, nu 15 -> (15-10)/10 = 0.5
    const g = growth([signal(10, 8), signal(15, 0)]);
    expect(g).toBeCloseTo(0.5);
  });

  it("berekent negatieve groei (daling)", () => {
    const g = growth([signal(20, 8), signal(10, 0)]);
    expect(g).toBeCloseTo(-0.5);
  });

  it("geeft null bij te weinig historie (geen meting van ~een week terug)", () => {
    expect(growth([signal(5, 1), signal(9, 0)])).toBeNull();
    expect(growth([signal(9, 0)])).toBeNull();
  });

  it("deelt nooit door nul als de vorige waarde 0 was", () => {
    // (5-0)/max(0,1) = 5
    expect(growth([signal(0, 8), signal(5, 0)])).toBeCloseTo(5);
  });
});

describe("normalize (min-max naar 0-100)", () => {
  it("schaalt de laagste naar 0 en de hoogste naar 100", () => {
    const out = normalize(
      new Map([
        ["a", 0],
        ["b", 5],
        ["c", 10],
      ])
    );
    expect(out.get("a")).toBe(0);
    expect(out.get("b")).toBe(50);
    expect(out.get("c")).toBe(100);
  });

  it("geeft 0 voor iedereen als alle waarden gelijk zijn (geen deling door nul)", () => {
    const out = normalize(
      new Map([
        ["a", 7],
        ["b", 7],
      ])
    );
    expect(out.get("a")).toBe(0);
    expect(out.get("b")).toBe(0);
  });
});

// Regressietest voor een bug die de scores maandenlang bevroor: Supabase geeft
// standaard max 1000 rijen terug, dus zonder paginering zag de scoring alleen
// de oudste 1000 metingen en veranderde de uitkomst nooit meer.
describe("fetchAllSignals (paginering)", () => {
  function fakeClient(totalRows: number) {
    const calls: { from: number; to: number }[] = [];
    const rows: SignalRow[] = Array.from({ length: totalRows }, (_, i) => ({
      product_id: `p${i}`,
      source: "youtube",
      value: i,
      measured_at: new Date().toISOString(),
    }));
    const client = {
      from: () => ({
        select: () => ({
          order: () => ({
            range: async (from: number, to: number) => {
              calls.push({ from, to });
              return { data: rows.slice(from, to + 1), error: null };
            },
          }),
        }),
      }),
    };
    return { client, calls };
  }

  it("haalt ALLE rijen op, niet alleen de eerste 1000", async () => {
    const { client, calls } = fakeClient(2500);
    const out = await fetchAllSignals(client as never);
    expect(out).toHaveLength(2500);
    expect(calls.length).toBe(3); // 0-999, 1000-1999, 2000-2999
  });

  it("stopt na één pagina als er minder dan 1000 rijen zijn", async () => {
    const { client, calls } = fakeClient(42);
    const out = await fetchAllSignals(client as never);
    expect(out).toHaveLength(42);
    expect(calls.length).toBe(1);
  });

  it("stopt netjes bij precies 1000 rijen (lege vervolgpagina)", async () => {
    const { client, calls } = fakeClient(1000);
    const out = await fetchAllSignals(client as never);
    expect(out).toHaveLength(1000);
    expect(calls.length).toBe(2);
  });
});

describe("combineWeighted (v4: dynamische herweging)", () => {
  it("gebruikt de volle 0-100 schaal als maar één bron data heeft", () => {
    // Vóór v4 leverde dit 0,40 * 100 = 40 op: een stille bron drukte de score.
    expect(combineWeighted({ google_trends: 100 })).toBe(100);
  });

  it("weegt meerdere bronnen naar verhouding van hun gewicht", () => {
    // Afgeleid van WEIGHTS zelf, zodat deze test blijft kloppen na een
    // herweging: alleen Trends scoort 100, YouTube 0.
    const wt = WEIGHTS.google_trends ?? 0;
    const wy = WEIGHTS.youtube ?? 0;
    const verwacht = (wt * 100) / (wt + wy);
    expect(combineWeighted({ google_trends: 100, youtube: 0 })).toBeCloseTo(
      verwacht,
      1
    );
  });

  it("behoudt de onderlinge verhouding bij alle actieve bronnen", () => {
    // Alles 100 -> nog steeds 100, ongeacht hoeveel bronnen meedoen.
    const alles = Object.fromEntries(
      Object.keys(WEIGHTS).map((s) => [s, 100])
    );
    expect(combineWeighted(alles)).toBe(100);
  });

  it("negeert een bron die niet (meer) meeweegt, zoals Wikipedia op standby", () => {
    // Wikipedia zit niet in WEIGHTS; een waarde ervoor mag de score niet raken.
    const zonder = combineWeighted({ google_trends: 60 });
    const met = combineWeighted({ google_trends: 60, wikipedia: 100 });
    expect(met).toBe(zonder);
  });

  it("straft een product niet af omdat een bron niets mat", () => {
    // Twee producten die even hard groeien op de bronnen die ze delen,
    // horen gelijk te scoren ook al heeft er één extra data van een
    // schaarse bron die eveneens 100 is.
    const zonderGdelt = combineWeighted({ google_trends: 80, youtube: 80 });
    const metGdelt = combineWeighted({
      google_trends: 80,
      youtube: 80,
      gdelt_news: 80,
    });
    expect(zonderGdelt).toBe(metGdelt);
  });

  it("geeft 0 als geen enkele bron data had (geen uitspraak mogelijk)", () => {
    expect(combineWeighted({})).toBe(0);
  });
});
