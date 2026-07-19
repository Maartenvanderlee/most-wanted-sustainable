# Most Wanted Sustainable

Dashboard van trending duurzame producten, gebouwd door een niet-technische founder samen met Claude Code.

## Belangrijk: werkwijze met deze gebruiker

- De gebruiker heeft GEEN programmeerervaring. Leg elke stap uit in gewone taal, zonder jargon (of leg jargon direct uit).
- Geef bij acties buiten dit project (Supabase, Vercel, Google Cloud dashboards) altijd stap-voor-stap klíkinstructies.
- Doe één ding per keer en vat na afloop samen wat er is veranderd en waarom.
- Stel voor om een git-herstelpunt te maken na elke werkende feature.
- Vraag nooit om geheime sleutels in de chat te plakken; wijs naar `.env.local`.

## Wat dit product is

- Publieke, tweetalige (nl/en) ranglijst van duurzame producten, gerangschikt op een trendscore die VERSNELLING meet, niet volume
- Bronnen: Google Trends + YouTube Data API actief; Reddit-adapter klaar maar uitgesteld (zie CHANGELOG.md, Fase 3)
- Duurzaamheid geborgd via certificeringen (met verifieerbaar registerbewijs) + handmatige curatie + uitsluitingslijst
- Per product: redactionele beschrijving, duurzame winst t.o.v. het gangbare alternatief, indicatieve CO2-besparing (nl+en)
- Content: blog (nl+en, met hreflang-koppeling), CMS met concept/preview/publiceren voor homepage- en categorieteksten
- Verdienmodel: affiliate (max. 3 verkoopkanalen per product) eerst, later premium en B2B-rapporten
- Zie `docs/architecture.md` voor de volledige systeemopzet en `.claude/skills/db-conventions/SKILL.md` voor het actuele databaseschema

## Stack

Next.js 14 (App Router, TypeScript, Tailwind) · Supabase (Postgres) · Vercel (hosting + dagelijkse cron voor de pipeline)

## Regels

- Volg de skills in `.claude/skills/` — ze zijn leidend voor adapters, scoring, curatie, database en SEO-pagina's
- De trendscore is 100% onafhankelijk van affiliate/sponsoring — geen uitzonderingen
- `scores` en `signals` zijn append-only; historie is het waardevolste bezit
- Alle geheimen via environment variables, altijd bijgewerkt in `.env.example`
- Eén falende databron mag de pipeline nooit laten crashen

## Status

- [x] Fase 1: skelet (homepage met testdata)
- [x] Fase 2: Supabase gekoppeld, schema aangemaakt
- [x] Fase 3: pipeline met 3 bronnen + seed keywords (data/seed-keywords.md)
      (YouTube live; Reddit uitgesteld i.v.m. beleid; Google Trends best-effort)
- [x] Fase 4: detailpagina's, /methodologie, filters, nieuwsbrief, admin
- [x] Fase 5: live op Vercel met dagelijkse cron
      (https://most-wanted-sustainable.vercel.app — pipeline in 2 batches: 06:00 en 06:40 UTC)

Werk deze checklist bij wanneer een fase af is. Het volledige bouwplan met prompts staat in BOUWPLAN.md.
