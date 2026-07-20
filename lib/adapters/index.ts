// Register hier elke adapter. De pipeline gebruikt alleen deze lijst,
// zodat bronnen volledig geïsoleerd blijven.
import type { SourceAdapter } from "./types";
import { adapter as googleTrends } from "./google-trends";
import { adapter as reddit } from "./reddit";
import { adapter as youtube } from "./youtube";
import { adapter as wikipedia } from "./wikipedia";
import { adapter as gdelt } from "./gdelt";
import { adapter as ebay } from "./ebay";

// reddit en ebay slaan zichzelf over zonder API-sleutels (staan klaar).
export const adapters: SourceAdapter[] = [
  googleTrends,
  youtube,
  wikipedia,
  gdelt,
  reddit,
  ebay,
];
