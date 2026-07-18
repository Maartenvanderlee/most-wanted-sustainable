// Blogartikelen als markdown-bestanden in content/blog/.
// Bestandsnaam = slug (bv. wat-betekenen-keurmerken.md -> /blog/wat-betekenen-keurmerken).
// Wordt alleen tijdens de build gelezen (blogpagina's zijn volledig statisch);
// een nieuw artikel toevoegen = bestand committen, Vercel bouwt automatisch opnieuw.
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string; // 'YYYY-MM-DD'
  image: string | null; // stockfoto (Pexels-URL) boven het artikel
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

async function readPost(filename: string): Promise<BlogPost | null> {
  if (!filename.endsWith(".md")) return null;
  const raw = await fs.readFile(path.join(BLOG_DIR, filename), "utf-8");
  const { meta, body } = parseFrontmatter(raw);
  if (!meta.title || !meta.date) return null; // titel en datum zijn verplicht
  return {
    slug: filename.replace(/\.md$/, ""),
    title: meta.title,
    description: meta.description ?? "",
    date: meta.date,
    image: meta.image || null,
    html: await marked.parse(body),
  };
}

// Alle artikelen, nieuwste eerst.
export async function getAllPosts(): Promise<BlogPost[]> {
  let files: string[];
  try {
    files = await fs.readdir(BLOG_DIR);
  } catch {
    return []; // map bestaat (nog) niet
  }
  const posts = await Promise.all(files.map(readPost));
  return posts
    .filter((p): p is BlogPost => p !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Alleen veilige slugs toestaan (geen paden buiten de blogmap).
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    return await readPost(`${slug}.md`);
  } catch {
    return null;
  }
}
