import type { Metadata } from "next";
import { getProductBySlug, getApprovedSlugs } from "@/lib/queries";
import { CATEGORY_LABELS, isCategory } from "@/lib/categories";
import { ProductView } from "@/app/product-view";

// ISR: pagina wordt gecachet en maximaal elk uur opnieuw opgebouwd.
export const revalidate = 3600;

// Bouw alle goedgekeurde productpagina's vooraf; nieuwe slugs worden
// bij het eerste bezoek gegenereerd en daarna gecachet.
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
  if (!detail) return { title: "Product niet gevonden | Risegoods" };

  const { product } = detail;
  const label = isCategory(product.category)
    ? CATEGORY_LABELS[product.category]
    : product.category;
  const title = `${product.name}, trending duurzaam | Risegoods`;
  const description =
    product.description ??
    `${product.name} in de categorie ${label}. Bekijk de trendscore, de opbouw per databron en waarom dit product op onze lijst staat.`;

  return {
    title: title.slice(0, 60),
    description: description.slice(0, 155),
    alternates: {
      canonical: `/product/${params.slug}`,
      languages: {
        nl: `/product/${params.slug}`,
        en: `/en/product/${params.slug}`,
      },
    },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  return <ProductView slug={params.slug} locale="nl" />;
}
