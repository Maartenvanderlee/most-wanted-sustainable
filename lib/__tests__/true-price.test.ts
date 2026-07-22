import { describe, expect, it } from "vitest";
import {
  CO2_SHADOW_PRICE_EUR_PER_KG,
  formatHiddenCost,
  hiddenCo2CostEur,
  kmEquivalent,
  suggestCo2KgPerYear,
  treeMonthsEquivalent,
} from "../true-price";

describe("hiddenCo2CostEur / formatHiddenCost", () => {
  it("rekent kg om via de CE Delft-schaduwprijs", () => {
    expect(hiddenCo2CostEur(24)).toBeCloseTo(24 * CO2_SHADOW_PRICE_EUR_PER_KG);
  });

  it("toont kleine bedragen als <€1 in plaats van €0", () => {
    expect(formatHiddenCost(3)).toBe("<€1"); // 0,39 → rondt af naar 0
    expect(formatHiddenCost(24)).toBe("±€3");
  });
});

describe("kmEquivalent / treeMonthsEquivalent", () => {
  it("rekent kg om naar autokilometers (134 g/km)", () => {
    expect(kmEquivalent(24)).toBe(179);
  });

  it("rekent kg om naar boommaanden (25 kg/boom/jaar)", () => {
    expect(treeMonthsEquivalent(25)).toBe(12);
    expect(treeMonthsEquivalent(12.5)).toBe(6);
  });
});

describe("suggestCo2KgPerYear", () => {
  it("pakt het midden van een 'X tot Y kg per jaar'-bandbreedte", () => {
    expect(
      suggestCo2KgPerYear(
        "Naar schatting 5 tot 10 kg per jaar minder CO2 dan papier van nieuwe houtvezels."
      )
    ).toBe(7.5);
  });

  it("accepteert ook een bandbreedte met streepje en komma's", () => {
    expect(suggestCo2KgPerYear("Circa 2,5-4,5 kg per jaar minder CO2.")).toBe(
      3.5
    );
  });

  it("geeft GEEN suggestie voor eenmalige besparingen (per plank)", () => {
    expect(
      suggestCo2KgPerYear(
        "Naar schatting 2 tot 6 kg per plank minder CO2 dan een plank van nieuw plastic."
      )
    ).toBeNull();
  });

  it("geeft geen suggestie zonder tekst of zonder herkenbare bandbreedte", () => {
    expect(suggestCo2KgPerYear(null)).toBeNull();
    expect(suggestCo2KgPerYear("Bespaart CO2 per jaar.")).toBeNull();
  });

  it("weigert een omgekeerde of niet-positieve bandbreedte", () => {
    expect(suggestCo2KgPerYear("10 tot 5 kg per jaar")).toBeNull();
    expect(suggestCo2KgPerYear("0 tot 0 kg per jaar")).toBeNull();
  });
});
