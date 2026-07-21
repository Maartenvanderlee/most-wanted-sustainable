import type { Metadata } from "next";
import { CATEGORY_LABELS, CATEGORY_INTROS, slugToCategory } from "@/lib/categories";
import { MONTHS_NL } from "@/lib/i18n";
import { CategoryView, allCategoryParams } from "@/app/category-view";

// ISR: pagina wordt gecachet en maximaal elk uur opnieuw opgebouwd.
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
  if (!category) return { title: "Categorie niet gevonden | Most Wanted Sustainable" };

  const now = new Date();
  const label = CATEGORY_LABELS[category].toLowerCase();
  const title = `Trending duurzame ${label}, ${MONTHS_NL[now.getMonth()]} ${now.getFullYear()} | Most Wanted Sustainable`;

  return {
    title: title.slice(0, 60),
    description: CATEGORY_INTROS[category].slice(0, 155),
    alternates: {
      canonical: `/trending/${params.category}`,
      languages: {
        nl: `/trending/${params.category}`,
        en: `/en/trending/${params.category}`,
      },
    },
    openGraph: { title, description: CATEGORY_INTROS[category] },
  };
}

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  return <CategoryView categorySlug={params.category} locale="nl" />;
}
