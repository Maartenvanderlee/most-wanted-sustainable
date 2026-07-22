---
name: seo-page
description: Use when creating or editing public pages — category pages, product detail pages, landing pages — or anything involving metadata, Open Graph, structured data, sitemaps, or internal linking.
---

# SEO Pages

Programmatic SEO on sustainable long-tail keywords is a primary traffic channel. Every public page follows these rules.

## URL structure

- Categories: `/trending/[category]` (e.g. `/trending/personal-care`)
- Products: `/product/[slug]`
- Static: `/methodologie`, `/over`
- Slugs: lowercase, hyphens, English, stable (never change a published slug; add a redirect if unavoidable)

## Every public page has

1. Unique `<title>` (≤ 60 chars) and meta description (≤ 155 chars) via the Next.js Metadata API — pattern for categories: "Trending duurzame [category] — [maand jaar] | Risegoods"
2. Open Graph + Twitter card tags with image
3. Structured data (JSON-LD): `ItemList` on category pages, `Product` on product pages (without invented review/price data — only fields we actually have)
4. Exactly one `<h1>`
5. Internal links: product → its category page; category → 3 related categories; everything → /methodologie

## Content rules

- Pages render server-side with real data (no client-only content for indexable pages)
- Category pages get a short unique intro paragraph (2–3 sentences) — never the same boilerplate across categories
- Language: Dutch UI first; keep copy in a translations file so English can be added later without refactoring
- No sustainability claims in copy beyond what the sustainability-curation skill allows

## Technical

- `sitemap.xml` and `robots.txt` generated from the database, updated on build
- Images: `next/image`, lazy loading, descriptive alt text
- Core Web Vitals matter: no layout shift from late-loading score data (reserve space)
