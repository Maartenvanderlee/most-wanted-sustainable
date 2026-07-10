// Tijdelijke testdata voor Fase 1 (het skelet).
// Deze verzonnen producten worden later vervangen door echte data uit de pipeline.

export type Category = "home" | "personal_care" | "fashion" | "tech" | "food";

export type SampleProduct = {
  rank: number;
  name: string;
  category: Category;
  tags: string[];
  trendScore: number; // 0 - 100, meet versnelling (niet volume)
};

export const CATEGORY_LABELS: Record<Category, string> = {
  home: "Huis",
  personal_care: "Verzorging",
  fashion: "Kleding",
  tech: "Techniek",
  food: "Voeding",
};

export const sampleProducts: SampleProduct[] = [
  {
    rank: 1,
    name: "Bijenwas food wraps",
    category: "home",
    tags: ["plasticvrij", "herbruikbaar", "composteerbaar"],
    trendScore: 94,
  },
  {
    rank: 2,
    name: "Shampoo bar",
    category: "personal_care",
    tags: ["plasticvrij", "vegan"],
    trendScore: 91,
  },
  {
    rank: 3,
    name: "Solar powerbank",
    category: "tech",
    tags: ["zonne-energie", "herlaadbaar"],
    trendScore: 88,
  },
  {
    rank: 4,
    name: "Merino wollen sokken",
    category: "fashion",
    tags: ["biologisch", "biologisch afbreekbaar"],
    trendScore: 83,
  },
  {
    rank: 5,
    name: "Havermelk poeder",
    category: "food",
    tags: ["plantaardig", "minder verpakking"],
    trendScore: 79,
  },
  {
    rank: 6,
    name: "Bamboe tandenborstel",
    category: "personal_care",
    tags: ["plasticvrij", "composteerbaar"],
    trendScore: 74,
  },
  {
    rank: 7,
    name: "Kurken yogamat",
    category: "home",
    tags: ["natuurlijk materiaal", "hernieuwbaar"],
    trendScore: 68,
  },
  {
    rank: 8,
    name: "Refurbished smartphone",
    category: "tech",
    tags: ["tweedehands", "circulair"],
    trendScore: 61,
  },
  {
    rank: 9,
    name: "Gerecyclede polyester jas",
    category: "fashion",
    tags: ["gerecycled", "fair trade"],
    trendScore: 55,
  },
  {
    rank: 10,
    name: "Herbruikbaar koffiefilter",
    category: "food",
    tags: ["herbruikbaar", "zonder afval"],
    trendScore: 48,
  },
];
