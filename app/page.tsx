import {
  sampleProducts,
  CATEGORY_LABELS,
  CATEGORY_GRADIENTS,
  CATEGORY_ACCENT,
  type SampleProduct,
} from "@/lib/sample-products";

export default function HomePage() {
  const products = sampleProducts;

  return (
    <>
      <SiteNav />

      <main className="mx-auto max-w-container px-5 pb-24 pt-32 md:px-16">
        <Hero />
        <TrendGrid products={products} />
        <NewsletterCta />
      </main>

      <SiteFooter />
    </>
  );
}

/* ---------------- Navigatie ---------------- */

function SiteNav() {
  return (
    <nav className="glass-morphism fixed top-0 z-50 w-full shadow-sm">
      <div className="mx-auto flex max-w-container items-center justify-between px-5 py-4 md:px-16">
        <div className="flex items-center gap-8">
          <span className="font-display text-[22px] font-extrabold text-primary">
            Most&nbsp;Wanted
          </span>
          <div className="hidden items-center gap-6 md:flex">
            <a className="border-b-2 border-primary pb-1 text-primary" href="#">
              Ranglijst
            </a>
            <a
              className="text-on-surface-variant transition-colors hover:text-primary"
              href="#"
            >
              Categorieën
            </a>
            <a
              className="text-on-surface-variant transition-colors hover:text-primary"
              href="#"
            >
              Methodologie
            </a>
          </div>
        </div>
        <a
          href="#nieuwsbrief"
          className="rounded-full bg-primary-container px-6 py-2.5 font-semibold text-on-primary shadow-md transition-all hover:opacity-90"
        >
          Nieuwsbrief
        </a>
      </div>
    </nav>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="mb-16 flex flex-col justify-between gap-8 md:mb-24 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-tertiary-container/25 px-3 py-1 text-tertiary">
          <span className="material-symbols-outlined text-[18px]">
            verified_user
          </span>
          <span className="font-label text-label-caps">
            ONAFHANKELIJKE RANGLIJST
          </span>
        </div>
        <h1 className="mb-6 font-display text-display-lg-mobile leading-tight text-on-background md:text-display-lg">
          De hardst stijgende{" "}
          <span className="text-primary">duurzame</span> producten.
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          We meten versnelling, geen volume. Elke dag opnieuw berekend uit
          publieke databronnen — 100% onafhankelijk van affiliate of
          sponsoring.
        </p>
      </div>
      <div className="flex gap-4">
        <StatCard value="Top 50" label="PRODUCTEN" accent="text-primary" />
        <StatCard value="3" label="DATABRONNEN" accent="text-tertiary" />
      </div>
    </section>
  );
}

