"use client";

// Grid met filters op categorie en tag. Krijgt de al opgehaalde producten
// als props (server-side geladen) en filtert client-side.
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_GRADIENTS,
  CATEGORY_ACCENT,
  CATEGORY_EMOJI,
  type Category,
} from "@/lib/categories";
import type { RankedProduct } from "@/lib/queries";

export function HomeGrid({ products }: { products: RankedProduct[] }) {
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

  const [featured, ...rest] = filtered;

  return (
    <section>
      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            Alle categorieën
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
            >
              {CATEGORY_LABELS[c]}
            </FilterChip>
          ))}
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <FilterChip active={tag === null} onClick={() => setTag(null)}>
              Alle tags
            </FilterChip>
            {allTags.map((t) => (
              <FilterChip key={t} active={tag === t} onClick={() => setTag(t)}>
                {t}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center text-on-surface-variant">
          Geen producten voor deze filter.
        </p>
      ) : (
        <ProductCards products={filtered} />
      )}
    </section>
  );
}

// Herbruikbaar: uitgelichte kaart + grid. Ook gebruikt op categoriepagina's.
export function ProductCards({ products }: { products: RankedProduct[] }) {
  const [featured, ...rest] = products;
  return (
    <>
      <div className="mb-5">
        <FeaturedCard product={featured} />
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <StandardCard key={p.id} product={p} />
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

function ScoreBadge({ product }: { product: RankedProduct }) {
  const accent = CATEGORY_ACCENT[product.category];
  if (!product.latest) {
    return (
      <span className="rounded-lg bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant">
        nieuw
      </span>
    );
  }
  return (
    <div className={`rounded-lg px-3 py-1 font-bold ${accent.bg} ${accent.text}`}>
      {product.latest.score}
    </div>
  );
}

function FeaturedCard({ product }: { product: RankedProduct }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="card-featured-border eco-shadow eco-shadow-hover group flex flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest md:flex-row"
    >
      <div className="flex flex-1 flex-col justify-between p-8">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded bg-primary-fixed px-2 py-1 font-label text-[10px] text-on-primary-fixed-variant">
              UITGELICHT
            </span>
            <span className="font-label text-label-caps text-on-surface-variant">
              {CATEGORY_LABELS[product.category].toUpperCase()}
            </span>
          </div>
          <h2 className="mb-3 font-display text-headline-md text-on-background">
            {product.name}
          </h2>
          <TagRow tags={product.sustainability_tags} />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <span className="font-label text-label-caps text-on-surface-variant">
            {product.latest ? `#${product.latest.rank} in de ranglijst` : "nog geen score"}
          </span>
          <ScoreBadge product={product} />
        </div>
      </div>
      <div
        className={`flex min-h-[200px] items-center justify-center bg-gradient-to-br md:w-1/2 ${CATEGORY_GRADIENTS[product.category]} transition-transform duration-700 group-hover:scale-105`}
      >
        <span className="text-7xl" aria-hidden="true">
          {product.image_url ? "🖼️" : CATEGORY_EMOJI[product.category]}
        </span>
      </div>
    </Link>
  );
}

function StandardCard({ product }: { product: RankedProduct }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="eco-shadow eco-shadow-hover group flex flex-col overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest"
    >
      <div
        className={`flex h-40 items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENTS[product.category]}`}
      >
        <span
          className="text-5xl transition-transform duration-500 group-hover:scale-110"
          aria-hidden="true"
        >
          {product.image_url ? "🖼️" : CATEGORY_EMOJI[product.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <span className="font-label text-label-caps uppercase text-on-surface-variant">
              {CATEGORY_LABELS[product.category]}
            </span>
            <h3 className="mt-1 font-display text-headline-md-mobile text-on-background">
              {product.name}
            </h3>
          </div>
          <ScoreBadge product={product} />
        </div>
        <TagRow tags={product.sustainability_tags} />
      </div>
    </Link>
  );
}

function TagRow({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.slice(0, 4).map((t) => (
        <span
          key={t}
          className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] text-on-surface-variant"
        >
          {t}
        </span>
      ))}
    </div>
  );
}
