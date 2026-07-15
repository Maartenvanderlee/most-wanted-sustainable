// De formuleversie hoort bij ELKE opgeslagen score, zodat historie
// interpreteerbaar blijft. Verhoog dit bij elke wijziging aan de formule
// (en werk /methodologie + CHANGELOG.md bij — zie de trend-score skill).
//
// v2: Reddit is (tijdelijk) niet actief — Reddit blokkeert anonieme toegang en
// vereist goedkeuring voor commercieel gebruik. Zijn gewicht is herverdeeld
// over de twee werkende bronnen (verhouding 45:25 -> 65:35). Reddit kan later
// als v3 worden toegevoegd zodra er toegang is.
export const FORMULA_VERSION = "v2";

import type { SourceName } from "../supabase/types";

// Weging per actieve bron (moet optellen tot 1). Meet groei, nooit volume.
// Partieel: alleen bronnen die meewegen staan hierin.
export const WEIGHTS: Partial<Record<SourceName, number>> = {
  google_trends: 0.65,
  youtube: 0.35,
};
