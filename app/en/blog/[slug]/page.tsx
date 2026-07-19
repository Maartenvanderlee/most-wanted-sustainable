// English blog article. Fully static; unknown slugs return a 404.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { safeJsonLd } from "@/lib/json-ld";
import { pexelsSized } from "@/lib/pexels";
import { SiteNav, SiteFooter } from "@/app/site-chrome";

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts("en");
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(params.slug, "en");
  if (!post) return { title: "Article not found | Most Wanted Sustainable" };
  const title = `${post.title} | Most Wanted`;
  return {
    title: title.slice(0, 60),
    description: post.description.slice(0, 155),
    alternates: {
      canonical: `/en/blog/${post.slug}`,
      languages: {
        ...(post.nlSlug ? { nl: `/blog/${post.nlSlug}` } : {}),
        en: `/en/blog/${post.slug}`,
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
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EnglishBlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug, "en");
  if (!post) notFound();

  // Neighbouring articles by date: newer (after) and older (before).
  const posts = await getAllPosts("en"); // newest first
  const index = posts.findIndex((p) => p.slug === post.slug);
  const newer = index > 0 ? posts[index - 1] : null;
  const older = index < posts.length - 1 ? posts[index + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: "Most Wanted Sustainable" },
  };

  return (
    <>
      <SiteNav
        locale="en"
        switchHref={post.nlSlug ? `/blog/${post.nlSlug}` : "/blog"}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/en/blog"
            className="text-sm text-on-surface-variant hover:text-primary"
          >
            ← All articles
          </Link>
          {post.nlSlug && (
            <Link
              href={`/blog/${post.nlSlug}`}
              className="text-sm text-primary underline"
            >
              Lees in het Nederlands
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
            Curious which sustainable products are accelerating right now?{" "}
            <Link href="/" className="font-medium text-primary underline">
              See the ranking
            </Link>{" "}
            or read{" "}
            <Link href="/methodologie" className="font-medium text-primary underline">
              how the trend score works
            </Link>
            .
          </p>
        </div>

        {(older || newer) && (
          <nav aria-label="More articles" className="mt-8 grid gap-4 sm:grid-cols-2">
            {older ? (
              <Link
                href={`/en/blog/${older.slug}`}
                className="eco-shadow-hover group rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5"
              >
                <span className="font-label text-label-caps text-on-surface-variant">
                  ← Published earlier
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
                href={`/en/blog/${newer.slug}`}
                className="eco-shadow-hover group rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:text-right"
              >
                <span className="font-label text-label-caps text-on-surface-variant">
                  Published later →
                </span>
                <span className="mt-1 block font-display text-headline-md-mobile text-on-background group-hover:text-primary">
                  {newer.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