function StatCard({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="eco-shadow flex flex-col items-center rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
      <span className={`font-display text-headline-md ${accent}`}>{value}</span>
      <span className="font-label text-label-caps text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}

/* ---------------- Vensters-grid (bento) ---------------- */

function TrendGrid({ products }: { products: SampleProduct[] }) {
  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
      {products.map((product, index) => {
        // Bento-indeling: kaart 1 en de laatste kaart zijn breed.
        const isFeatured = index === 0;
        const isWide = index === products.length - 1;

        if (isFeatured || isWide) {
          return (
            <WideCard
              key={product.slug}
              product={product}
              featured={isFeatured}
            />
          );
        }
        return <StandardCard key={product.slug} product={product} />;
      })}
    </div>
  );
}

function WideCard({
  product,
  featured,
}: {
  product: SampleProduct;
  featured: boolean;
}) {
  const accent = CATEGORY_ACCENT[product.category];
  return (
    <a
      href="#"
      className={`eco-shadow eco-shadow-hover group relative flex flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest md:col-span-8 md:flex-row ${
        featured ? "card-featured-border" : ""
      }`}
    >
      <div className="flex flex-1 flex-col justify-between p-8">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span
              className={`rounded px-2 py-1 font-label text-[10px] ${
                featured
                  ? "bg-primary-fixed text-on-primary-fixed-variant"
                  : "bg-secondary-container text-on-secondary-container"
              }`}
            >
              {featured ? "UITGELICHT" : "STIJGER"}
            </span>
            <span className="font-label text-label-caps text-on-surface-variant">
              {CATEGORY_LABELS[product.category].toUpperCase()}
            </span>
          </div>
          <h2 className="mb-4 font-display text-headline-md text-on-background">
            {product.name}
          </h2>
          <p className="mb-6 font-body text-body-md text-on-surface-variant">
            {product.description}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-surface-container px-3 py-1 font-label text-label-caps">
            {product.geography}
          </span>
          <div className="text-right">
            <div
              className={`font-display text-[40px] leading-none ${accent.text}`}
            >
              {product.trendScore}
            </div>
            <div className="font-label text-[10px] uppercase text-on-surface-variant">
              trendscore
            </div>
          </div>
        </div>
      </div>
      <div
        className={`flex min-h-[220px] items-center justify-center bg-gradient-to-br md:w-1/2 ${CATEGORY_GRADIENTS[product.category]} transition-transform duration-700 group-hover:scale-105`}
      >
        <span className="text-7xl" aria-hidden="true">
          {product.emoji}
        </span>
      </div>
    </a>
  );
}

function StandardCard({ product }: { product: SampleProduct }) {
  const accent = CATEGORY_ACCENT[product.category];
  return (
    <a
      href="#"
      className="eco-shadow eco-shadow-hover group relative flex flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest md:col-span-4"
    >
      <div
        className={`flex h-40 items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENTS[product.category]}`}
      >
        <span
          className="text-5xl transition-transform duration-500 group-hover:scale-110"
          aria-hidden="true"
        >
          {product.emoji}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <span
              className={`font-label text-label-caps uppercase ${accent.text}`}
            >
              {CATEGORY_LABELS[product.category]}
            </span>
            <h3 className="mt-1 font-display text-headline-md-mobile text-on-background">
              {product.name}
            </h3>
          </div>
          <div
            className={`shrink-0 rounded-lg px-3 py-1 font-bold ${accent.bg} ${accent.text}`}
          >
            {product.trendScore}
          </div>
        </div>
        <p className="mb-6 flex-1 font-body text-body-md text-on-surface-variant">
          {product.description}
        </p>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">
            location_on
          </span>
          <span className="font-label text-label-caps text-on-surface-variant">
            {product.geography}
          </span>
        </div>
      </div>
    </a>
  );
}

/* ---------------- Nieuwsbrief ---------------- */

function NewsletterCta() {
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
          Blijf de trends voor
        </h2>
        <p className="mb-10 font-body text-body-lg opacity-90">
          Ontvang wekelijks de grootste stijgers in duurzame producten in je
          inbox. Geen spam, opzeggen kan altijd.
        </p>
        <form className="flex flex-col justify-center gap-4 md:flex-row">
          <input
            type="email"
            placeholder="Je e-mailadres"
            className="w-full rounded-full border border-white/30 bg-white/20 px-6 py-4 text-white backdrop-blur-md placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-secondary-container md:w-80"
          />
          <button
            type="submit"
            className="rounded-full bg-secondary-container px-8 py-4 font-bold text-on-secondary-container shadow-xl transition-transform hover:scale-105"
          >
            Aanmelden
          </button>
        </form>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

function SiteFooter() {
  return (
    <footer className="mt-auto w-full border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-8 px-5 py-12 md:flex-row md:px-16">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <span className="font-display text-headline-md font-black text-primary">
            Most Wanted Sustainable
          </span>
          <p className="max-w-xs text-center font-body text-on-surface-variant md:text-left">
            De onafhankelijke ranglijst van duurzame producten die in
            populariteit versnellen.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-center md:flex md:gap-12 md:text-left">
          <div className="flex flex-col gap-3">
            <span className="font-bold text-primary">Product</span>
            <a className="text-on-surface-variant transition-colors hover:text-primary" href="#">
              Ranglijst
            </a>
            <a className="text-on-surface-variant transition-colors hover:text-primary" href="#">
              Methodologie
            </a>
            <a className="text-on-surface-variant transition-colors hover:text-primary" href="#">
              Categorieën
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-bold text-primary">Juridisch</span>
            <a className="text-on-surface-variant transition-colors hover:text-primary" href="#">
              Privacy
            </a>
            <a className="text-on-surface-variant transition-colors hover:text-primary" href="#">
              Voorwaarden
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-4 border-t border-outline-variant/30 px-5 py-6 md:flex-row md:px-16">
        <p className="text-sm text-on-surface-variant">
          © 2026 Most Wanted Sustainable. Alle rechten voorbehouden.
        </p>
        <p className="text-sm text-on-surface-variant">
          Voorbeeldgegevens · echte data volgt zodra de pijplijn draait
        </p>
      </div>
    </footer>
  );
}
