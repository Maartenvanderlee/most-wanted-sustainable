import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/app/site-chrome";

export const metadata: Metadata = {
  title: "Bronnen: waar onze CO2-schattingen op gebaseerd zijn | Risegoods",
  description:
    "De gezaghebbende bronnen en levenscyclusstudies waarop onze indicatieve CO2-besparingen per product zijn gebaseerd. Volledige transparantie.",
  alternates: {
    canonical: "/bronnen",
    languages: { nl: "/bronnen", en: "/en/sources" },
  },
};

type Source = { name: string; url: string; what: string };

const GROUPS: { heading: string; intro: string; sources: Source[] }[] = [
  {
    heading: "Algemene methode & levenscyclusanalyse (LCA)",
    intro:
      "De basis onder elke CO2-vergelijking: hoe je de impact van een product over de hele levensloop meet (grondstof, productie, transport, gebruik, afval).",
    sources: [
      {
        name: "European Commission, Environmental Footprint & JRC",
        url: "https://green-business.ec.europa.eu/environmental-footprint-methods_en",
        what: "De officiële EU-methode voor het meten van de milieuvoetafdruk van producten.",
      },
      {
        name: "ecoinvent",
        url: "https://ecoinvent.org",
        what: "Een van de grootste internationale databases met levenscyclusgegevens.",
      },
      {
        name: "IPCC (Intergovernmental Panel on Climate Change)",
        url: "https://www.ipcc.ch",
        what: "Het VN-klimaatpanel; brongegevens over broeikasgassen en opwarmingsfactoren.",
      },
      {
        name: "Our World in Data",
        url: "https://ourworldindata.org/environmental-impacts-of-food",
        what: "Openbare, goed onderbouwde datasets over milieu-impact, met bronvermelding.",
      },
    ],
  },
  {
    heading: "Prijs & besparing (true pricing)",
    intro:
      "Naast een CO2-besparing tonen we bij sommige producten ook een indicatief eurobedrag aan vermeden milieukosten, en een tastbare vergelijking (autokilometers, CO2-opname van een boom). Het eurobedrag is geen winkelprijs, maar een maatschappelijke kostprijs.",
    sources: [
      {
        name: "CE Delft, Handboek Milieuprijzen 2023",
        url: "https://ce.nl/wp-content/uploads/2023/03/CE_Delft_220175_Handboek_Milieuprijzen_2023_DEF.pdf",
        what: "Officiële Nederlandse schaduwprijs voor CO2: €0,13 per kg CO2-eq. (middenschatting, bandbreedte €0,05-€0,16, prijspeil 2021). Wij gebruiken de middenschatting uit Tabel 1 (p.6) en Tabel 2 (p.7).",
      },
      {
        name: "CBS, CO2-uitstoot wegverkeer in 2022",
        url: "https://www.cbs.nl/nl-nl/nieuws/2024/16/co2-uitstoot-wegverkeer-in-2022-met-bijna-drie-procent-toegenomen",
        what: "Totale CO2-uitstoot van Nederlandse personenauto's in 2022: 15,3 miljard kg.",
      },
      {
        name: "CBS, Motorvoertuigen reden 7 procent meer in 2022",
        url: "https://www.cbs.nl/nl-nl/nieuws/2023/43/motorvoertuigen-reden-7-procent-meer-in-2022",
        what: "Totaal afgelegde kilometers door Nederlandse personenauto's in 2022: 114,31 miljard km. Samen met het vorige cijfer (zelfde jaar, zelfde voertuigcategorie) berekenen wij hieruit zelf een gemiddelde uitstoot van ≈134 gram CO2 per kilometer voor de hele rijdende vloot, niet alleen nieuwe auto's.",
      },
      {
        name: "Staatsbosbeheer, Bos en CO2",
        url: "https://www.staatsbosbeheer.nl/wat-we-doen/co2-opslaan/bos-en-co2",
        what: "Een vrijstaande boom neemt gemiddeld 10 tot 40 kg CO2 per jaar op. Wij gebruiken het midden van die bandbreedte (25 kg/jaar).",
      },
    ],
  },
  {
    heading: "Voeding",
    intro:
      "Voor claims over plantaardige alternatieven, vleesvervangers en voedselverspilling.",
    sources: [
      {
        name: "Poore & Nemecek (2018), Science",
        url: "https://www.science.org/doi/10.1126/science.aaq0216",
        what: "De meest geciteerde wereldwijde studie naar de milieu-impact van voedsel.",
      },
      {
        name: "Milieu Centraal",
        url: "https://www.milieucentraal.nl",
        what: "Onafhankelijke Nederlandse voorlichting over o.a. de voetafdruk van eten.",
      },
      {
        name: "WRAP",
        url: "https://www.wrap.ngo",
        what: "Onderzoek naar voedselverspilling en circulaire economie.",
      },
    ],
  },
  {
    heading: "Kleding & textiel",
    intro:
      "Voor claims over katoen, gerecyclede vezels, tweedehands en fast fashion.",
    sources: [
      {
        name: "Ellen MacArthur Foundation",
        url: "https://www.ellenmacarthurfoundation.org/topics/fashion/overview",
        what: "Toonaangevend onderzoek naar circulaire mode en textielimpact.",
      },
      {
        name: "European Environment Agency, textiel",
        url: "https://www.eea.europa.eu/en/topics/in-depth/textiles",
        what: "Europese cijfers over de milieu- en klimaatimpact van textiel.",
      },
    ],
  },
  {
    heading: "Elektronica & apparaten",
    intro:
      "Voor claims over refurbished apparaten, langer gebruik en energieverbruik.",
    sources: [
      {
        name: "International Energy Agency (IEA)",
        url: "https://www.iea.org",
        what: "Wereldwijde data over energieverbruik en de uitstoot van elektriciteit.",
      },
      {
        name: "RIVM",
        url: "https://www.rivm.nl",
        what: "Nederlands onderzoeksinstituut; o.a. levenscyclus- en milieudata.",
      },
      {
        name: "CE Delft",
        url: "https://cedelft.eu",
        what: "Onafhankelijk onderzoeksbureau voor milieu en energie.",
      },
    ],
  },
];

