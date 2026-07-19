// Blogartikel. Volledig statisch gebouwd; onbekende slugs geven een 404.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, getTranslationMap } from "@/lib/blog";
import { safeJsonLd } from "@/lib/json-ld";
import { pexelsSized } from "@/lib/pexels";
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
  const enSlug = (await getTranslationMap()).get(post.slug);
  const title = `${post.title} | Most Wanted`;
  return {
    title: title.slice(0, 60),
    description: post.description.slice(0, 155),
    alternates: {
      canonical: `/blog/${post.slug}`,
      languages: {
        nl: `/blog/${post.slug}`,
        ...(enSlug ? { en: `/en/blog/${enSlug}` } : {}),
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      ...(post.image ? { images: [{ url: post.image }] } : {}),
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

  const enSlug = (await getTranslationMap()).get(post.slug);

  // Buurartikelen op datum: nieuwer (erna) en ouder (ervoor).
  const posts = await getAllPosts(); // nieuwste eerst
  const index = posts.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? posts[index - 1] : null;
  const older = index < posts.length - 1 ? posts[index + 1] : null;

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
      <SiteNav switchHref={enSlug ? `/en/blog/${enSlug}` : "/en/blog"} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/blog"
            className="text-sm text-on-surface-variant hover:text-primary"
          >
            ← Alle artikelen
          </Link>
          {enSlug && (
            <Link
              href={`/en/blog/${enSlug}`}
              className="text-sm text-primary underline"
            >
              Read in English
            </Link>
          )}
        </div>

        <article className="mt-4">
          {post.image && (
            <div className="mb-8 overflow-hidden rounded-2xl border border-outline-variant/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pexelsSized(post.image, 1200, 500)}
                alt=""
                className="max-h-[320px] w-full object-cover"
              />
            </div>
          )}
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

        {(older || newer) && (
          <nav aria-label="Meer artikelen" className="mt-8 grid gap-4 sm:grid-cols-2">
            {older ? (
              <Link
                href={`/blog/${older.slug}`}
                className="eco-shadow-hover group rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5"
              >
                <span className="font-label text-label-caps text-on-surface-variant">
                  ← Eerder verschenen
                </span>
                <span className="mt-1 block font-display text-headline-md-mobile text-on-background group-hover:text-primary">
                  {older.title}
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            {newer && (
              <Link
                href={`/blog/${newer.slug}`}
                className="eco-shadow-hover group rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:text-right"
              >
                <span className="font-label text-label-caps text-on-surface-variant">
                  Later verschenen →
                </span>
                <span className="mt-1 block font-display text-headline-md-mobile text-on-background group-hover:text-primary">
                  {newer.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
