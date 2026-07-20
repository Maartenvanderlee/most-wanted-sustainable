# Most Wanted Sustainable

Een publieke, tweetalige (nl/en) ranglijst van duurzame producten, gerangschikt
op een **trendscore die versnelling meet, niet volume** — een product dat hard
stijgt verslaat een product dat alleen maar groot is. Gebouwd door een
niet-technische founder samen met Claude Code.

Live: https://most-wanted-sustainable.vercel.app (`/en` voor Engels)

- **Stack:** Next.js 14 (App Router, TypeScript, Tailwind) · Supabase (Postgres) · Vercel · Vitest + GitHub Actions (CI)
- **Datastroom & ontwerpkeuzes:** zie [`docs/architecture.md`](docs/architecture.md)
- **Wijzigingen per fase:** zie [`CHANGELOG.md`](CHANGELOG.md)
- **Productvisie, regels en fasen:** zie [`CLAUDE.md`](CLAUDE.md)
- **Leidende specificaties:** de skills in [`.claude/skills/`](.claude/skills/)

## Aan de slag

```bash
npm install                 # dependencies installeren
cp .env.example .env.local  # daarna de sleutels invullen (zie hieronder)
npm run dev                 # site draaien op http://localhost:3000
```

### Omgevingsvariabelen (`.env.local`)

Alle sleutels staan met uitleg in [`.env.example`](.env.example). Nooit in de
code of in de chat plaatsen; `.env.local` staat in `.gitignore`.

