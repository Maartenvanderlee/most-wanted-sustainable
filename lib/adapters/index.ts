// Register hier elke adapter. De pipeline gebruikt alleen deze lijst,
// zodat bronnen volledig geïsoleerd blijven.
import type { SourceAdapter } from "./types";
import { adapter as googleTrends } from "./google-trends";
import { adapter as reddit } from "./reddit";
import { adapter as youtube } from "./youtube";

export const adapters: SourceAdapter[] = [googleTrends, reddit, youtube];
