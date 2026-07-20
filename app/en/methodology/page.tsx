// Engelse versie van /methodologie. Inhoudelijk gelijk aan de Nederlandse
// pagina; bij aanpassingen beide bestanden bijwerken.
import type { Metadata } from "next";
import Link from "next/link";
import { WEIGHTS } from "@/lib/scoring/version";
import { SiteNav, SiteFooter } from "@/app/site-chrome";

export const metadata: Metadata = {
  title: "Methodology — how our trend score works | Most Wanted",
  description:
    "Plain-language explanation: how we rank sustainable products by acceleration (not volume), which sources we use and how we prevent greenwashing.",
  alternates: {
    canonical: "/en/methodology",
    languages: { nl: "/methodologie", en: "/en/methodology" },
  },
};

export default function MethodologyPage() {
  return (
    <>
      <SiteNav locale="en" switchHref="/methodologie" />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-32 md:px-8">
        <h1 className="mb-6 font-display text-headline-md text-on-background md:text-display-lg-mobile">
          How our ranking works
        </h1>

        <div className="space-y-8 text-body-md leading-relaxed text-on-surface-variant">
          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              We measure acceleration, not volume
            </h2>
            <p>
              Most lists show what sells the most. We do something different: we
              measure how fast interest in a product is <strong>growing</strong>.
              A small product that is rising quickly therefore scores higher with
              us than a big product that has been standing still for years. That
              way you see trends while they are emerging.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              Our data sources
            </h2>
            <p className="mb-3">
              Every day we collect public signals. Each source counts towards the
              final score with a fixed weight:
            </p>
            <ul className="space-y-2">
              <li>
                <strong>Google Trends</strong> — search interest in a product (
                {Math.round((WEIGHTS.google_trends ?? 0) * 100)}%)
              </li>
              <li>
                <strong>YouTube</strong> — views of recent videos (
                {Math.round((WEIGHTS.youtube ?? 0) * 100)}%)
              </li>
              <li>
                <strong>Wikipedia</strong> — page views of the best-matching
                article ({Math.round((WEIGHTS.wikipedia ?? 0) * 100)}%)
              </li>
              <li>
                <strong>News (GDELT)</strong> — how much the world&apos;s news
                media report on the product (
                {Math.round((WEIGHTS.gdelt_news ?? 0) * 100)}%)
              </li>
            </ul>
            <p className="mt-3">
              We deliberately use several independent sources: if one drops out
              temporarily, the score holds up on the others. No single source
              determines the outcome on its own.
            </p>
            <p className="mt-3">
              We compare this week&apos;s measurement with last week&apos;s. That
              growth is converted per source to a figure from 0 to 100, added up
              with weights, and that forms the trend score. A new product
              therefore needs at least two weeks of measurements before it
              receives a score.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              How we make money — and what that does and does not influence
            </h2>
            <p className="mb-3">
              Full transparency: this site is also a business. We earn (or intend
              to earn) money in these ways:
            </p>
            <ul className="mb-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Affiliate links.</strong> If you buy a product through a
                buy button, we sometimes receive a small commission. It costs you
                nothing extra and is always disclosed next to the link.
              </li>
              <li>
                <strong>Sponsorship and advertising.</strong> We may work with
                sponsored placements in the future. You will always recognise
                them by a clear label such as &quot;sponsored&quot; — and they
                will never be disguised inside the ranking.
              </li>
            </ul>
            <p>
              Whatever happens, one rule is untouchable:{" "}
              <strong>the trend score and the ranking are never for sale</strong>
              . The score comes from public data and a fixed formula; the
              assessment of whether a product is sustainable enough for the list
              is also fully separate from commercial agreements. A brand can
              advertise with us, but it cannot climb the list — those two worlds
              never touch.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              How we prevent greenwashing
            </h2>
            <p className="mb-3">
              Not every rising product makes the list. A human reviews every
              product by hand. A product must be demonstrably sustainable: via a
              recognised certification, or via our checklist (for example made
              from recycled material, refillable, or replacing a disposable
              product).
            </p>
            <p>
              Products with misleading claims or from fast-fashion brands are
              rejected. On every product page we show why a product is on the
              list. We never simply write &quot;sustainable&quot; — we show the
              concrete characteristics.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              Transparent and evolving
            </h2>
            <p>
              This is the first version of our method (v1). If we adjust the
              formula, we update this page and keep the old data intact — history
              stays honest, exactly as measured.
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
