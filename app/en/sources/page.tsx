import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/app/site-chrome";

export const metadata: Metadata = {
  title: "Sources: what our CO2 estimates are based on | Most Wanted",
  description:
    "The authoritative sources and life-cycle studies behind our indicative per-product CO2 savings. Full transparency.",
  alternates: {
    canonical: "/en/sources",
    languages: { nl: "/bronnen", en: "/en/sources" },
  },
};

type Source = { name: string; url: string; what: string };

const GROUPS: { heading: string; intro: string; sources: Source[] }[] = [
  {
    heading: "General method & life-cycle assessment (LCA)",
    intro:
      "The basis under every CO2 comparison: how you measure a product's impact across its whole life (raw material, production, transport, use, waste).",
    sources: [
      {
        name: "European Commission, Environmental Footprint & JRC",
        url: "https://green-business.ec.europa.eu/environmental-footprint-methods_en",
        what: "The official EU method for measuring a product's environmental footprint.",
      },
      {
        name: "ecoinvent",
        url: "https://ecoinvent.org",
        what: "One of the largest international life-cycle inventory databases.",
      },
      {
        name: "IPCC (Intergovernmental Panel on Climate Change)",
        url: "https://www.ipcc.ch",
        what: "The UN climate panel; source data on greenhouse gases and warming factors.",
      },
      {
        name: "Our World in Data",
        url: "https://ourworldindata.org/environmental-impacts-of-food",
        what: "Public, well-referenced datasets on environmental impact.",
      },
    ],
  },
  {
    heading: "Food",
    intro:
      "For claims about plant-based alternatives, meat substitutes and food waste.",
    sources: [
      {
        name: "Poore & Nemecek (2018), Science",
        url: "https://www.science.org/doi/10.1126/science.aaq0216",
        what: "The most cited global study on the environmental impact of food.",
      },
      {
        name: "Milieu Centraal",
        url: "https://www.milieucentraal.nl",
        what: "Independent Dutch guidance on, among other things, the footprint of food.",
      },
      {
        name: "WRAP",
        url: "https://www.wrap.ngo",
        what: "Research on food waste and the circular economy.",
      },
    ],
  },
  {
    heading: "Clothing & textiles",
    intro:
      "For claims about cotton, recycled fibres, second-hand and fast fashion.",
    sources: [
      {
        name: "Ellen MacArthur Foundation",
        url: "https://www.ellenmacarthurfoundation.org/topics/fashion/overview",
        what: "Leading research on circular fashion and textile impact.",
      },
      {
        name: "European Environment Agency, textiles",
        url: "https://www.eea.europa.eu/en/topics/in-depth/textiles",
        what: "European figures on the environmental and climate impact of textiles.",
      },
    ],
  },
  {
    heading: "Electronics & appliances",
    intro:
      "For claims about refurbished devices, longer use and energy consumption.",
    sources: [
      {
        name: "International Energy Agency (IEA)",
        url: "https://www.iea.org",
        what: "Global data on energy use and the emissions of electricity.",
      },
      {
        name: "RIVM",
        url: "https://www.rivm.nl",
        what: "Dutch research institute; life-cycle and environmental data.",
      },
      {
        name: "CE Delft",
        url: "https://cedelft.eu",
        what: "Independent research consultancy for environment and energy.",
      },
    ],
  },
];

export default function SourcesPage() {
  return (
    <>
      <SiteNav locale="en" switchHref="/bronnen" />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-32 md:px-8">
        <h1 className="mb-6 font-display text-headline-md text-on-background md:text-display-lg-mobile">
          Our sources
        </h1>

        <div className="space-y-8 text-body-md leading-relaxed text-on-surface-variant">
          <section>
            <p className="mb-3">
              For many products we state an{" "}
              <strong>indicative CO2 saving</strong> compared with the
              conventional, non-sustainable alternative. This page shows what
              those estimates are based on, for full transparency.
            </p>
            <p>
              Important: our figures are <strong>estimates with a range</strong>,
              derived from public life-cycle studies and the sources below. They
              are explicitly <em>not</em> certified measurements of a specific
              item. The actual saving depends on how you use a product and on
              what you replace. See also our{" "}
              <Link href="/en/methodology" className="text-primary underline">
                methodology
              </Link>{" "}
              and{" "}
              <Link href="/en/terms" className="text-primary underline">
                terms of use
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
              Spotted something we can improve?
            </h2>
            <p>
              We keep this list current on purpose. If you see a claim you can
              back up, or debunk, with a better source, let us know via the
              newsletter page. Corrections only make the list stronger.
            </p>
          </section>
        </div>

        <div className="mt-10">
          <Link href="/en" className="text-primary underline">
            ← Back to the ranking
          </Link>
        </div>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
