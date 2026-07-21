import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Be_Vietnam_Pro,
  Space_Grotesk,
  Manrope,
} from "next/font/google";
import "./globals.css";
import { Analytics } from "./analytics";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-jakarta",
});
const vietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-vietnam",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-grotesk",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-manrope",
});

import { SITE_URL as BASE } from "@/lib/site";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: "Most Wanted Sustainable: trending duurzame producten",
  description:
    "Dagelijkse ranglijst van duurzame producten die in populariteit versnellen. Onafhankelijk samengesteld.",
  openGraph: {
    siteName: "Most Wanted Sustainable",
    locale: "nl_NL",
    type: "website",
  },
};

// Structured data over de organisatie en site: helpt zoekmachines én
// AI-assistenten begrijpen wie we zijn en waarom we te vertrouwen zijn.
const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE}/#organization`,
      name: "Most Wanted Sustainable",
      url: BASE,
      description:
        "Onafhankelijke dagelijkse ranglijst van duurzame producten die in " +
        "populariteit versnellen, gemeten uit publieke databronnen. De " +
        "trendscore staat volledig los van affiliate of sponsoring.",
    },
    {
      "@type": "WebSite",
      "@id": `${BASE}/#website`,
      name: "Most Wanted Sustainable",
      url: BASE,
      inLanguage: "nl",
      publisher: { "@id": `${BASE}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="nl"
      className={`${jakarta.variable} ${vietnam.variable} ${grotesk.variable} ${manrope.variable} scroll-smooth`}
    >
      <head>
        {/* Groene code: vroege verbinding met het foto-CDN scheelt wachttijd. */}
        <link rel="preconnect" href="https://images.pexels.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(orgJsonLd) }}
        />
      </head>
      <body className="bg-background font-body text-on-surface antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
