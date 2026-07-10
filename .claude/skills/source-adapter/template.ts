// Template for a new source adapter.
// Copy to src/lib/adapters/<source>.ts and implement fetchSignals.

import type { Signal, SourceAdapter, SourceName } from './types';

const SOURCE: SourceName = 'CHANGE_ME' as SourceName;
const DELAY_MS = 1000;
const MAX_RETRIES = 2;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (res.status === 429) await sleep(DELAY_MS * 2 ** attempt); // rate limited: back off
    } catch {
      await sleep(DELAY_MS * 2 ** attempt);
    }
  }
  return null;
}

export const adapter: SourceAdapter = {
  name: SOURCE,

  async fetchSignals(keywords: string[]): Promise<Signal[]> {
    const signals: Signal[] = [];
    for (const keyword of keywords) {
      try {
        // 1. Check cache first (12h TTL)
        // 2. Call the external API via fetchWithRetry
        // 3. Push raw values — no normalization here
        await sleep(DELAY_MS);
      } catch (err) {
        // Log and continue with the next keyword — never throw.
        console.error(`[${SOURCE}] failed for "${keyword}":`, err);
      }
    }
    return signals; // empty array on total failure is fine
  },
};
