# Most Wanted Sustainable

Dashboard van trending duurzame producten, gebouwd door een niet-technische founder samen met Claude Code.

## Belangrijk: werkwijze met deze gebruiker

- De gebruiker heeft GEEN programmeerervaring. Leg elke stap uit in gewone taal, zonder jargon (of leg jargon direct uit).
- Geef bij acties buiten dit project (Supabase, Vercel, Google Cloud dashboards) altijd stap-voor-stap klíkinstructies.
- Doe één ding per keer en vat na afloop samen wat er is veranderd en waarom.
- Stel voor om een git-herstelpunt te maken na elke werkende feature.
- Vraag nooit om geheime sleutels in de chat te plakken; wijs naar `.env.local`.

## Wat dit product is

- Publieke ranglijst (top 50) van duurzame producten, gerangschikt op een trendscore die VERSNELLING meet, niet volume
- Bronnen (MVP): Google Trends, Reddit (publieke JSON API), YouTube Data API — via modulaire adapters
- Duurzaamheid geborgd via certificeringen + handmatige curatie + uitsluitingslijst
- Verdienmodel: affiliate eerst, later premium en B2B-rapporten

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
- [ ] Fase 3: pipeline met 3 bronnen + seed keywords (data/seed-keywords.md)
- [ ] Fase 4: detailpagina's, /methodologie, filters, nieuwsbrief, admin
- [ ] Fase 5: live op Vercel met dagelijkse cron

Werk deze checklist bij wanneer een fase af is. Het volledige bouwplan met prompts staat in BOUWPLAN.md.
