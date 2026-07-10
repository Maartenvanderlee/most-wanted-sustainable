// Tijdelijke testdata voor Fase 1 (het skelet).
// Deze verzonnen producten worden later vervangen door echte data uit de pipeline.

export type Category = "home" | "personal_care" | "fashion" | "tech" | "food";

export type SampleProduct = {
  rank: number;
  slug: string;
  name: string;
  category: Category;
  tags: string[];
  description: string;
  geography: string; // waar het product het hardst opkomt
  emoji: string; // tijdelijke "foto" totdat er echte productfoto's zijn
  trendScore: number; // 0 - 100, meet versnelling (niet volume)
};

export const CATEGORY_LABELS: Record<Category, string> = {
  home: "Huis",
  personal_care: "Verzorging",
  fashion: "Kleding",
  tech: "Techniek",
  food: "Voeding",
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

export const sampleProducts: SampleProduct[] = [
  {
    rank: 1,
    slug: "bijenwas-food-wraps",
    name: "Bijenwas food wraps",
    category: "home",
    tags: ["plasticvrij", "herbruikbaar", "composteerbaar"],
    description:
      "Herbruikbaar alternatief voor huishoudfolie, gemaakt van katoen en bijenwas.",
    geography: "🌍 Wereldwijd",
    emoji: "🐝",
    trendScore: 94,
  },
  {
    rank: 2,
    slug: "shampoo-bar",
    name: "Shampoo bar",
    category: "personal_care",
    tags: ["plasticvrij", "vegan"],
    description:
      "Vaste shampoo zonder plastic verpakking, goed voor tot 80 wasbeurten.",
    geography: "🇪🇺 Europa",
    emoji: "🧼",
    trendScore: 91,
  },
  {
    rank: 3,
    slug: "solar-powerbank",
    name: "Solar powerbank",
    category: "tech",
    tags: ["zonne-energie", "herlaadbaar"],
    description:
      "Powerbank die je oplaadt met zonlicht, ideaal voor onderweg en outdoor.",
    geography: "🇺🇸 Verenigde Staten",
    emoji: "🔋",
    trendScore: 88,
  },
  {
    rank: 4,
    slug: "merino-wollen-sokken",
    name: "Merino wollen sokken",
    category: "fashion",
    tags: ["biologisch", "biologisch afbreekbaar"],
    description:
      "Ademende sokken van biologische merinowol die van nature geurwerend zijn.",
    geography: "🌍 Wereldwijd",
    emoji: "🧦",
    trendScore: 83,
  },
  {
    rank: 5,
    slug: "havermelk-poeder",
    name: "Havermelk poeder",
    category: "food",
    tags: ["plantaardig", "minder verpakking"],
    description:
      "Maak zelf havermelk uit poeder — scheelt zwaar transport van pakken water.",
    geography: "🇬🇧 Verenigd Koninkrijk",
    emoji: "🥛",
    trendScore: 79,
  },
  {
    rank: 6,
    slug: "bamboe-tandenborstel",
    name: "Bamboe tandenborstel",
    category: "personal_care",
    tags: ["plasticvrij", "composteerbaar"],
    description:
      "Tandenborstel met handvat van bamboe in plaats van plastic.",
    geography: "🇪🇺 Europa",
    emoji: "🪥",
    trendScore: 74,
  },
  {
    rank: 7,
    slug: "kurken-yogamat",
    name: "Kurken yogamat",
    category: "home",
    tags: ["natuurlijk materiaal", "hernieuwbaar"],
    description:
      "Antislip yogamat van kurk, een hernieuwbare grondstof van de kurkeik.",
    geography: "🇩🇪 Duitsland",
    emoji: "🧘",
    trendScore: 68,
  },
  {
    rank: 8,
    slug: "refurbished-smartphone",
    name: "Refurbished smartphone",
    category: "tech",
    tags: ["tweedehands", "circulair"],
    description:
      "Professioneel opgeknapte telefoon die een tweede leven krijgt.",
    geography: "🌍 Wereldwijd",
    emoji: "📱",
    trendScore: 61,
  },
  {
    rank: 9,
    slug: "gerecyclede-polyester-jas",
    name: "Gerecyclede polyester jas",
    category: "fashion",
    tags: ["gerecycled", "fair trade"],
    description:
      "Winterjas gemaakt van gerecyclede PET-flessen, eerlijk geproduceerd.",
    geography: "🇺🇸 Verenigde Staten",
    emoji: "🧥",
    trendScore: 55,
  },
  {
    rank: 10,
    slug: "herbruikbaar-koffiefilter",
    name: "Herbruikbaar koffiefilter",
    category: "food",
    tags: ["herbruikbaar", "zonder afval"],
    description:
      "Wasbaar filter dat honderden papieren wegwerpfilters vervangt.",
    geography: "🇳🇱 Nederland",
    emoji: "☕",
    trendScore: 48,
  },
];
