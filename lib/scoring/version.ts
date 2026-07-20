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
export const FORMULA_VERSION = "v3";

import type { SourceName } from "../supabase/types";

// Weging per actieve bron (moet optellen tot 1). Meet groei, nooit volume.
// Partieel: alleen bronnen die meewegen staan hierin.
export const WEIGHTS: Partial<Record<SourceName, number>> = {
  google_trends: 0.4,
  youtube: 0.25,
  wikipedia: 0.2,
  gdelt_news: 0.15,
};
