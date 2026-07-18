// English blog index. Fully static: articles are read at build time.
import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { pexelsSized } from "@/lib/pexels";
import { SiteNav, SiteFooter } from "@/app/site-chrome";

export const metadata: Metadata = {
  title: "Blog | Most Wanted Sustainable",
  description:
    "Level-headed columns on saving CO2 with sustainable products, certification labels and how our trend score works. No green marketing fluff.",
  alternates: {
    canonical: "/en/blog",
    languages: { nl: "/blog", en: "/en/blog" },
  },
  openGraph: {
    title: "Blog | Most Wanted Sustainable",
    description:
      "Level-headed columns on saving CO2 with sustainable products.",
    type: "website",
  },
};

function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function EnglishBlogIndexPage() {
  const posts = await getAllPosts("en");

  return (
    <>
      <SiteNav locale="en" switchHref="/blog" />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:px-8">
        <h1 className="mb-3 font-display text-display-lg-mobile text-on-background md:text-display-lg">
          Blog
        </h1>
        <p className="mb-2 font-body text-body-lg text-on-surface-variant">
          Background on certification labels, trends and how we work —
          level-headed, no green marketing fluff.
        </p>
        <p className="mb-10 text-sm text-on-surface-variant">
          <Link href="/blog" className="text-primary underline">
            Lees deze artikelen in het Nederlands
          </Link>
        </p>

        {posts.length === 0 ? (
          <p className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-8 text-center text-on-surface-variant">
            No articles yet — coming soon.
          </p>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/en/blog/${post.slug}`}
                className="eco-shadow eco-shadow-hover block overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest"
              >
                {post.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pexelsSized(post.image, 900, 400)}
                    alt=""
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                )}
                <div className="p-6">
                  <time
                    dateTime={post.date}
                    className="font-label text-label-caps text-on-surface-variant"
                  >
                    {formatDate(post.date)}
                  </time>
                  <h2 className="mb-2 mt-1 font-display text-headline-md-mobile text-on-background">
                    {post.title}
                  </h2>
                  <p className="text-body-md text-on-surface-variant">
                    {post.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
