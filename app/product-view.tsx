// Gedeelde productdetail-weergave voor beide talen. De routes
// app/product/[slug] (nl) en app/en/product/[slug] (en) zijn dunne schillen.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, type SourceMeasurement } from "@/lib/queries";
import { categoryToSlug, isCategory } from "@/lib/categories";
import {
  splitTags,
  certificationLabel,
  certificationIcon,
} from "@/lib/certifications";
import {
  UI,
  localePath,
  translateTag,
  categoryLabel,
  sourceLabel,
  type Locale,
  type UIStrings,
} from "@/lib/i18n";
import { pexelsSized } from "@/lib/pexels";
import { safeJsonLd } from "@/lib/json-ld";
import { WEIGHTS } from "@/lib/scoring/version";
import { SiteNav, SiteFooter } from "@/app/site-chrome";
import { TruePriceCard } from "@/app/true-price-card";

function formatMeasurement(m: SourceMeasurement, ui: UIStrings): string {
  if (m.value === null) return ui.insufficientData;
  const n = m.value.toLocaleString(ui.dateLocale);
  switch (m.source) {
    case "youtube":
      return ui.views30d(n);
    case "reddit":
      return ui.mentionsWeek(n);
    case "google_trends":
      return ui.interest(n);
    case "wikipedia":
      return ui.pageviews30d(n);
    case "gdelt_news":
      return ui.articlesWeek(n);
    case "ebay":
      return ui.listings(n);
  }
}

