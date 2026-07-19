// Pure, testbare hulpfuncties voor het blogsysteem. Los van lib/blog.ts
// gehouden omdat dat bestand "server-only" importeert (wat crasht buiten
// een Next.js-servercontext, ook in tests).

// Alleen slugs met kleine letters, cijfers en koppeltekens toestaan. Dit
// voorkomt path traversal (bv. "../../.env" of een absoluut pad) wanneer de
// slug uit de URL rechtstreeks als bestandsnaam wordt gebruikt.
export function isSafeSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

// Leest het blok tussen --- en --- bovenaan een markdown-bestand (frontmatter).
export function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: raw.slice(match[0].length) };
}
