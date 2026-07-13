import { getRankedProducts } from "@/lib/queries";
import { SiteNav, SiteFooter } from "./site-chrome";
import { HomeGrid } from "./home-grid";
import { NewsletterForm } from "./newsletter/form";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getRankedProducts();

  return (
    <>
      <SiteNav />

      <main className="mx-auto max-w-container px-5 pb-24 pt-32 md:px-16">
        <Hero count={products.length} />

        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <HomeGrid products={products} />
        )}

        <NewsletterCta />
      </main>

      <SiteFooter />
    </>
  );
}

function Hero({ count }: { count: number }) {
  return (
    <section className="mb-12 flex flex-col justify-between gap-8 md:mb-16 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-tertiary-container/25 px-3 py-1 text-tertiary">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span className="font-label text-label-caps">ONAFHANKELIJKE RANGLIJST</span>
        </div>
        <h1 className="mb-6 font-display text-display-lg-mobile leading-tight text-on-background md:text-display-lg">
          De hardst stijgende <span className="text-primary">duurzame</span> producten.
        </h1>
        <p className="font-body text-body-lg text-on-surface-variant">
          We meten versnelling, geen volume. Elke dag opnieuw berekend uit
          publieke databronnen — 100% onafhankelijk van affiliate of sponsoring.
        </p>
      </div>
      <div className="flex gap-4">
        <StatCard value={count > 0 ? String(count) : "—"} label="PRODUCTEN" accent="text-primary" />
        <StatCard value="3" label="DATABRONNEN" accent="text-tertiary" />
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
        <NewsletterForm />
      </div>
    </section>
  );
}
