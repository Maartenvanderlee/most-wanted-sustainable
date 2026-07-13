// Simpele bestandscache (12u) zodat herhaalde runs tijdens ontwikkeling
// geen API-quota verbruiken. Faalt altijd stil: cache is optioneel.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CACHE_DIR = join(process.cwd(), ".cache");
const TTL_MS = 12 * 60 * 60 * 1000; // 12 uur

function pathFor(key: string): string {
  const hash = createHash("sha1").update(key).digest("hex");
  return join(CACHE_DIR, `${hash}.json`);
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await readFile(pathFor(key), "utf8");
    const parsed = JSON.parse(raw) as { savedAt: number; data: T };
    if (Date.now() - parsed.savedAt > TTL_MS) return null; // verlopen
    return parsed.data;
  } catch {
    return null; // geen cache of onleesbaar
  }
}

export async function setCached<T>(key: string, data: T): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(
      pathFor(key),
      JSON.stringify({ savedAt: Date.now(), data }),
      "utf8"
    );
  } catch {
    // Cache schrijven mislukt (bv. read-only filesystem): negeren.
  }
}
