import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { getRankedProducts } from "@/lib/queries";
import { getContent } from "@/lib/content";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_INTROS,
  CATEGORY_SLUGS,
  categoryToSlug,
  slugToCategory,
} from "@/lib/categories";
import { SiteNav, SiteFooter } from "@/app/site-chrome";
import { ProductCards } from "@/app/home-grid";

// ISR: pagina wordt gecachet en maximaal elk uur opnieuw opgebouwd.
export const revalidate = 3600;

const MONTHS = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: CATEGORY_SLUGS[c] }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const category = slugToCategory(params.category);
  if (!category) return { title: "Categorie niet gevonden | Most Wanted Sustainable" };

  const now = new Date();
  const label = CATEGORY_LABELS[category].toLowerCase();
  const title = `Trending duurzame ${label} — ${MONTHS[now.getMonth()]} ${now.getFullYear()} | Most Wanted Sustainable`;

  return {
    title: title.slice(0, 60),
    description: CATEGORY_INTROS[category].slice(0, 155),
    openGraph: { title, description: CATEGORY_INTROS[category] },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = slugToCategory(params.category);
  if (!category) notFound();

  const { isEnabled: preview } = draftMode();
  const [products, content] = await Promise.all([
    getRankedProducts({ category }),
    getContent(preview),
  ]);
  const intro =
    content[`trending.${params.category}.intro`] ?? CATEGORY_INTROS[category];
  const related = CATEGORIES.filter((c) => c !== category).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Trending duurzame ${CATEGORY_LABELS[category].toLowerCase()}`,
    itemListElement: products.map((p, i) => ({
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
        <h1 className="mb-4 font-display text-headline-md text-on-background md:text-display-lg-mobile">
          Trending duurzame {CATEGORY_LABELS[category].toLowerCase()}
        </h1>
        <p className="mb-8 max-w-2xl text-body-lg text-on-surface-variant">
          {intro}
        </p>

        {products.length === 0 ? (
          <p className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center text-on-surface-variant">
            Nog geen goedgekeurde producten in deze categorie.
          </p>
        ) : (
          <ProductCards products={products} />
        )}

        {/* Interne links: verwante categorieën + methodologie */}
        <div className="mt-12 border-t border-outline-variant/30 pt-8">
          <h2 className="mb-3 font-semibold text-on-background">
            Andere categorieën
          </h2>
          <div className="flex flex-wrap gap-3">
            {related.map((c) => (
              <Link
                key={c}
                href={`/trending/${categoryToSlug(c)}`}
                className="rounded-full bg-surface-container px-4 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
              >
                {CATEGORY_LABELS[c]}
              </Link>
            ))}
            <Link
              href="/methodologie"
              className="rounded-full bg-surface-container px-4 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
            >
              Hoe werkt de trendscore?
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
