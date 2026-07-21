// Gedeelde categorie-gegevens: labels, kleuren, emoji-placeholders en korte
// SEO-intro's. Op één plek zodat teksten later vertaald kunnen worden.

export type Category = "home" | "personal_care" | "fashion" | "tech" | "food";

export const CATEGORIES: Category[] = [
  "home",
  "personal_care",
  "fashion",
  "tech",
  "food",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  home: "Huis",
  personal_care: "Verzorging",
  fashion: "Kleding",
  tech: "Techniek",
  food: "Voeding",
};

// URL-slug per categorie (koppelteken i.p.v. underscore) voor /trending/[category].
export const CATEGORY_SLUGS: Record<Category, string> = {
  home: "home",
  personal_care: "personal-care",
  fashion: "fashion",
  tech: "tech",
  food: "food",
};

export function categoryToSlug(category: Category): string {
  return CATEGORY_SLUGS[category];
}

export function slugToCategory(slug: string): Category | null {
  const found = CATEGORIES.find((c) => CATEGORY_SLUGS[c] === slug);
  return found ?? null;
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as string[]).includes(value);
}

// Korte, unieke introtekst per categoriepagina (SEO, nooit hetzelfde blok).
export const CATEGORY_INTROS: Record<Category, string> = {
  home: "Duurzame producten voor in en om het huis die nu in populariteit stijgen, van herbruikbare basics tot energiezuinige oplossingen.",
  personal_care:
    "Persoonlijke verzorging zonder onnodig plastic of wegwerp: de snelst opkomende duurzame alternatieven voor je dagelijkse routine.",
  fashion:
    "Kleding en accessoires met een kleinere voetafdruk, gerecyclede, biologische en circulaire items die aan populariteit winnen.",
  tech: "Techniek die langer meegaat of op hernieuwbare energie draait: de duurzame gadgets waar de vraag naar toeneemt.",
  food: "Voeding en keukenbenodigdheden met minder verspilling en verpakking, de duurzame trends die nu opkomen.",
};

// Kleurverloop per categorie voor de placeholder-"foto".
export const CATEGORY_GRADIENTS: Record<Category, string> = {
  home: "from-primary-container/40 to-primary/30",
  personal_care: "from-tertiary-container/40 to-tertiary/25",
  fashion: "from-secondary-container/50 to-secondary/20",
  tech: "from-tertiary-container/50 to-primary-container/30",
  food: "from-primary-container/40 to-secondary-container/40",
};

// Accentkleur per categorie voor de trendscore-badge.
export const CATEGORY_ACCENT: Record<Category, { text: string; bg: string }> = {
  home: { text: "text-primary", bg: "bg-primary-container/20" },
  personal_care: { text: "text-tertiary", bg: "bg-tertiary-container/20" },
  fashion: { text: "text-secondary", bg: "bg-secondary-container/30" },
  tech: { text: "text-tertiary", bg: "bg-tertiary-container/20" },
  food: { text: "text-primary", bg: "bg-primary-container/20" },
};

// Emoji-placeholder per categorie totdat er echte productfoto's zijn.
export const CATEGORY_EMOJI: Record<Category, string> = {
  home: "🏠",
  personal_care: "🧴",
  fashion: "👕",
  tech: "🔌",
  food: "🥣",
};
