# Architectuur — Most Wanted Sustainable

Dit document beschrijft hoe het systeem in elkaar zit, welke keuzes we hebben
gemaakt en waar je moet zijn om iets te wijzigen of uit te breiden. Bedoeld
voor een developer die het project overneemt of verbetert.

Zie ook:
- `CLAUDE.md` — productvisie, regels en fasenoverzicht
- `.claude/skills/` — de leidende specificaties per onderdeel (adapters, scoring, database, curatie, SEO)
- `CHANGELOG.md` — wat er per wijziging is veranderd

## Kernidee

Een publieke ranglijst van duurzame producten, gerangschikt op een **trendscore
die versnelling meet, niet volume**. Een product dat hard stijgt verslaat een
product dat alleen maar groot is. Dit principe is niet onderhandelbaar en
stuurt het hele ontwerp.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind) — frontend + API-routes
- **Supabase (Postgres)** — opslag, met Row Level Security
- **Vercel** — hosting + dagelijkse cron (fase 5)
- **Vitest** — tests

## Datastroom (pipeline)

```
data/seed-keywords.md          (100 zoektermen, per categorie)
        │
        ▼
  loadSeedKeywords()           lib/keywords.ts
        │
        ▼
  products (status 'pending')  ── upsert, bestaande producten blijven ongemoeid
        │
        ▼
  adapters[].fetchSignals()    lib/adapters/{reddit,google-trends,youtube}.ts
        │                        elke bron faalt geïsoleerd (nooit crashen)
        ▼
  signals (append-only)        ruwe waarden, nooit genormaliseerd
        │
        ▼
  computeAndStoreScores()      lib/scoring/score.ts
        │                        groei → normaliseren → wegen → rangschikken
        ▼
  scores (append-only)         één rij per product per dag
```

De orkestratie staat in `lib/pipeline/run.ts`. Handmatig draaien kan op twee
manieren (zie README): het commando `npm run pipeline` en de beveiligde
API-route `app/api/pipeline/run/route.ts` (voor de cron in fase 5).

## Mappenstructuur

```
app/                     Next.js pagina's en API-routes
  page.tsx               homepage (nu nog met testdata uit lib/sample-products.ts)
  api/pipeline/run/      handmatige/cron-trigger voor de pipeline
lib/
  adapters/              één bestand per databron + gedeelde helpers
    types.ts             het verplichte Signal/SourceAdapter-contract
    http.ts              fetch met retry/backoff
    cache.ts             12u bestandscache (spaart API-quota in ontwikkeling)
    index.ts             register van alle adapters
    __tests__/           gemockte tests per adapter
  scoring/               de trendscore-formule (versnelling, niet volume)
    version.ts           formuleversie + weging per bron
    score.ts             groei, normalisatie, rangschikking
  pipeline/              orkestratie + eigen Supabase-client
  supabase/              types + browser-/serverclients
  keywords.ts            seed-keywords inlezen + slugify
scripts/                 losse commando's (check-db, run-pipeline)
supabase/migrations/     genummerde SQL-migraties (de bron van het schema)
docs/                    dit document
```

## Belangrijke ontwerpkeuzes (en waarom)

1. **Adapters zijn volledig geïsoleerd.** De pipeline kent alleen het
   `SourceAdapter`-contract (`lib/adapters/types.ts`). Een nieuwe bron
   toevoegen raakt de rest van het systeem niet. Zie de `source-adapter` skill.

2. **Eén falende bron stopt de pipeline nooit.** Elke adapter vangt fouten op
   en geeft een lege lijst terug. Dit is een harde regel uit `CLAUDE.md`.

3. **`signals` en `scores` zijn append-only.** Historie is het waardevolste
   bezit. We herberekenen het verleden nooit met een nieuwe formule; oude
   scores blijven staan zoals ze gemeten zijn.

4. **Adapters slaan ruwe waarden op; normalisatie gebeurt pas bij de scoring.**
   Zo kunnen we de formule later aanpassen zonder de data opnieuw op te halen.

5. **De trendscore is 100% onafhankelijk van affiliate/sponsoring.** Er is geen
   enkel pad waarlangs commercie de score beïnvloedt. Zie de `trend-score` skill.

6. **Nieuwe producten krijgen pas een score na ≥2 weken historie.** Zonder
   genoeg metingen is week-op-week groei betekenisloos.

## De trendscore-formule (v1)

```
score = 0.45 * norm(googleTrendsGroei)
      + 0.30 * norm(redditMentionsGroei)
      + 0.25 * norm(youtubeViewsGroei)
```

- **Groei** = week-op-week procentuele verandering van de ruwe waarde.
- **norm()** = min-max normalisatie naar 0–100 over de hele productset van die
  snapshotdag (per dag opnieuw berekend).
- Een ontbrekende bron telt als 0 voor dat onderdeel (product wordt niet
  uitgesloten).

**De formule wijzigen** vereist ALLES tegelijk (zie `trend-score` skill):
1. versie ophogen in `lib/scoring/version.ts`
2. de publieke `/methodologie`-pagina bijwerken (fase 4)
3. de versie meeschrijven bij elke score (gebeurt al)
4. de wijziging noteren in `CHANGELOG.md`

## Een databron toevoegen (bijv. eBay, Bol, TikTok)

1. Kopieer `.claude/skills/source-adapter/template.ts` naar
   `lib/adapters/<bron>.ts` en implementeer `fetchSignals`.
2. Voeg de bron toe aan de enum `source_name` (nieuwe migratie in
   `supabase/migrations/`) en aan `SourceName` in `lib/supabase/types.ts`.
3. Registreer de adapter in `lib/adapters/index.ts`.
4. Zet nieuwe API-sleutels in `.env.example` (met uitleg) en `.env.local`.
5. Schrijf een gemockte test in `lib/adapters/__tests__/`.
6. Herbalanceer de weging in `lib/scoring/version.ts`, verhoog de formuleversie
   en werk `/methodologie` en `CHANGELOG.md` bij.

## Tests

`npm test` (Vitest). Huidige dekking:
- Elke adapter: correcte parsing + geïsoleerde fout (lege lijst).
- Scoring: groei-berekening (positief/negatief/te weinig historie/deling door nul)
  en normalisatie (schaling + gelijke waarden).
- Zoekwoorden: parsing van `data/seed-keywords.md` + slugify.

## Bekende beperkingen / verbeterpunten

- **Reddit** blokkeert niet-ingelogde verzoeken (403). De adapter gebruikt
  daarom app-only OAuth (`REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET`); zonder die
  sleutels slaat de bron zichzelf over.
- **Google Trends** gebruikt een onofficiële API en wordt snel gerate-limit
  (429). De adapter degradeert netjes (lege lijst); voor productie is een
  robuustere/officiële bron aan te raden.
- De **cache** is een bestandscache (`.cache/`), prima voor ontwikkeling. Op
  Vercel is het bestandssysteem vluchtig; overweeg de Supabase-tabel
  `raw_cache` uit de skill voor productie.
- De **homepage** toont nog testdata (`lib/sample-products.ts`); koppelen aan
  echte `products`/`scores` gebeurt in fase 4.
- De pipeline-route heeft `maxDuration = 60s`; een volledige run over 100
  zoekwoorden kan langer duren. Voor de cron in fase 5 evt. opsplitsen of de
  limiet op het Vercel-plan verhogen.
```
