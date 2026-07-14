# Changelog

Alle noemenswaardige wijzigingen aan dit project. Wijzigingen aan de
trendscore-formule worden hier verplicht genoteerd (zie de `trend-score` skill).
Nieuwste bovenaan.

## [Fase 4] — Rest van de MVP

- Google Trends werkt nu: cookie-priming + korte pauze omzeilt de 429-blokkade,
  waardoor de meeste zoekwoorden echte interesse-data opleveren (best-effort).
- Per product: foto (`image_url`), koop-/affiliate-link en erkende keurmerken.
  Keurmerken (B Corp, Fairtrade, FSC, …) via aankruislijst in de admin,
  opgeslagen als tags en op de site apart getoond als keurmerk-badges
  (los van gewone kenmerken). Zie `lib/certifications.ts`.
- Homepage gekoppeld aan echte data (goedgekeurde producten + scores) met
  filters op categorie en tag; testdata verwijderd.
- Productdetailpagina (`/product/[slug]`): "waarom op de lijst" (tags),
  score-opbouw per bron met weging, 30-dagen-grafiek, SEO-metadata + JSON-LD.
- Categoriepagina's (`/trending/[category]`) met unieke intro en JSON-LD ItemList.
- `/methodologie` in gewone taal.
- Nieuwsbrief-aanmelding die e-mails in Supabase opslaat (anon INSERT via RLS).
- Admin (`/admin`) met wachtwoord (`ADMIN_PASSWORD`): goedkeuren/afwijzen met
  reden, tags en affiliate-links beheren; volgt de sustainability-curation skill.
- `sitemap.xml` en `robots.txt` uit de database; `/admin` en `/api` uitgesloten.

## [Fase 3] — Data-pipeline

- Live geverifieerd: YouTube levert echte signalen; producten komen op status
  `pending` in de database. Reddit uitgesteld (Responsible Builder Policy vereist
  goedkeuring/commerciële toestemming); Google Trends best-effort (429).
  Scores verschijnen pas na ≥2 weken historie (meet versnelling, niet volume).

- Trendscore-formule **v1** geïntroduceerd: `0.45 * Google Trends + 0.30 *
  Reddit + 0.25 * YouTube`, gemeten als week-op-week groei, min-max
  genormaliseerd per snapshotdag.
- Drie bron-adapters toegevoegd: Reddit (app-only OAuth — Reddit blokkeert
  anonieme verzoeken), Google Trends (onofficiële API) en YouTube (Data API
  v3), elk met failure-isolatie, retry/backoff en 12u cache.
- Pipeline-orkestratie: seed-keywords → producten (status `pending`) →
  signalen → scores.
- Handmatig draaien via `npm run pipeline` en de beveiligde API-route
  `/api/pipeline/run`.
- Tests (Vitest) voor adapters, scoring en het inlezen van zoekwoorden.
- Documentatie: `docs/architecture.md`.

## [Fase 2] — Database

- Supabase gekoppeld; migraties `0001` (schema) en `0002` (Row Level Security).
- Tabellen: `products`, `signals`, `scores`, `newsletter_subscribers`.
- Verbindingshelpers (browser + server) en `npm run check-db`.

## [Fase 1] — Skelet

- Next.js 14 (App Router, TypeScript, Tailwind) opgezet.
- Homepage in bento-stijl met 10 voorbeeldproducten (testdata).
