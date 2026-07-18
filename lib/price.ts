// Prijsindicatie op basis van de prijzen bij onze verkoopkanalen.
// Altijd als indicatie tonen (±): prijzen bij winkels veranderen dagelijks.

export type PriceRange = { min: number; max: number };

export function priceRangeFrom(prices: (number | null)[]): PriceRange | null {
  const valid = prices.filter((p): p is number => p !== null && p > 0);
  if (valid.length === 0) return null;
  return { min: Math.min(...valid), max: Math.max(...valid) };
}

function euro(n: number): string {
  // Hele euro's afronden; het is een indicatie, geen aanbod.
  return `€${Math.round(n)}`;
}

export function formatPriceRange(range: PriceRange): string {
  return range.min === range.max
    ? `±${euro(range.min)}`
    : `±${euro(range.min)}–${euro(range.max)}`;
}
