import type { MetadataRoute } from "next";
import { getApprovedSlugs } from "@/lib/queries";
import { getAllPosts } from "@/lib/blog";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/categories";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getApprovedSlugs();
  const posts = await getAllPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/methodologie`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE}/trending/${CATEGORY_SLUGS[c]}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE}/product/${slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...categoryPages, ...productPages];
}
