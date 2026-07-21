import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/app/site-chrome";

export const metadata: Metadata = {
  title: "Algemene voorwaarden | Most Wanted Sustainable",
  description:
    "De voorwaarden voor het gebruik van Most Wanted Sustainable: hoe we greenwashing tegengaan, en waarom onze CO2- en duurzaamheidsinformatie indicatief is en zonder aansprakelijkheid.",
  alternates: {
    canonical: "/voorwaarden",
    languages: { nl: "/voorwaarden", en: "/en/terms" },
  },
};

// Datum van de laatste inhoudelijke wijziging (handmatig bijwerken).
const LAST_UPDATED = "21 juli 2026";

export default function VoorwaardenPage() {
  return (
    <>
      <SiteNav switchHref="/en/terms" />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-32 md:px-8">
        <h1 className="mb-2 font-display text-headline-md text-on-background md:text-display-lg-mobile">
          Algemene voorwaarden
        </h1>
        <p className="mb-8 text-sm text-on-surface-variant">
          Laatst bijgewerkt: {LAST_UPDATED}
        </p>

        <div className="space-y-8 text-body-md leading-relaxed text-on-surface-variant">
          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              1. Wie we zijn en wat deze site is
            </h2>
            <p>
              Most Wanted Sustainable (&quot;wij&quot;, &quot;de site&quot;) is
              een onafhankelijk, informatief platform dat duurzame producten
              rangschikt op een trendscore die versnelling meet. Wij zijn{" "}
              <strong>geen verkoper</strong>: je kunt bij ons niets kopen. Waar
              we naar een winkel verwijzen, gebeurt de aankoop volledig bij die
              derde partij, onder diens eigen voorwaarden.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              2. Onze informatie is indicatief, geen garantie
            </h2>
            <p className="mb-3">
              We stellen onze inhoud met zorg samen, maar alle informatie op de
              site, waaronder trendscores, productbeschrijvingen,
              duurzaamheidskenmerken en <strong>schattingen van
              CO2-besparing</strong>, is bedoeld als algemene voorlichting en
              is <strong>indicatief</strong>.
            </p>
            <p className="mb-3">
              CO2-cijfers worden altijd als bandbreedte getoond en zijn afgeleid
              uit openbare levenscyclusstudies (zie onze{" "}
              <Link href="/bronnen" className="text-primary underline">
                bronnenpagina
              </Link>
              ). Het zijn nadrukkelijk geen gecertificeerde metingen van een
              specifiek exemplaar. De werkelijke besparing hangt af van je
              gebruik en van wat je vervangt, en kan afwijken.
            </p>
            <p>
              Je kunt daarom aan de informatie op de site{" "}
              <strong>geen rechten ontlenen</strong>, en wij aanvaarden geen
              aansprakelijkheid voor beslissingen die je op basis daarvan neemt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              3. Hoe we greenwashing tegengaan
            </h2>
            <p className="mb-3">
              Betrouwbaarheid is onze kern. Een product komt alleen op de lijst
              na een menselijke beoordeling volgens een vaste checklist: het
              moet een erkend keurmerk hebben (waar mogelijk met een
              controleerbaar registratienummer) óf aantoonbaar aan onze
              duurzaamheidscriteria voldoen. Producten met misleidende of
              ontkrachte claims wijzen we af. Op elke productpagina tonen we
              wáárom een product op de lijst staat.
            </p>
            <p>
              We schrijven nooit dat iets zonder meer &quot;duurzaam&quot; is,
              maar benoemen de concrete kenmerken. Toch blijft duurzaamheid deels
              een beoordeling: we garanderen niet dat elk vermeld product onder
              alle omstandigheden de meest duurzame keuze is.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              4. Geen aansprakelijkheid voor producten van derden
            </h2>
            <p>
              Wij maken, verkopen, leveren of garanderen de vermelde producten
              niet. Voor de producten zelf, kwaliteit, veiligheid, levering,
              garantie, en de juistheid van claims van de fabrikant of winkel
              is uitsluitend de verkopende partij verantwoordelijk. Klachten of
              aanspraken over een product richt je aan de winkel waar je het
              koopt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              5. Verdienmodel en onafhankelijkheid
            </h2>
            <p>
              We verdienen (of gaan verdienen) via affiliate-links en mogelijk
              sponsoring of advertenties. Koop je via een link, dan ontvangen we
              soms een kleine commissie; dat kost jou niets extra en staat altijd
              vermeld. Eén regel is onaantastbaar:{" "}
              <strong>de trendscore en de rangorde zijn nooit te koop</strong>.
              Commerciële afspraken hebben geen enkele invloed op de score of op
              de beoordeling of een product duurzaam genoeg is. Meer hierover op
              onze{" "}
              <Link href="/methodologie" className="text-primary underline">
                methodologie-pagina
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              6. Externe links
            </h2>
            <p>
              De site bevat links naar websites van derden (winkels, bronnen).
              We hebben geen zeggenschap over de inhoud daarvan en zijn niet
              verantwoordelijk voor hun informatie, producten of privacybeleid.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              7. Intellectueel eigendom
            </h2>
            <p>
              De teksten, vormgeving en samengestelde data op deze site zijn van
              Most Wanted Sustainable, tenzij anders vermeld. Je mag de inhoud
              lezen en delen met bronvermelding, maar niet zonder toestemming
              overnemen of commercieel hergebruiken.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              8. Wijzigingen
            </h2>
            <p>
              We kunnen deze voorwaarden aanpassen wanneer de site zich
              ontwikkelt. De datum bovenaan geeft de laatste wijziging aan; de
              actuele versie geldt vanaf publicatie op deze pagina.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              9. Toepasselijk recht
            </h2>
            <p>
              Op het gebruik van deze site is Nederlands recht van toepassing.
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
