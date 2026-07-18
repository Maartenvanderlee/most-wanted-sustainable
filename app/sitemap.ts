import type { MetadataRoute } from "next";
import { getApprovedSlugs } from "@/lib/queries";
import { getAllPosts } from "@/lib/blog";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/categories";

import { SITE_URL as BASE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getApprovedSlugs();
  const posts = await getAllPosts();
  const postsEn = await getAllPosts("en");

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/en`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/methodologie`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/en/methodology`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogPagesEn: MetadataRoute.Sitemap = [
    { url: `${BASE}/en/blog`, changeFrequency: "weekly", priority: 0.6 },
    ...postsEn.map((p) => ({
      url: `${BASE}/en/blog/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.flatMap((c) => [
    {
      url: `${BASE}/trending/${CATEGORY_SLUGS[c]}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${BASE}/en/trending/${CATEGORY_SLUGS[c]}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
  ]);

  const productPages: MetadataRoute.Sitemap = slugs.flatMap((slug) => [
    {
      url: `${BASE}/product/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    {
      url: `${BASE}/en/product/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    },
  ]);

  return [
    ...staticPages,
    ...blogPages,
    ...blogPagesEn,
    ...categoryPages,
    ...productPages,
  ];
}
