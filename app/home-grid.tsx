"use client";

// Grid met filters op categorie en tag. Krijgt de al opgehaalde producten
// als props (server-side geladen) en filtert client-side. Taalbewust (nl/en).
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  CATEGORY_GRADIENTS,
  CATEGORY_ACCENT,
  CATEGORY_EMOJI,
  type Category,
} from "@/lib/categories";
import { splitTags, certificationLabel, certificationIcon } from "@/lib/certifications";
import {
  UI,
  localePath,
  translateTag,
  categoryLabel,
  type Locale,
} from "@/lib/i18n";
import { formatPriceRange } from "@/lib/price";
import { pexelsSized } from "@/lib/pexels";
import type { RankedProduct } from "@/lib/queries";

export function HomeGrid({
  products,
  locale = "nl",
}: {
  products: RankedProduct[];
  locale?: Locale;
}) {
  const ui = UI[locale];
  const [category, setCategory] = useState<Category | "all">("all");
  const [tag, setTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) p.sustainability_tags.forEach((t) => set.add(t));
    return [...set].sort();
  }, [products]);

  const filtered = products.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (tag === null || p.sustainability_tags.includes(tag))
  );

  return (
    <section>
      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            {ui.allCategories}
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
            >
              {categoryLabel(c, locale)}
            </FilterChip>
          ))}
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <FilterChip active={tag === null} onClick={() => setTag(null)}>
              {ui.allTags}
            </FilterChip>
            {allTags.map((t) => (
              <FilterChip key={t} active={tag === t} onClick={() => setTag(t)}>
                {translateTag(t, locale)}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center text-on-surface-variant">
          {ui.noneForFilter}
        </p>
      ) : (
        <ProductCards products={filtered} locale={locale} />
      )}
    </section>
  );
}

// Herbruikbaar: uitgelichte kaart + grid. Ook gebruikt op categoriepagina's.
export function ProductCards({
  products,
  locale = "nl",
}: {
  products: RankedProduct[];
  locale?: Locale;
}) {
  const [featured, ...rest] = products;
  return (
    <>
      <div className="mb-5">
        <FeaturedCard product={featured} locale={locale} />
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <StandardCard key={p.id} product={p} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm transition ${
        active
          ? "bg-primary text-on-primary"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
      }`}
    >
      {children}
    </button>
  );
}

function ScoreBadge({ product, locale }: { product: RankedProduct; locale: Locale }) {
  const accent = CATEGORY_ACCENT[product.category];
  if (!product.latest) {
    return (
      <span className="rounded-lg bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant">
        {UI[locale].isNew}
      </span>
    );
  }
  return (
    <div className={`rounded-lg px-3 py-1 font-bold ${accent.bg} ${accent.text}`}>
      {product.latest.score}
    </div>
  );
}

function FeaturedCard({ product, locale }: { product: RankedProduct; locale: Locale }) {
  const ui = UI[locale];
  return (
    <Link
      href={localePath(locale, `/product/${product.slug}`)}
      className="card-featured-border eco-shadow eco-shadow-hover group flex flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest md:flex-row"
    >
      <div className="flex flex-1 flex-col justify-between p-8">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded bg-primary-fixed px-2 py-1 font-label text-[10px] text-on-primary-fixed-variant">
              {ui.featured}
            </span>
            <span className="font-label text-label-caps text-on-surface-variant">
              {categoryLabel(product.category, locale).toUpperCase()}
            </span>
          </div>
          <h2 className="mb-3 font-display text-headline-md text-on-background">
            {product.name}
          </h2>
          <TagRow tags={product.sustainability_tags} locale={locale} />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="font-label text-label-caps text-on-surface-variant">
            {product.latest ? ui.inRanking(product.latest.rank) : ui.noScoreYet}
          </span>
          <ScoreBadge product={product} locale={locale} />
        </div>
      </div>
      <div
        className={`relative flex min-h-[200px] items-center justify-center overflow-hidden bg-gradient-to-br md:w-1/2 ${CATEGORY_GRADIENTS[product.category]} transition-transform duration-700 group-hover:scale-105`}
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pexelsSized(product.image_url, 900, 600)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-7xl" aria-hidden="true">
            {CATEGORY_EMOJI[product.category]}
          </span>
        )}
        {product.priceRange && (
          <span className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {formatPriceRange(product.priceRange)}
          </span>
        )}
      </div>
    </Link>
  );
}

function StandardCard({ product, locale }: { product: RankedProduct; locale: Locale }) {
  return (
    <Link
      href={localePath(locale, `/product/${product.slug}`)}
      className="eco-shadow eco-shadow-hover group flex flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest"
    >
      <div
        className={`relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br ${CATEGORY_GRADIENTS[product.category]}`}
      >
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pexelsSized(product.image_url, 600, 400)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span
            className="text-5xl transition-transform duration-500 group-hover:scale-110"
            aria-hidden="true"
          >
            {CATEGORY_EMOJI[product.category]}
          </span>
        )}
        {product.priceRange && (
          <span className="absolute bottom-2 left-2 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {formatPriceRange(product.priceRange)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <span className="font-label text-label-caps uppercase text-on-surface-variant">
              {categoryLabel(product.category, locale)}
            </span>
            <h3 className="mt-1 font-display text-headline-md-mobile text-on-background">
              {product.name}
            </h3>
          </div>
          <ScoreBadge product={product} locale={locale} />
        </div>
        <TagRow tags={product.sustainability_tags} locale={locale} />
      </div>
    </Link>
  );
}

function TagRow({ tags, locale }: { tags: string[]; locale: Locale }) {
  const { certifications, characteristics } = splitTags(tags);
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {certifications.map((c) => (
        <span
          key={c}
          className="inline-flex items-center gap-1 rounded-full bg-primary-container/25 px-2 py-0.5 text-[11px] font-medium text-primary"
        >
          <span aria-hidden="true">{certificationIcon(c)}</span>
          {certificationLabel(c)}
        </span>
      ))}
      {characteristics.slice(0, 3).map((t) => (
        <span
          key={t}
          className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] text-on-surface-variant"
        >
          {translateTag(t, locale)}
        </span>
      ))}
    </div>
  );
}
