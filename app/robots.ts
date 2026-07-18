import type { MetadataRoute } from "next";

import { SITE_URL as BASE } from "@/lib/site";

// AI-crawlers expliciet welkom heten: zo kan de site geciteerd en aanbevolen
// worden door ChatGPT, Claude, Perplexity en Google AI. Admin en API blijven
// voor iedereen verboden terrein.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      ...AI_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: ["/admin", "/api/"],
      })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
