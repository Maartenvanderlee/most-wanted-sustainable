import {
  sampleProducts,
  CATEGORY_LABELS,
  CATEGORY_GRADIENTS,
  type SampleProduct,
} from "@/lib/sample-products";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-100">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          Dagelijks bijgewerkt
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Most Wanted <span className="text-brand-600">Sustainable</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-balance text-sm leading-relaxed text-slate-500 sm:text-base">
          De duurzame producten die nú in populariteit versnellen. We meten
          groei, geen volume — onafhankelijk van affiliate of sponsoring.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sampleProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-slate-400">
        Voorbeeldgegevens · echte ranglijst en foto&apos;s volgen zodra de
        datapijplijn draait
      </p>
    </main>
  );
}

function ProductCard({ product }: { product: SampleProduct }) {
  return (
    <a
      href="#"
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {/* Kop: categorie + rangnummer */}
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
          {CATEGORY_LABELS[product.category]}
        </span>
        <span className="text-xs font-semibold text-slate-300">
          #{product.rank}
        </span>
      </div>

      {/* Titel */}
      <h2 className="px-4 pt-2 text-base font-semibold text-slate-900">
        {product.name}
      </h2>

      {/* "Foto" van het item (voorlopig een placeholder-tegel) */}
      <div
        className={`mx-4 mt-3 flex aspect-[4/3] items-center justify-center rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[product.category]}`}
      >
        <span className="text-5xl" aria-hidden="true">
          {product.emoji}
        </span>
      </div>

      {/* Beschrijving */}
      <p className="flex-1 px-4 pt-3 text-sm leading-relaxed text-slate-500">
        {product.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {product.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Voettekst naast de window: geografie + trendscore */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 px-4 py-3">
        <span className="text-xs text-slate-500">{product.geography}</span>
        <div className="text-right leading-none">
          <span className="text-lg font-bold text-brand-600">
            {product.trendScore}
          </span>
          <span className="ml-1 text-[10px] uppercase tracking-wide text-slate-400">
            trend
          </span>
        </div>
      </div>
    </a>
  );
}
