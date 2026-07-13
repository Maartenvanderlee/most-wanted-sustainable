import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getApprovedSlugs, type SourceMeasurement } from "@/lib/queries";
import { CATEGORY_LABELS, categoryToSlug, isCategory } from "@/lib/categories";
import { WEIGHTS } from "@/lib/scoring/version";
import { SiteNav, SiteFooter } from "@/app/site-chrome";
import type { SourceName } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<SourceName, string> = {
  google_trends: "Google Trends",
  reddit: "Reddit",
  youtube: "YouTube",
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

  const { product, latest, history, measurements } = detail;
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

        {/* Waarom op de lijst */}
        <section className="mt-8 rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
          <h2 className="mb-2 font-semibold text-on-background">
            Waarom staat dit product op de lijst?
          </h2>
          {product.sustainability_tags.length > 0 ? (
            <>
              <p className="mb-3 text-body-md text-on-surface-variant">
                Voldoet aan onze criteria:
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sustainability_tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-primary-container/20 px-3 py-1 text-sm text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-body-md text-on-surface-variant">
              De duurzaamheidskenmerken worden binnenkort toegevoegd.
            </p>
          )}
        </section>

        {product.affiliate_url && (
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="mt-6 inline-block rounded-full bg-primary-container px-6 py-3 font-semibold text-on-primary shadow-md transition hover:opacity-90"
          >
            Bekijk product (advertentie)
          </a>
        )}

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
                    {Math.round(WEIGHTS[m.source] * 100)}%
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
