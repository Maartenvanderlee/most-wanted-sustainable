# Changelog

Alle noemenswaardige wijzigingen aan dit project. Wijzigingen aan de
trendscore-formule worden hier verplicht genoteerd (zie de `trend-score` skill).
Nieuwste bovenaan.

## [Na livegang] — Bronspreiding en databorging

- Trendscore-formule **v3**: bronspreiding om minder afhankelijk te zijn van
  één (wankele) bron. Twee nieuwe, onafhankelijke gratis bronnen toegevoegd —
  **Wikipedia** (paginaweergaven van het best passende artikel, 30 dagen) en
  **GDELT** (wereldwijd nieuwsvolume over het zoekwoord, 1 week). Google Trends
  weegt bewust minder zwaar (65% → 40%); nieuwe verdeling: Google Trends 40%,
  YouTube 25%, Wikipedia 20%, GDELT 15%. Als Google Trends uitvalt, komt nog
  60% van het signaal uit de andere drie bronnen. Wikipedia en GDELT hebben
  geen API-sleutel nodig. Migratie `0012_new_sources.sql` breidt de
  `source_name`-enum uit. Methodologie (nl+en) bijgewerkt.
- **eBay-adapter** toegevoegd als vierde nieuwe bron (aantal actieve
  aanbiedingen = commerce-signaal). Staat klaar maar weegt nog niet mee: hij
  vereist gratis eBay-developersleutels (`EBAY_CLIENT_ID`/`EBAY_CLIENT_SECRET`)
  en slaat zichzelf over zolang die ontbreken — net als de Reddit-adapter.
- **Signalen worden nu per bron opgeslagen** (aparte insert per bron) i.p.v.
  in één keer. Zo blijft een bron geïsoleerd: faalt het opslaan van één bron
  (bijvoorbeeld een nieuwe enum-waarde die pas ná de deploy via een migratie
  in de database komt), dan blijven de andere bronnen gewoon bewaard.
- **Lange-termijn databorging**: `scripts/export-archive.mjs` dumpt de volledige
  inhoud van products, signals, scores, curation_history en de overige tabellen
  naar gedateerde JSON-bestanden in `data/archive/<datum>/` — een offline backup
  naast de reeds append-only tabellen, voor archivering en jaar-op-jaar
  rapportage. (De map staat in `.gitignore`.)

## [Na livegang] — Content, internationalisering, CMS en beveiliging

- **Productinformatie per product** (migratie `0010`): korte beschrijving +
  toepassing, waarom het duurzamer is dan het gangbare alternatief, en een
  **indicatieve** CO2-besparing als bandbreedte (nooit een harde claim) —
  elk in nl + en, bewerkbaar in `/admin`, getoond op de productpagina met een
  disclaimer. `scripts/seed-product-info.mjs` vult de seed-catalogus.
- **Blog-knop bovenaan** de header op mobiel (voorheen alleen in de footer
  bereikbaar, want de hoofdnavigatie is `hidden md:flex`).
- **Beveiligingshardening**: timing-safe login-vergelijking, sessiecookie met
  een afgeleide waarde (nooit het wachtwoord zelf), IP-gebaseerde
  rate-limiting op mislukte inlogpogingen (migratie `0009`,
  `admin_login_attempts`), dichte open-redirect in de preview-routes,
  JSON-LD-escaping tegen script-injectie, en validatie van keurmerk-waarden
  vóór ze in een handgebouwde PostgREST-filterstring belanden.
- **Geautomatiseerde tests uitgebreid** naar 12 testbestanden: dekking voor
  alle nieuwe beveiligingshulpjes en blog-pad-validatie.
- **CI** (`.github/workflows/ci.yml`): tests + typecheck + `npm audit` bij
  elke push/PR naar main.
