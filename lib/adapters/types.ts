// Gedeelde types voor alle databron-adapters.
import type { SourceName } from "../supabase/types";

export type { SourceName };

// Eén ruwe meting van één bron voor één zoekwoord.
export interface Signal {
  keyword: string; // komt overeen met een regel in data/seed-keywords.md
  source: SourceName;
  value: number; // ruwe waarde; nooit genormaliseerd in de adapter
  measuredAt: string; // ISO-tijdstip
}

// Elke bron implementeert exact dit contract.
export interface SourceAdapter {
  name: SourceName;
  fetchSignals(keywords: string[]): Promise<Signal[]>;
}