| Variabele | Nodig vanaf | Waar vandaan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Fase 2 | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Fase 2 | Supabase → API (publishable/anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Fase 2 | Supabase → API (secret/service_role, geheim) |
| `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET` | Fase 3 | Reddit → prefs/apps (gratis "script" app) — bron nog niet actief, zie CLAUDE.md |
| `YOUTUBE_API_KEY` | Fase 3 | Google Cloud Console → Credentials |
| `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` | optioneel | developer.ebay.com → productie-keyset (extra bron; Wikipedia + GDELT hebben géén sleutel nodig) |
| `ADMIN_PASSWORD` | Fase 4 | zelf verzinnen (sterk wachtwoord) |
| `CRON_SECRET` | Fase 3/5 | zelf verzinnen (lange willekeurige tekst) |
| `NEXT_PUBLIC_SITE_URL` | Fase 4/5 | eigen domein, bv. `https://mostwanted.nl` (voor sitemap/robots/hreflang; leeg = localhost) |
| `PEXELS_API_KEY` | optioneel | gratis sleutel via pexels.com/api ("Foto's automatisch invullen" in de admin) |

## Commando's

| Commando | Wat het doet |
|---|---|
| `npm run dev` | Ontwikkelserver met hot reload |
| `npm run build` | Productie-build (controleert ook alle types) |
| `npm test` | Alle tests (Vitest) |
| `npm run check-db` | Controleert de Supabase-verbinding en of alle tabellen bestaan |
| `npm run pipeline` | Testrun van de pipeline met 8 zoekwoorden |
| `npm run pipeline -- 25` | Testrun met 25 zoekwoorden |
| `npm run pipeline -- all` | Volledige run (alle zoekwoorden) |

De pipeline kan ook via de beveiligde API-route draaien (voor de cron):
`GET/POST /api/pipeline/run` met header `Authorization: Bearer <CRON_SECRET>`
(of `?secret=`-query-parameter, wat de Vercel-cron gebruikt). De dagelijkse
cron in `vercel.json` splitst dit in twee batches van 50 zoekwoorden
(`?offset=0&limit=50` om 06:00 UTC, `?offset=50` om 06:40 UTC) zodat elke
batch binnen de functietijdslimiet (`maxDuration = 300s`) blijft.

Overige eenmalige/handmatige scripts:

| Commando | Wat het doet |
|---|---|
| `node --env-file=.env.local scripts/backfill-trends.mjs` | Haalt 12 maanden Google Trends-historie op per zoekwoord |
| `node --env-file=.env.local scripts/seed-product-info.mjs` | Vult per product de redactionele velden (beschrijving, duurzame winst, CO2-indicatie, nl+en) — vult alleen lege velden, overschrijft nooit handwerk |
| `node --env-file=.env.local scripts/export-archive.mjs` | Exporteert alle tabellen naar gedateerde JSON-bestanden in `data/archive/<datum>/` — offline backup voor archivering en jaar-op-jaar rapportage |

## Database

Het schema staat als genummerde SQL-migraties in
[`supabase/migrations/`](supabase/migrations/) — dat is de bron van waarheid.
Wijzig het schema nooit los in het Supabase-dashboard; voeg altijd een nieuwe
migratie toe. Regels: zie de `db-conventions` skill.

## Tests en CI

```bash
npm test          # vitest — 12 testbestanden
npx tsc --noEmit  # typecontrole
```

Gedekt: elke bron-adapter (parsing + geïsoleerde fout), de scoring
(groei-berekening + normalisatie), het inlezen van de zoekwoorden, en de
beveiligingshulpjes (`lib/admin-auth.ts`, `lib/rate-limit.ts`,
`lib/safe-redirect.ts`, `lib/json-ld.ts`, `lib/blog-parsing.ts`). Elke nieuwe
adapter of security-gevoelige wijziging krijgt verplicht een test.

`.github/workflows/ci.yml` draait tests + typecheck + `npm audit` bij elke
push/PR naar `main`. Vercel bouwt en deployt daarnaast bij elke push naar
main (heeft de live database nodig, dus dat draait niet in CI).

## Projectstatus

Zie de fasen-checklist in [`CLAUDE.md`](CLAUDE.md). Kort:

- [x] Fase 1 — skelet (homepage met testdata)
- [x] Fase 2 — Supabase gekoppeld, schema aangemaakt
- [x] Fase 3 — pipeline met 3 bronnen (YouTube live; Reddit uitgesteld; Google Trends best-effort)
- [x] Fase 4 — detailpagina's, /methodologie, filters, nieuwsbrief, admin
- [x] Fase 5 — live op Vercel met dagelijkse cron (2 batches)
- [x] Na livegang — ISR-caching, CMS met preview, blog (nl+en), volledige
      Engelse site, keurmerk-bewijs + iconen, verkoopkanalen met prijs,
      levensduur/recycling, CO2-indicatie per product, AI-vindbaarheid
      (llms.txt, GEO), beveiligingshardening, geautomatiseerde tests + CI

Zie [`CHANGELOG.md`](CHANGELOG.md) voor het volledige overzicht per fase.

## Pagina's

| Route | Wat |
|---|---|
| `/`, `/en` | Ranglijst met filters op categorie en tag |
| `/trending/[category]`, `/en/trending/[category]` | Categoriepagina (SEO) per categorie |
| `/product/[slug]`, `/en/product/[slug]` | Productdetail: beschrijving, duurzame winst + CO2-indicatie, keurmerken met bewijs, levensduur/recycling, verkoopkanalen, score-opbouw per bron, 30-dagen-grafiek |
| `/methodologie`, `/en/methodology` | Uitleg van de trendscore + verdienmodel in gewone taal |
| `/blog`, `/en/blog` | Blogoverzicht en -artikelen, hreflang-gekoppeld tussen talen |
| `/admin` | Curatie: goedkeuren/afwijzen, teksten, foto's, keurmerken, verkoopkanalen (wachtwoord via `ADMIN_PASSWORD`, rate-limited) |
| `/admin/content` | CMS: homepage- en categorieteksten, concept → preview → publiceren |
| `/admin/subscribers`, `/admin/stats` | Nieuwsbrief-export, bezoekstatistieken |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Automatisch uit de database/content, taalbewust |