export async function ProductView({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const detail = await getProductBySlug(slug);
  if (!detail) notFound();

  const ui = UI[locale];
  const {
    product,
    latest,
    history,
    measurements,
    certificationEvidence,
    offers,
  } = detail;

  // Fallback: geen aparte verkoopkanalen, maar wel de oude enkele kooplink.
  const buyLinks =
    offers.length > 0
      ? offers
      : product.affiliate_url
        ? [
            {
              position: 1,
              retailer: ui.viewProduct,
              url: product.affiliate_url,
              price: null,
            },
          ]
        : [];
  const evidenceFor = (cert: string) =>
    certificationEvidence.find((e) => e.certification === cert);
  const { certifications, characteristics } = splitTags(
    product.sustainability_tags
  );
  const catSlug = isCategory(product.category)
    ? categoryToSlug(product.category)
    : product.category;
  const catLabel = isCategory(product.category)
    ? categoryLabel(product.category, locale)
    : product.category;

  // Redactionele teksten in de paginataal; Engels valt terug op Nederlands
  // zolang er nog geen vertaling is ingevuld.
  const description =
    locale === "en"
      ? product.description_en ?? product.description
      : product.description;
  const whySustainable =
    locale === "en"
      ? product.why_sustainable_en ?? product.why_sustainable
      : product.why_sustainable;
  const co2Note =
    locale === "en" ? product.co2_note_en ?? product.co2_note : product.co2_note;

  // JSON-LD: alleen velden die we echt hebben (geen verzonnen prijs/reviews).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: catLabel,
    ...(product.image_url ? { image: product.image_url } : {}),
  };

  const switchHref =
    locale === "en" ? `/product/${slug}` : `/en/product/${slug}`;

  return (
    <>
      <SiteNav locale={locale} switchHref={switchHref} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8">
        <Link
          href={localePath(locale, `/trending/${catSlug}`)}
          className="text-sm text-on-surface-variant hover:text-primary"
        >
          ← {catLabel}
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-display text-headline-md text-on-background">
            {product.name}
          </h1>
          <ScoreDisplay latest={latest} ui={ui} />
        </div>

        {description && (
          <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
            {description}
          </p>
        )}

        {product.image_url && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-outline-variant/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pexelsSized(product.image_url, 1200, 800)}
              alt={product.name}
              className="max-h-[420px] w-full object-cover"
            />
          </div>
        )}

        {buyLinks.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-on-background">
              {ui.buyHere}
            </p>
            <div className="flex flex-wrap gap-3">
              {buyLinks.map((offer) => (
                <a
                  key={offer.position}
                  href={offer.url}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-3 font-semibold text-on-primary shadow-md transition hover:opacity-90"
                >
                  {offer.retailer}
                  {offer.price ? (
                    <span className="text-sm font-normal opacity-90">
                      ±€{Math.round(offer.price)}
                    </span>
                  ) : null}
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
            <p className="mt-2 text-xs text-on-surface-variant">
              {ui.affiliateNote}
            </p>
          </div>
        )}

        {/* Waarom op de lijst */}
        <section className="mt-8 rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="mb-3 font-semibold text-on-background">
            {ui.whyListed}
          </h2>

          {certifications.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm text-on-surface-variant">
                {ui.recognisedLabels}
              </p>
              <ul className="space-y-2">
                {certifications.map((c) => {
                  const ev = evidenceFor(c);
                  return (
                    <li key={c} className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-container/25 px-3 py-1 text-sm font-medium text-primary">
                        <span aria-hidden="true">{certificationIcon(c)}</span>
                        {certificationLabel(c)}
                      </span>
                      {ev?.registration_number && (
                        <span className="text-xs text-on-surface-variant">
                          {ui.regNo} {ev.registration_number}
                        </span>
                      )}
                      {ev?.evidence_url && (
                        <a
                          href={ev.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline"
                        >
                          {ui.checkRegister}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {characteristics.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-on-surface-variant">
                {ui.characteristics}
              </p>
              <div className="flex flex-wrap gap-2">
                {characteristics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-surface-container px-3 py-1 text-sm text-on-surface-variant"
                  >
                    {translateTag(t, locale)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.sustainability_tags.length === 0 && (
            <p className="text-body-md text-on-surface-variant">{ui.tagsSoon}</p>
          )}
        </section>

        {/* Duurzame winst t.o.v. het gangbare alternatief */}
        {(whySustainable ||
          co2Note ||
          product.co2_kg_per_year ||
          product.annual_saving_eur) && (
          <section className="mt-8 rounded-xl border border-primary-container/60 bg-primary-container/10 p-6">
            <h2 className="mb-3 font-semibold text-on-background">
              {ui.greenGainTitle}
            </h2>
            <TruePriceCard
              co2KgPerYear={product.co2_kg_per_year}
              annualSavingEur={product.annual_saving_eur}
              usageBasis={
                locale === "en"
                  ? product.usage_basis_en ?? product.usage_basis
                  : product.usage_basis
              }
              locale={locale}
            />
            {whySustainable && (
              <p className="mb-3 text-body-md text-on-surface-variant">
                {whySustainable}
              </p>
            )}
            {co2Note && (
              <p className="text-body-md text-on-surface-variant">
                <strong className="text-primary">{ui.co2Label}</strong>{" "}
                {co2Note}
              </p>
            )}
            <p className="mt-3 text-xs text-on-surface-variant">
              {ui.co2Disclaimer}{" "}
              {(co2Note || product.co2_kg_per_year || product.annual_saving_eur) && (
                <Link href={ui.sourcesHref} className="text-primary underline">
                  {ui.viewSources}
                </Link>
              )}
            </p>
          </section>
        )}

        {/* Levensduur en afdankfase */}
        {(product.lifespan || product.end_of_life) && (
          <section className="mt-8 rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
            <h2 className="mb-3 font-semibold text-on-background">
              {ui.lifespanTitle}
            </h2>
            <dl className="space-y-2 text-body-md text-on-surface-variant">
              {product.lifespan && (
                <div className="flex flex-wrap gap-2">
                  <dt className="font-medium text-on-background">
                    {ui.avgLifespan}
                  </dt>
                  <dd>{product.lifespan}</dd>
                </div>
              )}
              {product.end_of_life && (
                <div className="flex flex-wrap gap-2">
                  <dt className="font-medium text-on-background">
                    {ui.afterUse}
                  </dt>
                  <dd>{product.end_of_life}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Score-opbouw per bron */}
        <section className="mt-10">
          <h2 className="mb-1 font-display text-headline-md-mobile text-on-background">
            {ui.scoreBreakdown}
          </h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            {ui.scoreBreakdownText}{" "}
            <Link href={ui.methodologyHref} className="text-primary underline">
              {ui.howItWorks}
            </Link>
            .
          </p>
          <div className="space-y-3">
            {measurements.map((m) => (
              <div
                key={m.source}
                className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4"
              >
                <div>
                  <div className="font-semibold text-on-background">
                    {sourceLabel(m.source)}
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    {formatMeasurement(m, ui)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-headline-md-mobile text-primary">
                    {Math.round((WEIGHTS[m.source] ?? 0) * 100)}%
                  </div>
                  <div className="text-[10px] uppercase text-on-surface-variant">
                    {ui.weighting}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 30-dagen-grafiek */}
        <section className="mt-10">
          <h2 className="mb-4 font-display text-headline-md-mobile text-on-background">
            {ui.chartTitle}
          </h2>
          <ScoreChart history={history} ui={ui} />
        </section>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}

function ScoreDisplay({
  latest,
  ui,
}: {
  latest: { score: number; rank: number } | null;
  ui: UIStrings;
}) {
  if (!latest) {
    return (
      <div className="rounded-xl bg-surface-container px-4 py-3 text-right">
        <div className="text-sm font-medium text-on-surface-variant">
          {ui.noScoreBig}
        </div>
        <div className="text-xs text-on-surface-variant">{ui.twoWeeks}</div>
      </div>
    );
  }
  return (
    <div className="text-right">
      <div className="font-display text-[40px] leading-none text-primary">
        {latest.score}
      </div>
      <div className="text-[10px] uppercase text-on-surface-variant">
        {ui.trendScoreRank(latest.rank)}
      </div>
    </div>
  );
}

function ScoreChart({
  history,
  ui,
}: {
  history: { snapshot_date: string; score: number }[];
  ui: UIStrings;
}) {
  if (history.length < 2) {
    return (
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center text-sm text-on-surface-variant">
        {ui.chartEmpty}
      </div>
    );
  }

  const w = 600;
  const h = 160;
  const pad = 8;
  const scores = history.map((p) => p.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const points = history
    .map((p, i) => {
      const x = pad + (i / (history.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((p.score - min) / range) * (h - 2 * pad);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={ui.chartAria}>
        <polyline
          points={points}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
