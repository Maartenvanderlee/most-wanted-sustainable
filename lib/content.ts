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
      label: `Intro — ${CATEGORY_LABELS[c]}`,
      multiline: true,
    })),
  },
];

export const CONTENT_DEFAULTS: Record<string, string> = {
  "home.hero.badge": "ONAFHANKELIJKE RANGLIJST",
  "home.hero.title": "De hardst stijgende *duurzame* producten.",
  "home.hero.intro":
    "We meten versnelling, geen volume. Elke dag opnieuw berekend uit " +
    "publieke databronnen — 100% onafhankelijk van affiliate of sponsoring.",
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
};

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
