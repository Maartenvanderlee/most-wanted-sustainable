import type { Metadata } from "next";
import { slugToCategory } from "@/lib/categories";
import { CATEGORY_LABELS_EN, MONTHS_EN } from "@/lib/i18n";
import { CONTENT_DEFAULTS } from "@/lib/content";
import { CategoryView, allCategoryParams } from "@/app/category-view";

// ISR, identiek aan de Nederlandse categoriepagina's.
export const revalidate = 3600;

export function generateStaticParams() {
  return allCategoryParams();
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const category = slugToCategory(params.category);
  if (!category) return { title: "Category not found | Most Wanted Sustainable" };

  const now = new Date();
  const label = CATEGORY_LABELS_EN[category].toLowerCase();
  const title = `Trending sustainable ${label}, ${MONTHS_EN[now.getMonth()]} ${now.getFullYear()} | Most Wanted Sustainable`;
  const description =
    CONTENT_DEFAULTS[`en.trending.${params.category}.intro`] ?? "";

  return {
    title: title.slice(0, 60),
    description: description.slice(0, 155),
    alternates: {
      canonical: `/en/trending/${params.category}`,
      languages: {
        nl: `/trending/${params.category}`,
        en: `/en/trending/${params.category}`,
      },
    },
    openGraph: { title, description },
  };
}

export default function EnglishCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  return <CategoryView categorySlug={params.category} locale="en" />;
}
