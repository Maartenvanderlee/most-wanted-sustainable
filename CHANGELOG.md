# Changelog

Alle noemenswaardige wijzigingen aan dit project. Wijzigingen aan de
trendscore-formule worden hier verplicht genoteerd (zie de `trend-score` skill).
Nieuwste bovenaan.

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