- **Volledige Engelse site** (`/en`): homepage, product- en categoriepagina's,
  methodologie, en alle 12 blogartikelen vertaald, met hreflang-koppeling in
  beide richtingen en een taalwisselaar die naar de juiste tegenhanger linkt
  (niet enkel de homepage). Gedeelde componenten (`home-view.tsx`,
  `product-view.tsx`, `category-view.tsx`) voorkomen duplicatie tussen talen;
  alle interfaceteksten centraal in `lib/i18n.ts`.
- **12 maanden Google Trends-historie** met terugwerkende kracht opgehaald
  (`scripts/backfill-trends.mjs`) als bewijsmateriaal richting eventuele
  data-afnemers dat de trend "buzz → conversie" aantoonbaar is.
- **Blogserie**: 10 nieuwe columns over CO2 besparen met duurzame producten,
  plus vorige/volgende-navigatie tussen artikelen en Pexels-stockfoto's boven
  elk artikel.
- **CMS met concept/preview/publiceren** (migratie `0007`, `site_content`):
  homepage- en categorieteksten bewerkbaar in `/admin/content` zonder deploy,
  via Next.js Draft Mode (`/api/preview`).
- **Prijsindicatie** bij productfoto's, afgeleid uit de prijzen bij de
  verkoopkanalen (migratie `0006`).
- **Levensduur & recycling** per product (migratie `0008`: `lifespan`,
  `end_of_life`).
- **Certificaat-iconen** op productkaarten en **maximaal 3 verkoopkanalen**
  per product met elk een eigen affiliate-link (migratie `0005`).
- **AI-vindbaarheid (GEO)**: `/llms.txt`, AI-crawlers expliciet toegestaan in
  `robots.txt`, uitgebreide structured data (`Organization`/`WebSite`/`ItemList`).
- **Groene-code-optimalisaties**: ISR-caching op publieke pagina's in plaats
  van server-render per bezoek, productfoto's in de juiste maat per context
  in plaats van overal de grootste variant.
- **Herleidbaar certificaat-bewijs**: registratienummer + link naar het
  openbare register per keurmerk (migratie `0004`, `product_certifications`).
- **Nieuwsbrief-beheer**: aanmeldingenoverzicht met CSV-export in `/admin`.
- **Blogsectie** toegevoegd (`/blog`, markdown-bestanden in `content/blog/`).
- **Transparant verdienmodel** uitgeschreven op `/methodologie`; registerlinks
  in de admin; automatische productfoto's via de Pexels-API
  ("Foto's automatisch invullen").

## [Fase 5] — Live op Vercel

- Project op GitHub gezet en gedeployed op Vercel
  (https://most-wanted-sustainable.vercel.app).
- Dagelijkse cron voor de pipeline via `vercel.json`, later opgesplitst in
  twee batches van 50 zoekwoorden (06:00 en 06:40 UTC) omdat een volledige
  run van 100 zoekwoorden niet binnen één functie-aanroep paste; de
  functietijdslimiet is daarbij verhoogd naar 300s.
- Eerste bulkcuratie: 89 van de 100 pipeline-producten beoordeeld volgens de
  drie curatiepoorten (2 afgewezen op de uitsluitingslijst, 9 als twijfelgeval
  laten staan voor handmatige beoordeling).

## [Fase 4] — Rest van de MVP

- Trendscore-formule **v2**: Reddit (tijdelijk) uit de weging gehaald omdat het
  anonieme toegang blokkeert en goedkeuring vereist voor commercieel gebruik.
  Zijn gewicht is herverdeeld over de werkende bronnen: Google Trends 65%,
  YouTube 35%. De site beweegt automatisch mee (methodologie, detailpagina,
  homepage-teller). Reddit kan later als v3 terugkeren.
- Eigen, privacy-vriendelijke statistieken (geen cookies, geen persoonsgegevens):
  `events`-tabel + `/api/track` registreren paginabezoeken en link-kliks; het
  admin-dashboard `/admin/stats` toont bezoeken, populairste links en het aantal
  nieuwsbrief-inschrijvingen. Migratie `0003_events.sql`.
- Merklogo (driehoek + woordmerk, Manrope) in menubalk en footer.
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
