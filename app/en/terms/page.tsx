import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav, SiteFooter } from "@/app/site-chrome";

export const metadata: Metadata = {
  title: "Terms of use | Risegoods",
  description:
    "The terms for using Risegoods: how we counter greenwashing, and why our CO2 and sustainability information is indicative and provided without liability.",
  alternates: {
    canonical: "/en/terms",
    languages: { nl: "/voorwaarden", en: "/en/terms" },
  },
};

const LAST_UPDATED = "21 July 2026";

export default function TermsPage() {
  return (
    <>
      <SiteNav locale="en" switchHref="/voorwaarden" />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-32 md:px-8">
        <h1 className="mb-2 font-display text-headline-md text-on-background md:text-display-lg-mobile">
          Terms of use
        </h1>
        <p className="mb-8 text-sm text-on-surface-variant">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="space-y-8 text-body-md leading-relaxed text-on-surface-variant">
          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              1. Who we are and what this site is
            </h2>
            <p>
              Risegoods (&quot;we&quot;, &quot;the site&quot;) is an
              independent, informational platform that ranks sustainable products
              on a trend score measuring acceleration. We are{" "}
              <strong>not a seller</strong>: you cannot buy anything from us.
              Where we link to a shop, the purchase happens entirely with that
              third party, under their own terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              2. Our information is indicative, not a guarantee
            </h2>
            <p className="mb-3">
              We compile our content with care, but all information on the site,
              including trend scores, product descriptions, sustainability
              characteristics and <strong>CO2-saving estimates</strong>, is
              intended as general guidance and is <strong>indicative</strong>.
            </p>
            <p className="mb-3">
              CO2 figures are always shown as a range and are derived from public
              life-cycle studies (see our{" "}
              <Link href="/en/sources" className="text-primary underline">
                sources page
              </Link>
              ). They are explicitly not certified measurements of a specific
              item. The actual saving depends on your use and on what you
              replace, and may differ.
            </p>
            <p>
              You can therefore <strong>derive no rights</strong> from the
              information on the site, and we accept no liability for decisions
              you make based on it.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              3. How we counter greenwashing
            </h2>
            <p className="mb-3">
              Trust is our core. A product only makes the list after a human
              review against a fixed checklist: it must hold a recognised
              certification (where possible with a verifiable registration
              number) or demonstrably meet our sustainability criteria. Products
              with misleading or debunked claims are rejected. On every product
              page we show why a product is listed.
            </p>
            <p>
              We never simply write that something is &quot;sustainable&quot;;
              we name the concrete characteristics. Even so, sustainability
              remains partly a judgement: we do not guarantee that every listed
              product is the most sustainable choice in all circumstances.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              4. No liability for third-party products
            </h2>
            <p>
              We do not make, sell, deliver or guarantee the listed products. For
              the products themselves, quality, safety, delivery, warranty, and
              the accuracy of the manufacturer&apos;s or shop&apos;s claims, the
              selling party is solely responsible. Direct any complaints or
              claims about a product to the shop where you buy it.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              5. Business model and independence
            </h2>
            <p>
              We earn (or intend to earn) through affiliate links and possibly
              sponsorship or advertising. If you buy through a link, we sometimes
              receive a small commission; it costs you nothing extra and is
              always disclosed. One rule is untouchable:{" "}
              <strong>the trend score and the ranking are never for sale</strong>.
              Commercial arrangements have no influence whatsoever on the score
              or on whether a product is judged sustainable enough. More on our{" "}
              <Link href="/en/methodology" className="text-primary underline">
                methodology page
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              6. External links
            </h2>
            <p>
              The site contains links to third-party websites (shops, sources).
              We have no control over their content and are not responsible for
              their information, products or privacy policy.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              7. Intellectual property
            </h2>
            <p>
              The texts, design and compiled data on this site belong to Most
              Wanted Sustainable unless stated otherwise. You may read and share
              the content with attribution, but not copy or reuse it commercially
              without permission.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              8. Changes
            </h2>
            <p>
              We may update these terms as the site evolves. The date at the top
              indicates the last change; the current version applies from
              publication on this page.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-display text-headline-md-mobile text-on-background">
              9. Governing law
            </h2>
            <p>Use of this site is governed by the law of the Netherlands.</p>
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
