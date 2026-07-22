# Architectuur — Risegoods

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
  adapters[].fetchSignals()    lib/adapters/{google-trends,youtube,wikipedia,
        │                        gdelt,reddit,ebay}.ts
        │                        elke bron faalt geïsoleerd (nooit crashen)
        ▼
  signals (append-only)        ruwe waarden, nooit genormaliseerd; opslag
        │                        gebeurt PER BRON (aparte insert), zodat een
        │                        falende bron de rest niet meesleept
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
  page.tsx / en/page.tsx        homepage (nl/en) — dunne route, delegeert naar home-view.tsx
  home-view.tsx                 gedeelde homepage-inhoud (beide talen)
  trending/[category]/, en/…    categoriepagina's (SEO) — dunne routes
  category-view.tsx             gedeelde categoriepagina-inhoud
  product/[slug]/, en/product/  productdetail — dunne routes
  product-view.tsx              gedeelde productpagina-inhoud (score, keurmerken,
                                 CO2/duurzame-winst-blok, verkoopkanalen, 30-dagen-grafiek)
  methodologie/, en/methodology/  uitleg trendscore + verdienmodel, per taal
  blog/, en/blog/                blogoverzicht + artikel, per taal (leest content/blog(-en)/*.md)
  admin/                 beheer (wachtwoord via ADMIN_PASSWORD): producten curateren,
                          content/ (CMS), subscribers/ (nieuwsbrief-export), stats/
  newsletter/             nieuwsbrief-aanmelding (server action + formulier, taalbewust)
  site-chrome.tsx          gedeelde nav/footer, taalbewust (SiteNav/SiteFooter)
  sitemap.ts, robots.ts, llms.txt/   gegenereerd uit de database/content, taalbewust
  api/pipeline/run/       handmatige/cron-trigger voor de pipeline (CRON_SECRET)
  api/preview/, api/preview/exit/   Draft Mode aan/uit voor CMS-preview (admin-only)
  api/track/              anonieme page_view/click-events
lib/
  queries.ts              server-side data voor publieke pagina's (filtert op approved)
  i18n.ts                 alle interfaceteksten (UI.nl/UI.en), categorie-labels,
                          tag-vertalingen, maandnamen — één bron per taal
  content.ts              CMS: leest site_content, valt terug op hardcoded defaults
  blog.ts, blog-parsing.ts  blogartikelen lezen (frontmatter + markdown), pad-validatie
  certifications.ts       keurmerken, iconen, labels; splitst tags in keurmerk/kenmerk
  price.ts                prijsbandbreedte uit product_offers
  pexels.ts               foto-URL op maat per weergavecontext (kaart vs. detail)
  categories.ts           categorieën, slugs, kleuren, NL-labels, SEO-intro's
  admin-auth.ts           timing-safe login-check + sessiecookie (nooit het wachtwoord zelf)
  rate-limit.ts           IP-gebaseerde vertraging van mislukte inlogpogingen
  safe-redirect.ts        whitelist voor interne redirect-paden (voorkomt open-redirect)
  json-ld.ts              escaped JSON-LD-serialisatie (voorkomt </script>-injectie)
  images.ts               Pexels-zoekopdracht voor "Foto's automatisch invullen"
  adapters/               één bestand per databron + gedeelde helpers
    types.ts              het verplichte Signal/SourceAdapter-contract
    http.ts                fetch met retry/backoff
    cache.ts               12u bestandscache (spaart API-quota in ontwikkeling)
    index.ts                register van alle adapters
    __tests__/              gemockte tests per adapter
  scoring/                de trendscore-formule (versnelling, niet volume)
    version.ts             formuleversie + weging per bron
    score.ts                groei, normalisatie, rangschikking
  pipeline/               orkestratie + eigen Supabase-client
  supabase/               types + browser-/serverclients
  keywords.ts             seed-keywords inlezen + slugify
content/blog/, content/blog-en/  blogartikelen als markdown, per taal; een EN-artikel
                                  verwijst met `nl: <slug>` naar het origineel (hreflang)
scripts/                 losse commando's (check-db, run-pipeline, backfill-trends,
                          seed-product-info)
supabase/migrations/     genummerde SQL-migraties (de bron van het schema)
.github/workflows/ci.yml  tests + typecheck + audit bij elke push/PR naar main
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

7. **True pricing: alleen cijfers die we kunnen onderbouwen.** `co2_kg_per_year`
   en `annual_saving_eur` (migratie `0013`) zijn door de admin onderzochte
   schattingen, net als `co2_note`. Het "verborgen kostenbedrag in euro's"
   op de productpagina is wél berekend, via een schaduwprijs voor CO2
   (`lib/true-price.ts`, €0,13/kg — CE Delft, Handboek Milieuprijzen 2023,
   Tabel 1 p.6 en Tabel 2 p.7, middenschatting, prijspeil 2021), handmatig
   geverifieerd uit de brontabel voordat hij in code ging. Zie `/bronnen`.
   Tastbare vergelijkingen (autokilometers via een zelf berekende
   CBS-verhouding, CO2-opname van een boom via Staatsbosbeheer) staan er nu
   ook, als toelichtende regel onder de kaart.

## De trendscore-formule (v3)

```
score = 0.40 * norm(googleTrendsGroei)
      + 0.25 * norm(youtubeViewsGroei)
      + 0.20 * norm(wikipediaPageviewsGroei)
      + 0.15 * norm(gdeltNieuwsvolumeGroei)
```

Bronspreiding is een bewuste keuze: valt Google Trends weg, dan komt nog 60%
van het signaal uit YouTube, Wikipedia en GDELT. Wikipedia en GDELT vereisen
geen API-sleutel. Reddit en eBay hebben werkende adapters maar staan op
standby (sleutels nodig) en wegen pas mee vanaf v4. De actuele gewichten
staan in `lib/scoring/version.ts` (`WEIGHTS`).

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

## Curatie (greenwashing-poort)

Nieuwe producten uit de pipeline landen op status `pending`. Alleen een mens
zet ze op `approved` of `rejected` via `/admin` — nooit automatisch. Regels
staan in `.claude/skills/sustainability-curation/SKILL.md`: een product moet
slagen voor **poort 1** (erkend keurmerk) of **poort 2** (checklist, 3 van 5
ja), en altijd voor **poort 3** (uitsluitingslijst). Keurmerk-claims zijn
verifieerbaar: `product_certifications` koppelt per keurmerk een
registratienummer en een link naar het openbare register van de
certificeerder, ingevuld via `/admin`.

Sinds migratie `0010` heeft elk product ook optionele redactionele velden
(`description`, `why_sustainable`, `co2_note`, elk met een `_en`-variant):
een korte beschrijving/toepassing, waarom het duurzamer is dan het gangbare
alternatief, en een **indicatieve** CO2-besparing als bandbreedte. De
CO2-tekst is bewust nooit een harde claim ("bespaart X kg") maar een
schatting met disclaimer (`ui.co2Disclaimer` in `lib/i18n.ts`) — conform de
EU Green Claims-regels uit de curatie-skill. `scripts/seed-product-info.mjs`
vult deze velden voor de seed-catalogus in (idempotent: overschrijft nooit
een handmatig ingevulde waarde).

## Twee-talige site (nl/en)

De site bestaat in het Nederlands (root) en Engels (`/en`-prefix). Om
duplicatie te voorkomen delen beide talen dezelfde React-componenten:

- `app/home-view.tsx`, `app/product-view.tsx`, `app/category-view.tsx` bevatten
  de daadwerkelijke pagina-inhoud, met een `locale: "nl" | "en"` prop.
- De routes onder `app/` (nl) en `app/en/` zijn dunne schillen: ze regelen
  alleen metadata (title/description/`alternates.languages` voor hreflang) en
  roepen de gedeelde view aan.
- `lib/i18n.ts` bevat alle interfaceteksten (`UI.nl`/`UI.en`), Engelse
  categorie-labels, kenmerk-tag-vertalingen en maandnamen.
- Blogartikelen zijn losse markdown-bestanden per taal (`content/blog/*.md`
  resp. `content/blog-en/*.md`, gelezen via `lib/blog.ts`). Een Engels
  artikel verwijst met `nl: <slug>` in de frontmatter naar het Nederlandse
  origineel, waaruit de hreflang-koppeling in beide richtingen wordt afgeleid.
- `app/site-chrome.tsx` (SiteNav/SiteFooter) is taalbewust; de taalwisselaar
  linkt via een `switchHref`-prop naar de daadwerkelijke tegenhanger van de
  huidige pagina, niet enkel naar de homepage.
- CMS-teksten (zie hieronder) hebben een eigen Engelse sleutel-namespace
  (`en.home.hero.title`, `en.trending.food.intro`, …) in dezelfde
  `site_content`-tabel.

## CMS (concept → preview → publiceren)

`/admin/content` laat de homepage-teksten en categorie-intro's (nl + en)
bewerken zonder een deploy:

- Teksten staan in `site_content` (`published`/`draft`); ontbrekende sleutels
  vallen terug op de hardcoded default in `lib/content.ts`, dus de site werkt
  ook met een lege tabel.
- "Opslaan als concept" schrijft alleen `draft` — bezoekers zien niets.
- "Preview bekijken" zet Next.js **Draft Mode** aan (`/api/preview`, alleen
  voor ingelogde admins via `isAdminRequestAuthed()`); de publieke pagina
  rendert dan dynamisch met de concepttekst, zonder de ISR-cache voor
  bezoekers te raken.
- "Publiceren" kopieert naar `published` en revalidate't de gecachete paden
  direct (`revalidatePath`).

## SEO en AI-vindbaarheid (GEO)

- Elke publieke pagina heeft unieke title/description, Open Graph en JSON-LD
  (`Product`/`ItemList`/`Article`/`Organization`, `lib/json-ld.ts` escaped de
  serialisatie), plus hreflang via `alternates.languages`.
- `/llms.txt` (`app/llms.txt/route.ts`) is een leeswijzer voor AI-assistenten:
  legt de unieke positionering uit (versnelling i.p.v. volume, onafhankelijke
  score, verifieerbare keurmerken) met links naar kernpagina's.
- `robots.txt` staat AI-crawlers (GPTBot, ChatGPT-User, ClaudeBot,
  PerplexityBot, Google-Extended, Applebot-Extended, CCBot, …) expliciet toe,
  naast de reguliere `*`-regel.
- `/sitemap.xml` neemt producten, categorieën, blogartikelen en beide talen
  automatisch mee.

## Prestaties ("groene code")

- Publieke pagina's zijn ISR (`export const revalidate = 3600`), niet
  server-rendered per bezoek; admin-acties en de pipeline revalidaten gericht
  de paden die veranderd zijn.
- Productfoto's (via Pexels) worden per weergavecontext in de juiste maat
  opgevraagd (`lib/pexels.ts`: klein voor kaarten, groot voor de detailpagina)
  in plaats van overal de grootste variant te laden.

## Beveiliging

- **Login** (`lib/admin-auth.ts`): timing-safe wachtwoordvergelijking
  (voorkomt timing-aanvallen), de cookie bevat een afgeleide sessiewaarde —
  nooit het wachtwoord zelf — zodat een gestolen cookie het wachtwoord niet
  blootgeeft.
- **Rate limiting** (`lib/rate-limit.ts`, tabel `admin_login_attempts`):
  mislukte inlogpogingen worden per IP geteld en na te veel pogingen tijdelijk
  geblokkeerd, ter vertraging van brute-force.
- **Open-redirect-bescherming** (`lib/safe-redirect.ts`): de preview-routes
  (`/api/preview`, `/api/preview/exit`) accepteren alleen interne paden — geen
  scheme-relative `//evil.com`-achtige waarden.
- **JSON-LD-hardening** (`lib/json-ld.ts`): `<`/`>` worden geëscaped in de
  JSON-serialisatie, zodat een productnaam met `</script>` geen script uit de
  structured-data-tag kan laten breken.
- **Query-building**: waarden die in een handgebouwde PostgREST-filterstring
  belanden (de `product_certifications`-opschoonfilter in
  `app/admin/actions.ts`) worden eerst tegen een bekende allowlist gevalideerd
  (`isCertification()`) voordat ze in de querystring terechtkomen.
- **Blog-pad-validatie** (`lib/blog-parsing.ts`): alleen slugs die aan
  `^[a-z0-9-]+$` voldoen worden van schijf gelezen — geen path traversal via
  de URL.
- RLS staat aan op elke tabel; zie `.claude/skills/db-conventions/SKILL.md`
  voor het volledige actuele schema en het toegangsbeleid per tabel.

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

## Tests en CI

`npm test` (Vitest, 12 testbestanden). Huidige dekking:
- Elke adapter: correcte parsing + geïsoleerde fout (lege lijst).
- Scoring: groei-berekening (positief/negatief/te weinig historie/deling door nul)
  en normalisatie (schaling + gelijke waarden).
- Zoekwoorden: parsing van `data/seed-keywords.md` + slugify.
- Beveiligingshulpjes: `lib/admin-auth.ts` (timing-safe compare), `lib/rate-limit.ts`,
  `lib/safe-redirect.ts` (open-redirect-preventie), `lib/json-ld.ts` (escaping).
- `lib/blog-parsing.ts`: frontmatter-parsing en slug-validatie (path traversal).

`.github/workflows/ci.yml` draait bij elke push/PR naar `main`: `npm test`,
`npx tsc --noEmit` (typecheck), en `npm audit --audit-level=high` (meldt,
blokkeert de build niet). Vercel doet de echte productie-build al bij elke
push naar main (met de live database); CI is de snelle, geheimloze check
ervoor — nieuwe adapters of security-gevoelige code krijgen hier verplicht
een test bij.

## Bekende beperkingen / verbeterpunten

- **Reddit** blokkeert niet-ingelogde verzoeken (403). De adapter gebruikt
  daarom app-only OAuth (`REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET`); zonder die
  sleutels slaat de bron zichzelf over. **Uitgesteld voor de MVP:** Reddit's
  Responsible Builder Policy vereist expliciete goedkeuring en verbiedt
  commercieel gebruik van Reddit-data zonder schriftelijke toestemming. Omdat
  het product een commercieel model heeft, gebruiken we Reddit pas na een
  goedgekeurde aanvraag. De adaptercode blijft klaarstaan voor dat moment.
  De trendscore-formule (v2) weegt daarom alleen Google Trends (65%) en
  YouTube (35%).
- **Google Trends** gebruikt een onofficiële API. Kale verzoeken worden
  geblokkeerd (429); de adapter haalt daarom eerst een sessie-cookie op en
  pauzeert kort vóór de dataronde, waardoor de meeste zoekwoorden wél data
  opleveren. Blijft best-effort (Google kan de aanpak wijzigen); een
  ontbrekend zoekwoord wordt netjes overgeslagen. Een eenmalige backfill
  (`scripts/backfill-trends.mjs`) heeft 12 maanden historie opgehaald voor
  bewijsvoering richting eventuele data-afnemers.
- **Wikipedia** (geen sleutel nodig) is een stabiele bron met echte cijfers;
  een zoekwoord zonder passend artikel levert simpelweg geen signaal (scoort
  0 voor dat onderdeel). **GDELT** (geen sleutel nodig) is best-effort: de API
  staat maximaal 1 verzoek per 5 seconden toe, dus de adapter draait strikt
  serieel met een intern tijdsbudget en levert wat binnen dat budget past.
  **eBay** en **Reddit** hebben werkende adapters maar slaan zichzelf over
  zonder sleutels (standby).
- **Lange-termijn databorging.** `signals` en `scores` zijn append-only, dus de
  historie staat al vast in de database. Als extra verzekering dumpt
  `scripts/export-archive.mjs` alle tabellen naar gedateerde JSON-bestanden in
  `data/archive/<datum>/` (buiten git) — voor offline backup en jaar-op-jaar
  rapportage: bewaar een export en vergelijk later met een verse.
- De **cache** is een bestandscache (`.cache/`), prima voor ontwikkeling. Op
  Vercel is het bestandssysteem vluchtig; overweeg de Supabase-tabel
  `raw_cache` uit de skill voor productie.
- Publieke pagina's renderen met de service-role client en filteren expliciet
  op `status = 'approved'`; RLS + anon-sleutel zijn de tweede beschermlaag.
  Zie `lib/queries.ts`.
- De pipeline-route heeft `maxDuration = 300s` (verhoogd van 60s) en de
  dagelijkse cron (`vercel.json`) splitst de 100 zoekwoorden in twee batches
  (`offset=0&limit=50` om 06:00 UTC, `offset=50` om 06:40 UTC) zodat elke
  batch ruim binnen de tijdslimiet blijft.
```
