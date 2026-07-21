// Bewerkbare siteteksten (CMS). De teksten staan in de tabel site_content;
// ontbrekende sleutels vallen terug op de standaardteksten hieronder, dus de
// site werkt ook zonder dat er ooit iets in het CMS is opgeslagen.
import "server-only";
import { createServerClient } from "./supabase/server";
import {
  CATEGORIES,
  CATEGORY_INTROS,
  CATEGORY_LABELS,
  CATEGORY_SLUGS,
} from "./categories";

export type ContentField = {
  key: string;
  label: string;
  multiline?: boolean;
};

export type ContentSection = {
  title: string;
  previewPath: string; // pagina die de preview toont
  fields: ContentField[];
};

export const CONTENT_SECTIONS: ContentSection[] = [
  {
    title: "Homepage",
    previewPath: "/",
    fields: [
      { key: "home.hero.badge", label: "Badge boven de titel" },
      {
        key: "home.hero.title",
        label: "Hoofdtitel (zet *sterretjes* om het groen uitgelichte woord)",
      },
      { key: "home.hero.intro", label: "Introtekst", multiline: true },
      { key: "home.newsletter.title", label: "Nieuwsbrief-titel" },
      { key: "home.newsletter.text", label: "Nieuwsbrief-tekst", multiline: true },
    ],
  },
  {
    title: "Categorie-intro's",
    previewPath: `/trending/${CATEGORY_SLUGS[CATEGORIES[0]]}`,
    fields: CATEGORIES.map((c) => ({
      key: `trending.${CATEGORY_SLUGS[c]}.intro`,
      label: `Intro: ${CATEGORY_LABELS[c]}`,
      multiline: true,
    })),
  },
  {
    title: "Homepage (Engels)",
    previewPath: "/en",
    fields: [
      { key: "en.home.hero.badge", label: "Badge above the title" },
      {
        key: "en.home.hero.title",
        label: "Main title (wrap the highlighted word in *asterisks*)",
      },
      { key: "en.home.hero.intro", label: "Intro text", multiline: true },
      { key: "en.home.newsletter.title", label: "Newsletter title" },
      { key: "en.home.newsletter.text", label: "Newsletter text", multiline: true },
    ],
  },
  {
    title: "Categorie-intro's (Engels)",
    previewPath: `/en/trending/${CATEGORY_SLUGS[CATEGORIES[0]]}`,
    fields: CATEGORIES.map((c) => ({
      key: `en.trending.${CATEGORY_SLUGS[c]}.intro`,
      label: `Intro (EN): ${CATEGORY_LABELS[c]}`,
      multiline: true,
    })),
  },
];

export const CONTENT_DEFAULTS: Record<string, string> = {
  "home.hero.badge": "ONAFHANKELIJKE RANGLIJST",
  "home.hero.title": "De hardst stijgende *duurzame* producten.",
  "home.hero.intro":
    "We meten versnelling, geen volume. Elke dag opnieuw berekend uit " +
    "publieke databronnen, 100% onafhankelijk van affiliate of sponsoring.",
  "home.newsletter.title": "Blijf de trends voor",
  "home.newsletter.text":
    "Ontvang wekelijks de grootste stijgers in duurzame producten in je " +
    "inbox. Geen spam, opzeggen kan altijd.",
  ...Object.fromEntries(
    CATEGORIES.map((c) => [
      `trending.${CATEGORY_SLUGS[c]}.intro`,
      CATEGORY_INTROS[c],
    ])
  ),
  // Engelse standaardteksten (aanpasbaar via het CMS onder "…(Engels)").
  "en.home.hero.badge": "INDEPENDENT RANKING",
  "en.home.hero.title": "The fastest-rising *sustainable* products.",
  "en.home.hero.intro":
    "We measure acceleration, not volume. Recalculated every day from " +
    "public data sources, 100% independent from affiliate or sponsorship.",
  "en.home.newsletter.title": "Stay ahead of the trends",
  "en.home.newsletter.text":
    "Get the biggest risers in sustainable products in your inbox every " +
    "week. No spam, unsubscribe anytime.",
  "en.trending.home.intro":
    "Sustainable products for in and around the house that are rising in popularity right now, from reusable basics to energy-saving solutions.",
  "en.trending.personal-care.intro":
    "Personal care without needless plastic or throwaways: the fastest-rising sustainable alternatives for your daily routine.",
  "en.trending.fashion.intro":
    "Clothing and accessories with a smaller footprint, recycled, organic and circular items gaining popularity.",
  "en.trending.tech.intro":
    "Tech that lasts longer or runs on renewable energy: the sustainable gadgets demand is growing for.",
  "en.trending.food.intro":
    "Food and kitchen essentials with less waste and packaging, the sustainable trends emerging right now.",
};

// Sleutel voor een tekst in de gevraagde taal (Engelse sleutels: 'en.'-prefix).
export function contentKey(locale: "nl" | "en", base: string): string {
  return locale === "en" ? `en.${base}` : base;
}

export type SiteContent = Record<string, string>;

// Alle teksten in één keer: published voor bezoekers, draft in previewmodus.
// Lege waarden vallen terug op de standaardtekst.
export async function getContent(draft = false): Promise<SiteContent> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, published, draft");

  const merged: SiteContent = { ...CONTENT_DEFAULTS };
  for (const row of data ?? []) {
    const value = draft ? (row.draft ?? row.published) : row.published;
    if (value != null && value.trim() !== "") merged[row.key] = value;
  }
  return merged;
}
