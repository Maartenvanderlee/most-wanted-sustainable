// Gedeelde navigatiebalk en footer voor alle pagina's, taalbewust (nl/en).
// De Engelse variant wordt gebruikt op de /en-pagina's; links die nog geen
// Engelse versie hebben, verwijzen naar de Nederlandse pagina.
import Link from "next/link";
import { Logo } from "./logo";

export type Locale = "nl" | "en";

const NAV = {
  nl: {
    ranking: "Ranglijst",
    methodology: "Methodologie",
    blog: "Blog",
    newsletter: "Nieuwsbrief",
    blogHref: "/blog",
    tagline:
      "De onafhankelijke ranglijst van duurzame producten die in populariteit versnellen.",
    product: "Product",
    rights: "Alle rechten voorbehouden.",
    independent: "Onafhankelijk · trendscore los van affiliate of sponsoring",
  },
  en: {
    ranking: "Ranking",
    methodology: "Methodology",
    blog: "Blog",
    newsletter: "Newsletter",
    blogHref: "/en/blog",
    tagline:
      "The independent ranking of sustainable products accelerating in popularity.",
    product: "Product",
    rights: "All rights reserved.",
    independent: "Independent · trend score separate from affiliate or sponsorship",
  },
} as const;

export function SiteNav({ locale = "nl" }: { locale?: Locale }) {
  const t = NAV[locale];
  return (
    <nav className="glass-morphism fixed top-0 z-50 w-full shadow-sm">
      <div className="mx-auto flex max-w-container items-center justify-between px-5 py-3 md:px-16">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Most Wanted Sustainable — home">
            <Logo size="nav" />
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-on-surface-variant transition-colors hover:text-primary">
              {t.ranking}
            </Link>
            <Link
              href="/methodologie"
              className="text-on-surface-variant transition-colors hover:text-primary"
            >
              {t.methodology}
            </Link>
            <Link
              href={t.blogHref}
              className="text-on-surface-variant transition-colors hover:text-primary"
            >
              {t.blog}
            </Link>
          </div>
        </div>
        <Link
          href="/#nieuwsbrief"
          className="rounded-full bg-primary-container px-6 py-2.5 font-semibold text-on-primary shadow-md transition-all hover:opacity-90"
        >
          {t.newsletter}
        </Link>
      </div>
    </nav>
  );
}

export function SiteFooter({ locale = "nl" }: { locale?: Locale }) {
  const t = NAV[locale];
  return (
    <footer className="mt-auto w-full border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-8 px-5 py-12 md:flex-row md:px-16">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <Logo size="footer" />
          <p className="max-w-xs text-center font-body text-on-surface-variant md:text-left">
            {t.tagline}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-center md:flex md:gap-12 md:text-left">
          <div className="flex flex-col gap-3">
            <span className="font-bold text-primary">{t.product}</span>
            <Link href="/" className="text-on-surface-variant transition-colors hover:text-primary">
              {t.ranking}
            </Link>
            <Link
              href="/methodologie"
              className="text-on-surface-variant transition-colors hover:text-primary"
            >
              {t.methodology}
            </Link>
            <Link
              href={t.blogHref}
              className="text-on-surface-variant transition-colors hover:text-primary"
            >
              {t.blog}
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-container flex-col items-center justify-between gap-4 border-t border-outline-variant/30 px-5 py-6 md:flex-row md:px-16">
        <p className="text-sm text-on-surface-variant">
          © 2026 Most Wanted Sustainable. {t.rights}
        </p>
        <p className="text-sm text-on-surface-variant">{t.independent}</p>
      </div>
    </footer>
  );
}
