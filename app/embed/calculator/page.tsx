// Zelfstandige, insluitbare CO2-waardecalculator (whitelabel) voor derden
// (gemeenten, energiecoöperaties, adviesdiensten). Geen site-navigatie, niet
// indexeerbaar. Hergebruikt lib/true-price.ts; de CE Delft-bronvermelding
// blijft altijd staan. Framebaar gemaakt via next.config.mjs (alleen /embed).
//
// Whitelabel via URL-parameters, bv.:
//   /embed/calculator?brand=Gemeente%20X&accent=%230E7C4A&locale=nl&kg=120
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { EmbedCalculator } from "./embed-calculator";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "CO2-waardecalculator",
};

// Alleen een geldige hexkleur toestaan (voorkomt injectie in een style-attribuut).
function safeAccent(v: string | undefined): string {
  return v && /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : "#0E7C4A";
}

function toNumber(v: string | undefined, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export default function EmbedCalculatorPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const get = (k: string) =>
    typeof searchParams[k] === "string" ? (searchParams[k] as string) : undefined;

  const locale = get("locale") === "en" ? "en" : "nl";
  const accent = safeAccent(get("accent"));
  const brand = (get("brand") ?? "").slice(0, 60) || null;
  const kg = Math.min(toNumber(get("kg"), 24), 2000);
  const label = (get("label") ?? "").slice(0, 60) || null;
  const showPowered = get("powered") !== "0";

  return (
    <EmbedCalculator
      locale={locale}
      accent={accent}
      brand={brand}
      defaultKg={kg}
      actionLabel={label}
      showPowered={showPowered}
      sourcesUrl={`${SITE_URL}/${locale === "en" ? "en/sources" : "bronnen"}`}
      homeUrl={SITE_URL}
    />
  );
}
