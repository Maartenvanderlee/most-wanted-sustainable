// De formuleversie hoort bij ELKE opgeslagen score, zodat historie
// interpreteerbaar blijft. Verhoog dit bij elke wijziging aan de formule
// (en werk /methodologie + CHANGELOG.md bij — zie de trend-score skill).
//
// v3: bronspreiding. Om minder afhankelijk te zijn van één (wankele) bron
// zijn twee nieuwe, onafhankelijke gratis bronnen toegevoegd:
//   - wikipedia   paginaweergaven van het best passende artikel (30 dagen)
//   - gdelt_news  wereldwijd nieuwsvolume over het zoekwoord (1 week)
// Google Trends weegt bewust minder zwaar (0,65 -> 0,40) zodat de score
// overeind blijft als Google Trends tijdelijk uitvalt: dan komt nog 60% van
// het signaal uit YouTube, Wikipedia en GDELT samen.
// Reddit en eBay staan klaar (adapters bestaan) maar wegen pas mee zodra hun
// sleutels/toegang geregeld zijn; ze worden dan als v4 aan de weging
// toegevoegd.
// v4: twee wijzigingen die samen zijn uitgerold.
//
// 1. Dynamische herweging. Tot v3 telde een ontbrekende bron als "0% groei",
//    alsof we hadden gemeten dat er niets gebeurde. Dat is onjuist: geen meting
//    is geen nulgroei. Gevolg was dat een stilgevallen bron iedereen omlaag
//    drukte (met Wikipedia en GDELT stil was de maximale score feitelijk 65
//    i.p.v. 100) en dat producten mét data uit een schaarse bron oneerlijk
//    werden vergeleken met producten zonder. Vanaf v4 telt per product alleen
//    mee wat écht gemeten is, en worden die gewichten naar 100% geschaald.
//
// 2. Wikipedia op standby. De adapter werkt, maar koppelt zoekwoorden aan het
//    verkeerde artikel: "solar power bank" belandde bij een Marokkaanse
//    energiecentrale, "silicone food storage bags" bij S.C. Johnson, en veel
//    zoekwoorden bij een generiek artikel ("Toilet paper", "Shampoo") waarvan
//    het bezoek nauwelijks met het product te maken heeft. Van tien steekproeven
//    klopten er drie. Zulke data als 20% laten meewegen zou de score verslechteren
//    in plaats van verbeteren, dus weegt Wikipedia tijdelijk niet mee. De adapter
//    blijft wél draaien: de metingen worden opgeslagen en bouwen historie op, zodat
//    de bron direct bruikbaar is zodra de artikelkoppeling betrouwbaar is.
//    Dankzij de dynamische herweging hierboven kost dit niemand punten.
//
// De onderlinge verhouding van de overgebleven bronnen is ongewijzigd
// (40 : 25 : 15), alleen naar 100% geschaald.
export const FORMULA_VERSION = "v4";

import type { SourceName } from "../supabase/types";

// Weging per actieve bron (moet optellen tot 1). Meet groei, nooit volume.
// Partieel: alleen bronnen die meewegen staan hierin. Wikipedia staat bewust
// niet in deze lijst (zie punt 2 hierboven) maar wordt wel gemeten.
export const WEIGHTS: Partial<Record<SourceName, number>> = {
  google_trends: 0.5,
  youtube: 0.31,
  gdelt_news: 0.19,
};
