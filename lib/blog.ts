// Blogartikelen als markdown-bestanden.
// Nederlands in content/blog/, Engels in content/blog-en/.
// Bestandsnaam = slug. Een Engels artikel verwijst met 'nl: <slug>' in de
// frontmatter naar zijn Nederlandse origineel; daaruit volgt de hreflang-
// koppeling in beide richtingen.
// Wordt alleen tijdens de build gelezen (blogpagina's zijn volledig statisch).
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

export type BlogLocale = "nl" | "en";

const BLOG_DIRS: Record<BlogLocale, string> = {
  nl: path.join(process.cwd(), "content", "blog"),
  en: path.join(process.cwd(), "content", "blog-en"),
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // 'YYYY-MM-DD'
  image: string | null; // stockfoto (Pexels-URL) boven het artikel
  nlSlug: string | null; // alleen bij Engelse artikelen: slug van het origineel
  html: string;
};

// Leest het blok tussen --- en --- bovenaan het bestand (frontmatter).
function parseFrontmatter(raw: string): {
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

async function readPost(
  filename: string,
  locale: BlogLocale
): Promise<BlogPost | null> {
  if (!filename.endsWith(".md")) return null;
  const raw = await fs.readFile(
    path.join(BLOG_DIRS[locale], filename),
    "utf-8"
  );
  const { meta, body } = parseFrontmatter(raw);
  if (!meta.title || !meta.date) return null; // titel en datum zijn verplicht
  return {
    slug: filename.replace(/\.md$/, ""),
    title: meta.title,
    description: meta.description ?? "",
    date: meta.date,
    image: meta.image || null,
    nlSlug: meta.nl || null,
    html: await marked.parse(body),
  };
}

// Alle artikelen in een taal, nieuwste eerst.
export async function getAllPosts(
  locale: BlogLocale = "nl"
): Promise<BlogPost[]> {
  let files: string[];
  try {
    files = await fs.readdir(BLOG_DIRS[locale]);
  } catch {
    return []; // map bestaat (nog) niet
  }
  const posts = await Promise.all(files.map((f) => readPost(f, locale)));
  return posts
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(
  slug: string,
  locale: BlogLocale = "nl"
): Promise<BlogPost | null> {
  // Alleen veilige slugs toestaan (geen paden buiten de blogmap).
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return await readPost(`${slug}.md`, locale);
  } catch {
    return null;
  }
}

// Vertaalkoppeling: nl-slug -> en-slug (afgeleid uit de 'nl:'-frontmatter
// van de Engelse artikelen).
export async function getTranslationMap(): Promise<Map<string, string>> {
  const enPosts = await getAllPosts("en");
  const map = new Map<string, string>();
  for (const p of enPosts) {
    if (p.nlSlug) map.set(p.nlSlug, p.slug);
  }
  return map;
}