export default function BronnenPage() {
  return (
    <>
      <SiteNav switchHref="/en/sources" />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-32 md:px-8">
        <h1 className="mb-6 font-display text-headline-md text-on-background md:text-display-lg-mobile">
          Onze bronnen
        </h1>

        <div className="space-y-8 text-body-md leading-relaxed text-on-surface-variant">
          <section>
            <p className="mb-3">
              Bij veel producten noemen we een{" "}
              <strong>indicatieve CO2-besparing</strong> ten opzichte van het
              gangbare, niet-duurzame alternatief. Op deze pagina laten we zien
              waar die schattingen op gebaseerd zijn, voor volledige
              transparantie.
            </p>
            <p>
              Belangrijk: onze cijfers zijn <strong>schattingen met een
              bandbreedte</strong>, afgeleid uit openbare levenscyclusstudies en
              de bronnen hieronder. Het zijn nadrukkelijk{" "}
              <em>geen</em> gecertificeerde metingen van een specifiek
              exemplaar. De werkelijke besparing hangt af van hoe je een product
              gebruikt en van wat je ermee vervangt. Zie ook onze{" "}
              <Link href="/methodologie" className="text-primary underline">
                methodologie
              </Link>{" "}
              en{" "}
              <Link href="/voorwaarden" className="text-primary underline">
                algemene voorwaarden
              </Link>
              .
            </p>
          </section>

          {GROUPS.map((g) => (
            <section key={g.heading}>
              <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
                {g.heading}
              </h2>
              <p className="mb-3">{g.intro}</p>
              <ul className="space-y-3">
                {g.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary underline"
                    >
                      {s.name} ↗
                    </a>
                    <span className="block text-sm">{s.what}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              Iets gevonden dat beter kan?
            </h2>
            <p>
              We houden deze lijst bewust actueel. Zie je een claim die je met
              een betere bron kunt onderbouwen of ontkrachten, laat het ons
              weten via de nieuwsbrief-pagina, correcties maken de lijst
              alleen maar sterker.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/" className="text-primary underline">
            ← Terug naar de ranglijst
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
