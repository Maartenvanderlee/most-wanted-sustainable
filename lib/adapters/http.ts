// Netwerk-hulpjes die alle adapters delen.

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const DELAY_MS = 1000;
export const MAX_RETRIES = 2;

// Haalt een URL op met maximaal 2 herhaalpogingen en exponentiële backoff.
// Geeft null terug bij blijvende fouten — gooit nooit een error.
export async function fetchWithRetry(
  url: string,
  init?: RequestInit
): Promise<Response | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      // 429 = rate limited: even wachten en opnieuw proberen.
      if (res.status === 429) {
        await sleep(DELAY_MS * 2 ** attempt);
        continue;
      }
      return null; // andere HTTP-fout: niet opnieuw proberen
    } catch {
      await sleep(DELAY_MS * 2 ** attempt);
    }
  }
  return null;
}
