import type { Metadata } from "next";
import Link from "next/link";
import { WEIGHTS } from "@/lib/scoring/version";
import { SiteNav, SiteFooter } from "@/app/site-chrome";

export const metadata: Metadata = {
  title: "Methodologie — zo werkt onze trendscore | Most Wanted",
  description:
    "Uitleg in gewone taal: hoe we duurzame producten rangschikken op versnelling (niet volume), welke bronnen we gebruiken en hoe we greenwashing voorkomen.",
  alternates: {
    canonical: "/methodologie",
    languages: { nl: "/methodologie", en: "/en/methodology" },
  },
};

export default function MethodologiePage() {
  return (
    <>
      <SiteNav switchHref="/en/methodology" />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-32 md:px-8">
        <h1 className="mb-6 font-display text-headline-md text-on-background md:text-display-lg-mobile">
          Zo werkt onze ranglijst
        </h1>

        <div className="space-y-8 text-body-md leading-relaxed text-on-surface-variant">
          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              We meten versnelling, geen volume
            </h2>
            <p>
              De meeste lijstjes tonen wat het meest verkocht wordt. Wij doen
              iets anders: we meten hoe hard de belangstelling voor een product{" "}
              <strong>groeit</strong>. Een klein product dat snel opkomt scoort
              bij ons dus hoger dan een groot product dat al jaren stilstaat. Zo
              zie je trends terwijl ze ontstaan.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              Onze databronnen
            </h2>
            <p className="mb-3">
              Elke dag verzamelen we publieke signalen. Elke bron telt met een
              vast gewicht mee in de eindscore:
            </p>
            <ul className="space-y-2">
              <li>
                <strong>Google Trends</strong> — de zoekinteresse in een product
                ({Math.round((WEIGHTS.google_trends ?? 0) * 100)}%)
              </li>
              <li>
                <strong>YouTube</strong> — het aantal weergaven van recente
                video&apos;s ({Math.round((WEIGHTS.youtube ?? 0) * 100)}%)
              </li>
              <li>
                <strong>Wikipedia</strong> — de paginaweergaven van het best
                passende artikel ({Math.round((WEIGHTS.wikipedia ?? 0) * 100)}%)
              </li>
              <li>
                <strong>Nieuws (GDELT)</strong> — hoeveel de wereldwijde
                nieuwsmedia over het product berichten (
                {Math.round((WEIGHTS.gdelt_news ?? 0) * 100)}%)
              </li>
            </ul>
            <p className="mt-3">
              We gebruiken meerdere onafhankelijke bronnen met opzet: valt er
              eentje tijdelijk uit, dan blijft de score overeind op de overige.
              Geen enkele bron bepaalt in z&apos;n eentje de uitkomst.
            </p>
            <p className="mt-3">
              We vergelijken de meting van deze week met die van vorige week. Die
              groei zetten we per bron om naar een cijfer van 0 tot 100, tellen we
              gewogen op, en dat vormt de trendscore. Een nieuw product heeft
              daarom minstens twee weken aan metingen nodig voordat het een score
              krijgt.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              Hoe we geld verdienen — en wat dat wél en niet beïnvloedt
            </h2>
            <p className="mb-3">
              Volledige openheid: deze site is ook een bedrijf. We verdienen (of
              willen gaan verdienen) op deze manieren:
            </p>
            <ul className="mb-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Affiliate-links.</strong> Koop je een product via een
                &quot;Koop dit product&quot;-knop, dan ontvangen wij soms een
                kleine commissie. Dat kost jou niets extra en staat altijd bij de
                link vermeld.
              </li>
              <li>
                <strong>Sponsoring en advertenties.</strong> Mogelijk werken we in
                de toekomst met gesponsorde uitingen. Die herken je dan altijd aan
                een duidelijk label als &quot;gesponsord&quot; — en ze staan nooit
                vermomd tussen de ranglijst.
              </li>
            </ul>
            <p>
              Wat er ook gebeurt, één regel is onaantastbaar:{" "}
              <strong>
                de trendscore en de rangorde zijn nooit te koop
              </strong>
              . De score komt uit publieke data en een vaste formule; ook de
              beoordeling of een product duurzaam genoeg is voor de lijst staat
              volledig los van commerciële afspraken. Een merk kan dus wél bij ons
              adverteren, maar niet hoger op de lijst komen — die twee werelden
              raken elkaar niet.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              Hoe we greenwashing voorkomen
            </h2>
            <p className="mb-3">
              Niet elk product dat opkomt komt op de lijst. Een mens beoordeelt
              elk product met de hand. Een product moet aantoonbaar duurzaam zijn:
              via een erkend keurmerk, óf via onze checklist (bijvoorbeeld gemaakt
              van gerecycled materiaal, navulbaar, of het vervangt een
              wegwerpproduct).
            </p>
            <p>
              Producten met misleidende claims of van fast-fashion-merken wijzen
              we af. Op elke productpagina laten we zien wáárom een product op de
              lijst staat. We schrijven nooit zomaar &quot;duurzaam&quot; — we
              tonen de concrete kenmerken.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              Transparant en in ontwikkeling
            </h2>
            <p>
              Dit is de eerste versie van onze methode (v1). Passen we de formule
              aan, dan werken we deze pagina bij en houden we de oude gegevens
              intact — de geschiedenis blijft eerlijk zoals gemeten.
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
