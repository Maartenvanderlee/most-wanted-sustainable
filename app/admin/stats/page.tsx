// Statistiekenpagina in de admin: paginabezoeken, populairste kliks/links
// en nieuwsbrief-inschrijvingen. Data uit de eigen Supabase (privacy-vriendelijk).
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { isAuthenticated } from "../actions";
import { LoginForm } from "../login-form";

export const dynamic = "force-dynamic";

const SAMPLE = 5000; // recente events voor de top-lijsten

function topBy<T extends Record<string, unknown>>(
  rows: T[],
  key: keyof T,
  n = 10
): [string, number][] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = String(row[key] ?? "—");
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default async function StatsPage() {
  if (!(await isAuthenticated())) return <LoginForm />;

  const supabase = createServerClient();

  const [
    { count: pageViews },
    { count: clickCount },
    { count: subscriberCount },
  ] = await Promise.all([
    supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "page_view"),
    supabase.from("events").select("*", { count: "exact", head: true }).in("type", ["click", "outbound"]),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
  ]);

  const [{ data: pvRows }, { data: clickRows }, { data: recentSubs }] =
    await Promise.all([
      supabase.from("events").select("path, visitor_id").eq("type", "page_view").order("created_at", { ascending: false }).limit(SAMPLE),
      supabase.from("events").select("label, type").in("type", ["click", "outbound"]).order("created_at", { ascending: false }).limit(SAMPLE),
      supabase.from("newsletter_subscribers").select("email, created_at").order("created_at", { ascending: false }).limit(8),
    ]);

  const topPages = topBy(pvRows ?? [], "path");
  const topLinks = topBy(clickRows ?? [], "label");
  const uniqueVisitors = new Set(
    (pvRows ?? []).map((r) => r.visitor_id).filter(Boolean)
  ).size;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-headline-md text-on-background">Statistieken</h1>
        <Link href="/admin" className="text-sm text-on-surface-variant hover:text-primary">
          ← Terug naar beheer
        </Link>
      </div>

      {/* Kerncijfers */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile value={pageViews ?? 0} label="Paginabezoeken" />
        <StatTile value={uniqueVisitors} label="Unieke bezoekers" />
        <StatTile value={clickCount ?? 0} label="Link-kliks" />
        <StatTile value={subscriberCount ?? 0} label="Inschrijvingen" />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <TopList
          title="Meest bezochte pagina's"
          rows={topPages}
          empty="Nog geen bezoeken geregistreerd."
        />
        <TopList
          title="Populairste links"
          rows={topLinks}
          empty="Nog geen kliks geregistreerd."
        />
      </div>

      {/* Recente inschrijvingen */}
      <section className="mt-8">
        <h2 className="mb-3 font-semibold text-on-background">Recente inschrijvingen</h2>
        {recentSubs && recentSubs.length > 0 ? (
          <ul className="divide-y divide-outline-variant/30 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
            {recentSubs.map((s) => (
              <li key={s.email} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-on-background">{s.email}</span>
                <span className="text-on-surface-variant">
                  {new Date(s.created_at).toLocaleDateString("nl-NL")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-on-surface-variant">Nog geen inschrijvingen.</p>
        )}
      </section>

      <p className="mt-8 text-xs text-on-surface-variant">
        Paginabezoeken, kliks en inschrijvingen zijn totalen. Unieke bezoekers en
        de top-lijsten zijn gebaseerd op de laatste{" "}
        {SAMPLE.toLocaleString("nl-NL")} gebeurtenissen. Unieke bezoekers worden
        geteld via een willekeurig, anoniem ID in de browser — geen
        persoonsgegevens, geen tracking-cookies.
      </p>
    </main>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 text-center">
      <div className="font-display text-headline-md text-primary">
        {value.toLocaleString("nl-NL")}
      </div>
      <div className="mt-1 text-sm text-on-surface-variant">{label}</div>
    </div>
  );
}

function TopList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: [string, number][];
  empty: string;
}) {
  return (
    <section>
      <h2 className="mb-3 font-semibold text-on-background">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-on-surface-variant">{empty}</p>
      ) : (
        <ul className="divide-y divide-outline-variant/30 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
          {rows.map(([name, count]) => (
            <li key={name} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
              <span className="truncate text-on-background" title={name}>{name}</span>
              <span className="shrink-0 font-semibold text-primary">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
