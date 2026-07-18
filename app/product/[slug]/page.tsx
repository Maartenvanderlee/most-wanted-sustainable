import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getApprovedSlugs, type SourceMeasurement } from "@/lib/queries";
import { CATEGORY_LABELS, categoryToSlug, isCategory } from "@/lib/categories";
import {
  splitTags,
  certificationLabel,
  certificationIcon,
} from "@/lib/certifications";
import { pexelsSized } from "@/lib/pexels";
import { WEIGHTS } from "@/lib/scoring/version";
import { SiteNav, SiteFooter } from "@/app/site-chrome";
import type { SourceName } from "@/lib/supabase/types";

// ISR: pagina wordt gecachet en maximaal elk uur opnieuw opgebouwd.
export const revalidate = 3600;

// Bouw alle goedgekeurde productpagina's vooraf; nieuwe slugs worden
// bij het eerste bezoek gegenereerd en daarna gecachet.
export async function generateStaticParams() {
  const slugs = await getApprovedSlugs();
  return slugs.map((slug) => ({ slug }));
}

const SOURCE_LABELS: Record<SourceName, string> = {
  google_trends: "Google Trends",
  youtube: "YouTube",
  reddit: "Reddit",
};

function formatMeasurement(m: SourceMeasurement): string {
  if (m.value === null) return "onvoldoende data";
  const n = m.value.toLocaleString("nl-NL");
  switch (m.source) {
    case "youtube":
      return `${n} weergaven (30 dagen)`;
    case "reddit":
      return `${n} vermeldingen (week)`;
    case "google_trends":
      return `interesse ${n}/100`;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const detail = await getProductBySlug(params.slug);
  if (!detail) return { title: "Product niet gevonden | Most Wanted Sustainable" };

  const { product } = detail;
  const label = isCategory(product.category)
    ? CATEGORY_LABELS[product.category]
    : product.category;
  const title = `${product.name} — trending duurzaam | Most Wanted`;
  const description = `${product.name} in de categorie ${label}. Bekijk de trendscore, de opbouw per databron en waarom dit product op onze lijst staat.`;

  return {
    title: title.slice(0, 60),
    description: description.slice(0, 155),
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const detail = await getProductBySlug(params.slug);
  if (!detail) notFound();

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
              retailer: "Bekijk dit product",
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
  const categorySlug = isCategory(product.category)
    ? categoryToSlug(product.category)
    : product.category;
  const categoryLabel = isCategory(product.category)
    ? CATEGORY_LABELS[product.category]
    : product.category;

  // JSON-LD: alleen velden die we echt hebben (geen verzonnen prijs/reviews).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: categoryLabel,
    ...(product.image_url ? { image: product.image_url } : {}),
  };

  return (
    <>
      <SiteNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8">
        <Link
          href={`/trending/${categorySlug}`}
          className="text-sm text-on-surface-variant hover:text-primary"
        >
          ← {categoryLabel}
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-display text-headline-md text-on-background">
            {product.name}
          </h1>
          <ScoreDisplay latest={latest} />
        </div>

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
              Hier online te koop:
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
              Affiliate-links — we verdienen mogelijk een kleine commissie. Dit
              heeft geen invloed op de trendscore. Prijzen zijn een indicatie en
              kunnen bij de winkel afwijken.
            </p>
          </div>
        )}

        {/* Waarom op de lijst */}
        <section className="mt-8 rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="mb-3 font-semibold text-on-background">
            Waarom staat dit product op de lijst?
          </h2>

          {certifications.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm text-on-surface-variant">
                Erkende keurmerken:
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
                          reg.nr. {ev.registration_number}
                        </span>
                      )}
                      {ev?.evidence_url && (
                        <a
                          href={ev.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary underline"
                        >
                          controleer in het register ↗
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
              <p className="mb-2 text-sm text-on-surface-variant">Kenmerken:</p>
              <div className="flex flex-wrap gap-2">
                {characteristics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-surface-container px-3 py-1 text-sm text-on-surface-variant"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.sustainability_tags.length === 0 && (
            <p className="text-body-md text-on-surface-variant">
              De duurzaamheidskenmerken worden binnenkort toegevoegd.
            </p>
          )}
        </section>

        {/* Score-opbouw per bron */}
        <section className="mt-10">
          <h2 className="mb-1 font-display text-headline-md-mobile text-on-background">
            Score-opbouw per bron
          </h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            De trendscore meet versnelling, geen volume. Elke bron weegt anders
            mee. <Link href="/methodologie" className="text-primary underline">Zo werkt het</Link>.
          </p>
          <div className="space-y-3">
            {measurements.map((m) => (
              <div
                key={m.source}
                className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-4"
              >
                <div>
                  <div className="font-semibold text-on-background">
                    {SOURCE_LABELS[m.source]}
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    {formatMeasurement(m)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-headline-md-mobile text-primary">
                    {Math.round((WEIGHTS[m.source] ?? 0) * 100)}%
                  </div>
                  <div className="text-[10px] uppercase text-on-surface-variant">
                    weging
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 30-dagen-grafiek */}
        <section className="mt-10">
          <h2 className="mb-4 font-display text-headline-md-mobile text-on-background">
            Trendscore — laatste 30 dagen
          </h2>
          <ScoreChart history={history} />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function ScoreDisplay({
  latest,
}: {
  latest: { score: number; rank: number } | null;
}) {
  if (!latest) {
    return (
      <div className="rounded-xl bg-surface-container px-4 py-3 text-right">
        <div className="text-sm font-medium text-on-surface-variant">
          Nog geen score
        </div>
        <div className="text-xs text-on-surface-variant">± 2 weken historie nodig</div>
      </div>
    );
  }
  return (
    <div className="text-right">
      <div className="font-display text-[40px] leading-none text-primary">
        {latest.score}
      </div>
      <div className="text-[10px] uppercase text-on-surface-variant">
        trendscore · #{latest.rank}
      </div>
    </div>
  );
}

function ScoreChart({
  history,
}: {
  history: { snapshot_date: string; score: number }[];
}) {
  if (history.length < 2) {
    return (
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center text-sm text-on-surface-variant">
        De grafiek verschijnt zodra er meerdere dagen aan metingen zijn.
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
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Trendscore over tijd">
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
