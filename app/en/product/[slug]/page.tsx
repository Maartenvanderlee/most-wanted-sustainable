import type { Metadata } from "next";
import { getProductBySlug, getApprovedSlugs } from "@/lib/queries";
import { isCategory } from "@/lib/categories";
import { CATEGORY_LABELS_EN } from "@/lib/i18n";
import { ProductView } from "@/app/product-view";

// ISR, identiek aan de Nederlandse productpagina's.
export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getApprovedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const detail = await getProductBySlug(params.slug);
  if (!detail) return { title: "Product not found | Most Wanted Sustainable" };

  const { product } = detail;
  const label = isCategory(product.category)
    ? CATEGORY_LABELS_EN[product.category]
    : product.category;
  const title = `${product.name} — trending sustainable | Most Wanted`;
  const description = `${product.name} in the ${label.toLowerCase()} category. See the trend score, the breakdown per data source and why this product made our list.`;

  return {
    title: title.slice(0, 60),
    description: description.slice(0, 155),
    alternates: {
      canonical: `/en/product/${params.slug}`,
      languages: {
        nl: `/product/${params.slug}`,
        en: `/en/product/${params.slug}`,
      },
    },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function EnglishProductPage({
  params,
}: {
  params: { slug: string };
}) {
  return <ProductView slug={params.slug} locale="en" />;
}
