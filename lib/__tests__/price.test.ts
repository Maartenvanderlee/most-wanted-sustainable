import { describe, it, expect } from "vitest";
import { priceRangeFrom, formatPriceRange } from "../price";

describe("priceRangeFrom", () => {
  it("geeft min en max van geldige prijzen", () => {
    expect(priceRangeFrom([12, 18, 15])).toEqual({ min: 12, max: 18 });
  });

  it("negeert null-waarden (winkel zonder prijs ingevuld)", () => {
    expect(priceRangeFrom([null, 20, null])).toEqual({ min: 20, max: 20 });
  });

  it("negeert 0 en negatieve waarden (nooit een geldige prijs)", () => {
    expect(priceRangeFrom([0, -5, 10])).toEqual({ min: 10, max: 10 });
  });

  it("geeft null als er geen enkele geldige prijs is", () => {
    expect(priceRangeFrom([null, null])).toBeNull();
    expect(priceRangeFrom([])).toBeNull();
  });
});

describe("formatPriceRange", () => {
  it("toont één prijs zonder streepje als min en max gelijk zijn", () => {
    expect(formatPriceRange({ min: 12, max: 12 })).toBe("±€12");
  });

  it("toont een bandbreedte als min en max verschillen", () => {
    expect(formatPriceRange({ min: 12, max: 18 })).toBe("±€12–€18");
  });

  it("rondt af op hele euro's", () => {
    expect(formatPriceRange({ min: 12.4, max: 12.6 })).toBe("±€12–€13");
  });
});
