// Leest data/seed-keywords.md in en koppelt elk zoekwoord aan zijn categorie.
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type SeedKeyword = { keyword: string; category: string };

// De kopjes in het bestand (## home (20)) bepalen de categorie.
const CATEGORY_HEADER = /^##\s+([a-z_]+)/i;
const KEYWORD_LINE = /^-\s+(.+?)\s*$/;

export async function loadSeedKeywords(): Promise<SeedKeyword[]> {
  const path = join(process.cwd(), "data", "seed-keywords.md");
  const text = await readFile(path, "utf8");

  const result: SeedKeyword[] = [];
  let category = "";

  for (const line of text.split(/\r?\n/)) {
    const header = line.match(CATEGORY_HEADER);
    if (header) {
      category = header[1].toLowerCase();
      continue;
    }
    const kw = line.match(KEYWORD_LINE);
    if (kw && category) {
      result.push({ keyword: kw[1].trim(), category });
    }
  }

  return result;
}

// Maakt een URL-vriendelijke slug van een zoekwoord.
export function slugify(keyword: string): string {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
