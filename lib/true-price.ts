// Schaduwprijs voor CO2: rekent een indicatieve CO2-besparing om naar een
// indicatief eurobedrag aan vermeden maatschappelijke/milieukosten. Dit is
// geen winkelprijs.
//
// Bron: CE Delft, Handboek Milieuprijzen 2023 (februari 2023, publicatienr.
// 23.220175.034), Tabel 1 (p.6, stofniveau "CO2") en Tabel 2 (p.7,
// midpointniveau "Klimaatverandering") — beide tabellen geven onafhankelijk
// van elkaar dezelfde middenschatting. Bandbreedte €0,05-€0,16/kg CO2-eq.,
// prijspeil 2021; wij gebruiken de middenschatting.
// https://ce.nl/wp-content/uploads/2023/03/CE_Delft_220175_Handboek_Milieuprijzen_2023_DEF.pdf
export const CO2_SHADOW_PRICE_EUR_PER_KG = 0.13;

export function hiddenCo2CostEur(kgPerYear: number): number {
  return kgPerYear * CO2_SHADOW_PRICE_EUR_PER_KG;
}

// Rondt af op hele euro's, zelfde conventie als lib/price.ts (het is een
// indicatie, geen aanbod). Toont "<€1" i.p.v. "€0" zodat een kleine, reële
// besparing niet als nul oogt.
export function formatHiddenCost(kgPerYear: number): string {
  const rounded = Math.round(hiddenCo2CostEur(kgPerYear));
  return rounded < 1 ? "<€1" : `±€${rounded}`;
}
