// Alle vertaalbare interfaceteksten op één plek (nl/en), zoals de seo-page
// skill voorschrijft. Data blijft in het Nederlands in de database; deze
// module vertaalt labels en kenmerk-tags bij weergave.
import { CATEGORY_LABELS, type Category } from "./categories";
import type { SourceName } from "./supabase/types";

export type Locale = "nl" | "en";

// Pad-prefix per taal: nl = "", en = "/en".
export function localePath(locale: Locale, path: string): string {
  return locale === "en" ? `/en${path === "/" ? "" : path}` || "/en" : path;
}

export const CATEGORY_LABELS_EN: Record<Category, string> = {
  home: "Home",
  personal_care: "Personal care",
  fashion: "Fashion",
  tech: "Tech",
  food: "Food",
};

export const MONTHS_NL = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

export const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Weergave van kenmerk-tags (de tags zelf staan in het Nederlands in de db).
const TAG_LABELS_EN: Record<string, string> = {
  afvalvermindering: "waste-reducing",
  batterijvrij: "battery-free",
  biologisch: "organic",
  "biologisch-afbreekbaar": "biodegradable",
  composteerbaar: "compostable",
  "eerlijke handel": "fair trade",
  energiebesparend: "energy-saving",
  gerecycled: "recycled",
  herbruikbaar: "reusable",
  hernieuwbaar: "renewable",
  lokaal: "local",
  modulair: "modular",
  navulbaar: "refillable",
  plantaardig: "plant-based",
  plasticvrij: "plastic-free",
  refurbished: "refurbished",
  repareerbaar: "repairable",
  tweedehands: "second-hand",
  waterbesparend: "water-saving",
  "zonne-energie": "solar-powered",
};

export function translateTag(tag: string, locale: Locale): string {
  if (locale === "nl") return tag;
  return TAG_LABELS_EN[tag] ?? tag;
}

