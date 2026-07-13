import type { MetadataRoute } from "next";
import { getApprovedSlugs } from "@/lib/queries";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/categories";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getApprovedSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/methodologie`, changeFrequency: "monthly", priority: 0.5 },
  ];

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

  return [...staticPages, ...categoryPages, ...productPages];
}
