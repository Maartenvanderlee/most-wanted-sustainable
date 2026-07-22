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

// Tastbare vergelijking 1: gemiddelde CO2-uitstoot van een rijdende
// personenauto in Nederland, per kilometer. Zelf berekend uit twee bij
// elkaar passende CBS-cijfers over hetzelfde jaar (2022), beide specifiek
// voor personenauto's (niet het hele wagenpark, niet alleen nieuwe auto's):
// 15,3 miljard kg CO2 (CBS, "CO2-uitstoot wegverkeer in 2022 met bijna drie
// procent toegenomen", https://www.cbs.nl/nl-nl/nieuws/2024/16/co2-uitstoot-wegverkeer-in-2022-met-bijna-drie-procent-toegenomen)
// gedeeld door 114,31 miljard km (CBS, "Motorvoertuigen reden 7 procent
// meer in 2022", https://www.cbs.nl/nl-nl/nieuws/2023/43/motorvoertuigen-reden-7-procent-meer-in-2022)
// = 133,8 g/km, afgerond op 134. Dit getal staat nergens letterlijk zo in
// een CBS-tabel; het is onze eigen deling van twee officiële cijfers.
export const CAR_CO2_G_PER_KM = 134;

export function kmEquivalent(kgPerYear: number): number {
  return Math.round((kgPerYear * 1000) / CAR_CO2_G_PER_KM);
}

// Tastbare vergelijking 2: CO2-opname van een boom. Bron: Staatsbosbeheer,
// "Bos en CO2" (https://www.staatsbosbeheer.nl/wat-we-doen/co2-opslaan/bos-en-co2):
// een vrijstaande boom neemt gemiddeld 10-40 kg CO2 per jaar op. Wij
// gebruiken het midden van die bandbreedte (25 kg/jaar), zelfde methode als
// bij de CO2-schaduwprijs hierboven.
export const TREE_CO2_KG_PER_YEAR = 25;

// In maanden, want bij de meeste producten is de jaarlijkse besparing
// kleiner dan wat één boom in een heel jaar opneemt.
export function treeMonthsEquivalent(kgPerYear: number): number {
  return Math.round((kgPerYear / TREE_CO2_KG_PER_YEAR) * 12);
}