// Interfaceteksten per taal.
export const UI = {
  nl: {
    // homepage
    products: "PRODUCTEN",
    sources: "DATABRONNEN",
    emptyTitle: "De ranglijst wordt binnenkort gevuld",
    emptyText:
      "Onze pijplijn verzamelt dagelijks data. Zodra producten zijn goedgekeurd en er genoeg meetgegevens zijn, verschijnen ze hier met hun trendscore.",
    previewBanner: "Preview-modus: je bekijkt conceptteksten.",
    previewExit: "Preview verlaten",
    // grid
    allCategories: "Alle categorieën",
    allTags: "Alle tags",
    noneForFilter: "Geen producten voor deze filter.",
    featured: "UITGELICHT",
    isNew: "nieuw",
    inRanking: (rank: number) => `#${rank} in de ranglijst`,
    noScoreYet: "nog geen score",
    // productpagina
    buyHere: "Hier online te koop:",
    viewProduct: "Bekijk dit product",
    affiliateNote:
      "Affiliate-links, we verdienen mogelijk een kleine commissie. Dit heeft geen invloed op de trendscore. Prijzen zijn een indicatie en kunnen bij de winkel afwijken.",
    whyListed: "Waarom staat dit product op de lijst?",
    recognisedLabels: "Erkende keurmerken:",
    regNo: "reg.nr.",
    checkRegister: "controleer in het register ↗",
    characteristics: "Kenmerken:",
    tagsSoon: "De duurzaamheidskenmerken worden binnenkort toegevoegd.",
    lifespanTitle: "Levensduur & recycling",
    avgLifespan: "Gemiddelde levensduur:",
    afterUse: "Na gebruik:",
    greenGainTitle: "Duurzamer dan het gangbare alternatief",
    whatYouGet: "Wat dit je oplevert",
    co2PerYear: (kg: string) => `−${kg} kg CO2 per jaar`,
    hiddenCost: (eur: string) => `${eur} milieukost`,
    savingPerYear: (eur: string) => `+€${eur} per jaar`,
    tangibleEquivalent: (km: string, treeTime: string) =>
      `Dat is ongeveer ${km} km autorijden, of ${treeTime} aan CO2-opname van een boom.`,
    treeLessThanMonth: "minder dan 1 maand",
    treeMonths: (n: number) => `${n} maand${n === 1 ? "" : "en"}`,
    treeYears: (n: number) => `${n} jaar`,
    co2Label: "Geschatte CO2-besparing:",
    co2Disclaimer:
      "Indicatieve schatting op basis van openbare levenscyclusstudies, inclusief productie en transport, geen gecertificeerde meting. De werkelijke besparing hangt af van gebruik en van wat je ermee vervangt.",
    scoreBreakdown: "Score-opbouw per bron",
    scoreBreakdownText: "De trendscore meet versnelling, geen volume. Elke bron weegt anders mee.",
    howItWorks: "Zo werkt het",
    weighting: "weging",
    insufficientData: "onvoldoende data",
    views30d: (n: string) => `${n} weergaven (30 dagen)`,
    mentionsWeek: (n: string) => `${n} vermeldingen (week)`,
    interest: (n: string) => `interesse ${n}/100`,
    pageviews30d: (n: string) => `${n} paginaweergaven (30 dagen)`,
    articlesWeek: (n: string) => `${n} nieuwsartikelen (week)`,
    listings: (n: string) => `${n} aanbiedingen`,
    chartTitle: "Trendscore: laatste 30 dagen",
    chartEmpty: "De grafiek verschijnt zodra er meerdere dagen aan metingen zijn.",
    chartAria: "Trendscore over tijd",
    noScoreBig: "Nog geen score",
    twoWeeks: "± 2 weken historie nodig",
    trendScoreRank: (rank: number) => `trendscore · #${rank}`,
    // categoriepagina
    trendingIn: (label: string) => `Trending duurzame ${label.toLowerCase()}`,
    noProductsInCategory: "Nog geen goedgekeurde producten in deze categorie.",
    otherCategories: "Andere categorieën",
    howScoreWorks: "Hoe werkt de trendscore?",
    // nieuwsbrief
    emailPlaceholder: "Je e-mailadres",
    subscribe: "Aanmelden",
    busy: "Bezig...",
    backToRanking: "← Terug naar de ranglijst",
    methodologyHref: "/methodologie",
    sourcesHref: "/bronnen",
    viewSources: "Bekijk onze bronnen",
    dateLocale: "nl-NL",
  },
  en: {
    products: "PRODUCTS",
    sources: "DATA SOURCES",
    emptyTitle: "The ranking will be filled soon",
    emptyText:
      "Our pipeline collects data every day. As soon as products are approved and enough measurements exist, they appear here with their trend score.",
    previewBanner: "Preview mode: you are viewing draft texts.",
    previewExit: "Exit preview",
    allCategories: "All categories",
    allTags: "All tags",
    noneForFilter: "No products match this filter.",
    featured: "FEATURED",
    isNew: "new",
    inRanking: (rank: number) => `#${rank} in the ranking`,
    noScoreYet: "no score yet",
    buyHere: "Buy online:",
    viewProduct: "View this product",
    affiliateNote:
      "Affiliate links, we may earn a small commission. This never affects the trend score. Prices are indicative and may differ at the store.",
    whyListed: "Why is this product on the list?",
    recognisedLabels: "Recognised certifications:",
    regNo: "reg. no.",
    checkRegister: "verify in the register ↗",
    characteristics: "Characteristics:",
    tagsSoon: "Sustainability characteristics will be added soon.",
    lifespanTitle: "Lifespan & recycling",
    avgLifespan: "Average lifespan:",
    afterUse: "After use:",
    greenGainTitle: "More sustainable than the conventional alternative",
    whatYouGet: "What this gets you",
    co2PerYear: (kg: string) => `−${kg} kg CO2 per year`,
    hiddenCost: (eur: string) => `${eur} environmental cost`,
    savingPerYear: (eur: string) => `+€${eur} per year`,
    tangibleEquivalent: (km: string, treeTime: string) =>
      `That's roughly ${km} km of driving, or ${treeTime} of a tree's CO2 uptake.`,
    treeLessThanMonth: "less than 1 month",
    treeMonths: (n: number) => `${n} month${n === 1 ? "" : "s"}`,
    treeYears: (n: number) => `${n} year${n === 1 ? "" : "s"}`,
    co2Label: "Estimated CO2 saving:",
    co2Disclaimer:
      "Indicative estimate based on public life-cycle studies, including production and transport, not a certified measurement. Actual savings depend on usage and on what you replace.",
    scoreBreakdown: "Score breakdown per source",
    scoreBreakdownText: "The trend score measures acceleration, not volume. Each source has its own weight.",
    howItWorks: "How it works",
    weighting: "weight",
    insufficientData: "insufficient data",
    views30d: (n: string) => `${n} views (30 days)`,
    mentionsWeek: (n: string) => `${n} mentions (week)`,
    interest: (n: string) => `interest ${n}/100`,
    pageviews30d: (n: string) => `${n} page views (30 days)`,
    articlesWeek: (n: string) => `${n} news articles (week)`,
    listings: (n: string) => `${n} listings`,
    chartTitle: "Trend score: last 30 days",
    chartEmpty: "The chart appears once several days of measurements exist.",
    chartAria: "Trend score over time",
    noScoreBig: "No score yet",
    twoWeeks: "± 2 weeks of history needed",
    trendScoreRank: (rank: number) => `trend score · #${rank}`,
    trendingIn: (label: string) => `Trending sustainable ${label.toLowerCase()}`,
    noProductsInCategory: "No approved products in this category yet.",
    otherCategories: "Other categories",
    howScoreWorks: "How does the trend score work?",
    emailPlaceholder: "Your email address",
    subscribe: "Subscribe",
    busy: "One moment...",
    backToRanking: "← Back to the ranking",
    methodologyHref: "/en/methodology",
    sourcesHref: "/en/sources",
    viewSources: "See our sources",
    dateLocale: "en-GB",
  },
} as const;

export type UIStrings = (typeof UI)[Locale];

export function categoryLabel(category: Category, locale: Locale): string {
  return locale === "en" ? CATEGORY_LABELS_EN[category] : CATEGORY_LABELS[category];
}

export function sourceLabel(source: SourceName): string {
  const labels: Record<SourceName, string> = {
    google_trends: "Google Trends",
    youtube: "YouTube",
    reddit: "Reddit",
    wikipedia: "Wikipedia",
    gdelt_news: "Nieuws (GDELT)",
    ebay: "eBay",
  };
  return labels[source];
}
