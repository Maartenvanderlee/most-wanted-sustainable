// Gedeelde categoriepagina-weergave voor beide talen.
import Link from "next/link";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { getRankedProducts } from "@/lib/queries";
import { getContent, contentKey } from "@/lib/content";
import {
  CATEGORIES,
  CATEGORY_SLUGS,
  categoryToSlug,
  slugToCategory,
} from "@/lib/categories";
import { UI, localePath, categoryLabel, type Locale } from "@/lib/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { SiteNav, SiteFooter } from "@/app/site-chrome";
import { ProductCards } from "@/app/home-grid";

export async function CategoryView({
  categorySlug,
  locale,
}: {
  categorySlug: string;
  locale: Locale;
}) {
  const category = slugToCategory(categorySlug);
  if (!category) notFound();

  const ui = UI[locale];
  const { isEnabled: preview } = draftMode();
  const [products, content] = await Promise.all([
    getRankedProducts({ category }),
    getContent(preview),
  ]);
  const intro = content[contentKey(locale, `trending.${categorySlug}.intro`)];
  const related = CATEGORIES.filter((c) => c !== category).slice(0, 3);
  const title = ui.trendingIn(categoryLabel(category, locale));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    inLanguage: locale,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: localePath(locale, `/product/${p.slug}`),
    })),
  };

  const switchHref =
    locale === "en"
      ? `/trending/${categorySlug}`
      : `/en/trending/${categorySlug}`;

  return (
    <>
      <SiteNav locale={locale} switchHref={switchHref} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <main className="mx-auto max-w-container px-5 pb-24 pt-32 md:px-16">
        <h1 className="mb-4 font-display text-headline-md text-on-background md:text-display-lg-mobile">
          {title}
        </h1>
        <p className="mb-8 max-w-2xl text-body-lg text-on-surface-variant">
          {intro}
        </p>

        {products.length === 0 ? (
          <p className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center text-on-surface-variant">
            {ui.noProductsInCategory}
          </p>
        ) : (
          <ProductCards products={products} locale={locale} />
        )}

        {/* Interne links: verwante categorieën + methodologie */}
        <div className="mt-12 border-t border-outline-variant/30 pt-8">
          <h2 className="mb-3 font-semibold text-on-background">
            {ui.otherCategories}
          </h2>
          <div className="flex flex-wrap gap-3">
            {related.map((c) => (
              <Link
                key={c}
                href={localePath(locale, `/trending/${categoryToSlug(c)}`)}
                className="rounded-full bg-surface-container px-4 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
              >
                {categoryLabel(c, locale)}
              </Link>
            ))}
            <Link
              href={ui.methodologyHref}
              className="rounded-full bg-surface-container px-4 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
            >
              {ui.howScoreWorks}
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter locale={locale} />
    </>
  );
}

export function allCategoryParams() {
  return CATEGORIES.map((c) => ({ category: CATEGORY_SLUGS[c] }));
}
