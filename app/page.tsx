import {
  sampleProducts,
  CATEGORY_LABELS,
  type SampleProduct,
} from "@/lib/sample-products";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <header className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-100">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          Dagelijks bijgewerkt
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Most Wanted{" "}
          <span className="text-brand-600">Sustainable</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-balance text-sm leading-relaxed text-slate-500 sm:text-base">
          De duurzame producten die nú in populariteit versnellen. We meten
          groei, geen volume — onafhankelijk van affiliate of sponsoring.
        </p>
      </header>

      <ol className="space-y-3">
        {sampleProducts.map((product) => (
          <ProductRow key={product.rank} product={product} />
        ))}
      </ol>

      <p className="mt-10 text-center text-xs text-slate-400">
        Voorbeeldgegevens · echte ranglijst volgt zodra de datapijplijn draait
      </p>
    </main>
  );
}

function ProductRow({ product }: { product: SampleProduct }) {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-sm font-semibold text-slate-400">
        {product.rank}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
            {product.name}
          </h2>
          <span className="shrink-0 rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
            {CATEGORY_LABELS[product.category]}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <TrendScore value={product.trendScore} />
    </li>
  );
}

function TrendScore({ value }: { value: number }) {
  return (
    <div className="shrink-0 text-right">
      <div className="text-lg font-bold leading-none text-brand-600">
        {value}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
        trendscore
      </div>
    </div>
  );
}
