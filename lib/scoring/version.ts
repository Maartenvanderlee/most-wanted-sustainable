// De formuleversie hoort bij ELKE opgeslagen score, zodat historie
// interpreteerbaar blijft. Verhoog dit bij elke wijziging aan de formule
// (en werk /methodologie + CHANGELOG.md bij — zie de trend-score skill).
export const FORMULA_VERSION = "v1";

// Weging per bron (moet optellen tot 1). Meet groei, nooit volume.
export const WEIGHTS = {
  google_trends: 0.45,
  reddit: 0.3,
  youtube: 0.25,
} as const;
