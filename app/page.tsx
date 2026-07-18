import { draftMode } from "next/headers";
import { getRankedProducts } from "@/lib/queries";
import { getContent, type SiteContent } from "@/lib/content";
import { WEIGHTS } from "@/lib/scoring/version";
import { SiteNav, SiteFooter } from "./site-chrome";
import { HomeGrid } from "./home-grid";
import { NewsletterForm } from "./newsletter/form";

// ISR: pagina wordt gecachet en maximaal elk uur opnieuw opgebouwd.
// Admin-acties en de pipeline verversen de cache direct via revalidatePath.
// In previewmodus (Draft Mode, via /api/preview) rendert Next.js dynamisch
// met conceptteksten — zonder de cache voor bezoekers te raken.
export const revalidate = 3600;

// Zet *woord* om in een groen uitgelicht woord.
function renderTitle(title: string) {
  return title
    .split(/\*([^*]+)\*/)
    .map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="text-primary">
          {part}
        </span>
      ) : (
        part
      )
    );
}

export default async function HomePage() {
  const { isEnabled: preview } = draftMode();
  const [products, content] = await Promise.all([
    getRankedProducts(),
    getContent(preview),
  ]);

  // Structured data: de ranglijst als ItemList (helpt zoekmachines en
  // AI-assistenten de lijst als lijst te begrijpen en te citeren).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Most Wanted Sustainable — trending duurzame producten",
    description:
      "Dagelijkse ranglijst van duurzame producten die in populariteit versnellen.",
    itemListElement: products.slice(0, 10).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `/product/${p.slug}`,
    })),
  };

  return (
    <>
      <SiteNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-container px-5 pb-24 pt-32 md:px-16">
        <Hero count={products.length} content={content} />

        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <HomeGrid products={products} />
        )}

        <NewsletterCta content={content} />
      </main>

      <SiteFooter />
      {preview && <PreviewBanner />}
    </>
  );
}

function PreviewBanner() {
  return (
    <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-center gap-3 bg-tertiary px-4 py-2 text-sm font-medium text-on-primary">
      Preview-modus: je bekijkt conceptteksten.
      <a href="/api/preview/exit?path=/" className="underline">
        Preview verlaten
      </a>
    </div>
  );
}

function Hero({ count, content }: { count: number; content: SiteContent }) {
  return (
    <section className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-tertiary-container/25 px-3 py-1 text-tertiary">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span className="font-label text-label-caps">
            {content["home.hero.badge"]}
          </span>
        </div>
        <h1 className="mb-6 font-display text-display-lg-mobile leading-tight text-on-background md:text-display-lg">
          {renderTitle(content["home.hero.title"])}
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          {content["home.hero.intro"]}
        </p>
      </div>
      <div className="flex gap-4">
        <StatCard value={count > 0 ? String(count) : "—"} label="PRODUCTEN" accent="text-primary" />
        <StatCard value={String(Object.keys(WEIGHTS).length)} label="DATABRONNEN" accent="text-tertiary" />
      </div>
    </section>
  );
}

function StatCard({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="eco-shadow flex flex-col items-center rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
      <span className={`font-display text-headline-md ${accent}`}>{value}</span>
      <span className="font-label text-label-caps text-on-surface-variant">{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-12 text-center">
      <p className="mb-2 font-display text-headline-md-mobile text-on-background">
        De ranglijst wordt binnenkort gevuld
      </p>
      <p className="mx-auto max-w-md text-body-md text-on-surface-variant">
        Onze pijplijn verzamelt dagelijks data. Zodra producten zijn goedgekeurd
        en er genoeg meetgegevens zijn, verschijnen ze hier met hun trendscore.
      </p>
    </div>
  );
}

function NewsletterCta({ content }: { content: SiteContent }) {
  return (
    <section
      id="nieuwsbrief"
      className="trend-gradient relative mt-24 overflow-hidden rounded-3xl p-12 text-center text-on-primary md:p-24"
    >
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
          <circle cx="20" cy="20" r="15" fill="white" />
          <circle cx="80" cy="40" r="25" fill="white" />
          <circle cx="40" cy="80" r="20" fill="white" />
        </svg>
      </div>
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 className="mb-8 font-display text-display-lg-mobile md:text-display-lg">
          {content["home.newsletter.title"]}
        </h2>
        <p className="mb-10 font-body text-body-lg opacity-90">
          {content["home.newsletter.text"]}
        </p>
        <NewsletterForm />
      </div>
    </section>
  );
}
