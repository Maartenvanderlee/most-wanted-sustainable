// Blogartikel. Volledig statisch gebouwd; onbekende slugs geven een 404.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { SiteNav, SiteFooter } from "@/app/site-chrome";

// Alleen de artikelen die tijdens de build bestaan; geen runtime-rendering.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Artikel niet gevonden | Most Wanted Sustainable" };
  const title = `${post.title} | Most Wanted`;
  return {
    title: title.slice(0, 60),
    description: post.description.slice(0, 155),
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: "nl",
    publisher: { "@type": "Organization", name: "Most Wanted Sustainable" },
  };

  return (
    <>
      <SiteNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8">
        <Link
          href="/blog"
          className="text-sm text-on-surface-variant hover:text-primary"
        >
          ← Alle artikelen
        </Link>

        <article className="mt-4">
          <time
            dateTime={post.date}
            className="font-label text-label-caps text-on-surface-variant"
          >
            {formatDate(post.date)}
          </time>
          <h1 className="mb-8 mt-2 font-display text-display-lg-mobile leading-tight text-on-background">
            {post.title}
          </h1>
          <div
            className="prose-blog"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>

        <div className="mt-12 rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
          <p className="text-body-md text-on-surface-variant">
            Benieuwd welke duurzame producten nú versnellen?{" "}
            <Link href="/" className="font-medium text-primary underline">
              Bekijk de ranglijst
            </Link>{" "}
            of lees{" "}
            <Link href="/methodologie" className="font-medium text-primary underline">
              hoe de trendscore werkt
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
