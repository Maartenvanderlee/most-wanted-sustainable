# Verkeersplan — Amazon Associates, SEO en Google Ads

> Werkdocument, geschreven 21 september 2026. Sluit aan op `docs/strategie.md`
> (daar staat waarom affiliate trede 4 is en B2B trede 1). Dit document gaat
> alleen over: hoe komen er bezoekers, en hoe zetten we Amazon netjes aan.

---

## 0. Diagnose: twee losse vragen, twee losse antwoorden

**Vraag: "ik zie geen bezoekers in de admin — klopt dat?"**
Nee, dat klopt niet. De statistiekenpagina kan nooit iets tellen, want de tabel
waar bezoeken in horen te staan (`events`) bestaat helemaal niet in Supabase.
Migratie `supabase/migrations/0003_events.sql` is nooit uitgevoerd. Elk bezoek
wordt netjes verstuurd door de browser, de server probeert het op te slaan, dat
mislukt, en de code slikt die fout bewust in (zodat een bezoeker er nooit iets
van merkt). Resultaat: altijd 0.

Hetzelfde geldt voor `0009_login_attempts.sql`: de tabel `admin_login_attempts`
bestaat niet, dus de rem op het admin-inlogscherm (max. 8 pogingen per 15
minuten per IP) staat in de praktijk uit.

Alle andere tabellen bestaan wél. Zie hoofdstuk 1 voor de oplossing.

**Vraag: "of wordt mijn site niet gevonden?"**
Die wordt wél gevonden. Google heeft de site geïndexeerd — homepage, `/en`,
`/blog`, `/bronnen`, `/methodologie`, `/voorwaarden` en tientallen
productpagina's staan erin (zeven pagina's zoekresultaten bij
`site:risegoods.nl`). De sitemap bevat 222 URL's en wordt goed geserveerd.

Bing en DuckDuckGo kennen de site nog niet (nul resultaten). Dat is aparte
aanmelding, zie 3.2.

Geïndexeerd worden en gevonden worden zijn trouwens twee dingen. Google kent de
site; dat iemand *zoekt* op iets waar Risegoods voor opduikt is de volgende
horde. Daar gaat hoofdstuk 3 over.

---

## 1. Eerst repareren: de metingen aanzetten

Zonder deze stap weet je van geen enkele volgende stap of hij werkt.

1. Ga naar <https://supabase.com> en log in.
2. Klik op je project.
3. Klik in het linkermenu op **SQL Editor**.
4. Klik op **+ New query**.
5. Plak de inhoud van `supabase/migrations/0003_events.sql` en daarna die van
   `supabase/migrations/0009_login_attempts.sql` (of het kant-en-klare blok dat
   in de chat staat).
6. Klik rechtsonder op **Run** (of Ctrl+Enter). Je hoort "Success. No rows
   returned" te zien.

Controleren dat het gelukt is, in de terminal in de projectmap:

```
node --env-file=.env.local scripts/check-db.mjs
```

Alle tien de tabellen moeten een ✅ krijgen. Daarna: open de site in een
browser, klik wat rond, wacht een minuut, en kijk op `/admin/stats`. Er horen nu
paginabezoeken te staan.

> Dit script controleerde eerder maar vier tabellen, en op een manier die
> ontbrekende tabellen niet opmerkte (een `count`-vraag geeft bij een
> niet-bestaande tabel stil `null` terug in plaats van een foutmelding). Daarom
> is dit nooit opgevallen. Het script checkt nu alle tien de tabellen en noemt
> bij een missende tabel de migratie die je moet uitvoeren.

---

## 2. Amazon Associates: aanmelden

### 2.0 Twee aannames uit de vorige sessie die niet kloppen

1. **"Ik heb 500+ bezoekers per maand nodig voordat Amazon me goedkeurt."**
   Onjuist. Amazon publiceert geen minimum aantal bezoekers voor het
   Associates-programma (wél voor het Influencer-programma). Die 500 is een
   vuistregel van blogs, geen regel van Amazon. Wacht hier dus niet op.
2. **"Goedkeuring duurt 1–2 weken, dan kan ik links maken."**
   Andersom. Je krijgt direct na aanmelding een voorlopig account met werkende
   links. Wat 180 dagen duurt is de *definitieve* goedkeuring, en die hangt aan
   drie verkopen — zie hieronder.

Het echte klokje is dus niet "wanneer mag ik beginnen" maar "hoe snel heb ik
drie verkopen".

### 2.1 Vooraf: het 180-dagen-klokje

Zodra je je aanmeldt, heb je **180 dagen om drie verkopen te realiseren**. Geen
drie kliks — drie afgeronde, betaalde, verzonden bestellingen. Eigen aankopen
tellen niet. Haal je het niet, dan sluit Amazon het account; opnieuw aanmelden
mag later wel.

Met vandaag ongeveer nul bezoekers is dat een echte deadline, geen formaliteit.
Twee opties:

- **Nu aanmelden** (advies): de site staat al in Google, er zijn 100 producten,
  en de deadline dwingt tot het verkeerswerk in hoofdstuk 3. Deadline wordt dan
  ± **20 maart 2027**.
- **Wachten tot ~200 bezoekers per maand** en dan aanmelden. Veiliger, maar je
  stelt je eerste euro's maanden uit — en volgens `docs/strategie.md` is
  affiliate toch trede 4, dus dat uitstel kost weinig.

### 2.2 Aanmelden, stap voor stap

1. Ga naar <https://affiliate-program.amazon.com> en klik op **Sign up**.
2. Log in met je gewone Amazon-account (of maak er zelf één aan).
3. **Account information**: je naam en het adres waar je nu woont. Je zit in de
   VS, dus vul je Amerikaanse adres in — dat maakt stap 6 en 7 eenvoudiger. Een
   Nederlands adres mag ook, maar dan geldt het andere spoor hieronder.
4. **Website list**: vul `https://www.risegoods.nl` én
   `https://www.risegoods.nl/en` in. Alleen je eigen site.
5. **Profile**: kies een Associates Store ID (bv. `risegoods-20`). Bij "what are
   your websites about" beschrijf je het eerlijk: onafhankelijke trendranglijst
   voor duurzame producten, met eigen methodologie. Bij "how do you drive
   traffic": SEO en nieuwsbrief.
6. **Belastingformulier (tax interview)**: welk formulier je invult, hangt af van
   of je voor de Amerikaanse fiscus inwoner bent (dat gaat over verblijfsduur en
   status, niet over nationaliteit). Amazon stelt je die vragen en kiest dan zelf
   het formulier:
   - **Ben je US tax resident** (SSN of ITIN, woont en werkt in de VS): dan wordt
     het een **W-9**. Dit is jouw situatie zoals ik het nu begrijp.
   - **Ben je dat niet**: dan wordt het een **W-8BEN**, met je Nederlandse
     belastingnummer. Nederland heeft een verdrag met de VS, dus je houdt de
     verdragskorting op de inhouding.
   Heb je nog geen SSN of ITIN, dan is dat geen blokkade: het W-8BEN-spoor werkt
   ook. Vraag hier bij twijfel je boekhouder of belastingadviseur — hier gaat het
   over jouw belastingpositie, niet over de site.
7. **Uitbetaling**: kies **direct deposit**, nooit cheque (drempel $100 en $15
   kosten; bij direct deposit $10 en geen kosten).
   - Met een **Amerikaanse bankrekening**: gewoon invullen, klaar.
   - Met alleen een **Nederlandse (euro)rekening**: dat kan ook. Voor commissies
     uit de VS, VK, Duitsland, Frankrijk, Italië, Spanje en Canada betaalt Amazon
     rechtstreeks uit op een rekening in de eurozone.
8. Je krijgt direct een voorlopig account met werkende links. Volledige
   goedkeuring volgt na die drie verkopen.

### 2.3 OneLink: onmisbaar door de scheve situatie

Hier zit de kern van het probleem met deze pivot, en het is het waard om er even
bij stil te staan. Je zit in de VS en kiest `amazon.com`. Maar je domein is
`.nl`, je content is voor 90% Nederlands, en Google heeft je geïndexeerd als
Nederlandse site — dus je bezoekers zijn voorlopig vooral Nederlands.

Een Nederlandse bezoeker die je naar `amazon.com` stuurt, koopt daar vrijwel
nooit (dollars, verzending vanuit de VS). Zonder maatregel gooi je dus precies
het verkeer weg dat je wél hebt, terwijl je wacht op verkeer dat je nog niet
hebt. Met drie verkopen in 180 dagen te halen is dat geen detail.

**OneLink** lost dit op: het stuurt een bezoeker automatisch door naar zijn
eigen Amazon-winkel, en jij houdt de commissie. Nederland (`amazon.nl`) zit in
de lijst van ondersteunde landen. Met één US Store ID verdien je bovendien
direct mee in Canada, VK, Duitsland, Frankrijk, Italië en Spanje.

Aanzetten: in Associates Central → **Tools → OneLink**, landen selecteren, en
het stukje script dat Amazon geeft op de site plaatsen.

> Controleer in dat scherm expliciet of `amazon.nl` onder jouw Store ID valt of
> dat je daarvoor apart lid moet worden van het Amazon EU-programma. Amazon's
> eigen documentatie is hier niet eenduidig; wat het dashboard zegt, is waar.

### 2.4 Wat er aan de site moet veranderen vóór de eerste link

Het koopblok staat er al (`app/product-view.tsx`, `BuyBlock`), met
`rel="nofollow sponsored noopener"` — precies goed. Drie dingen moeten nog:

1. **Verplichte disclosure-tekst.** Amazon eist een letterlijke vermelding. Zet
   in de affiliate-melding (`lib/i18n.ts`, `affiliateNote`) de zin erbij:
   *"Als Amazon Associate verdienen wij aan in aanmerking komende aankopen."* /
   *"As an Amazon Associate we earn from qualifying purchases."*
2. **Prijzen weghalen bij Amazon-kanalen.** Het koopblok toont nu `±€X` uit
   `product_offers.price`, handmatig ingevuld. Amazon staat het tonen van
   prijzen alleen toe als ze via hun eigen API of widget komen en actueel zijn —
   een met de hand ingetypte prijs is een overtreding, ook met de disclaimer
   "prijzen zijn een indicatie". Laat `price` leeg voor Amazon. De API (PA-API)
   krijg je pas ná die drie verkopen.
3. **Nooit affiliate-links in de nieuwsbrief.** Amazon verbiedt links in e-mail
   en pdf's. Belangrijk om nu te weten, vóór taak 7.7 uit `strategie.md`.

De onafhankelijkheidsclaim is al afgebakend naar "de trendscore staat los van
commerciële belangen" (commit `a82aaaf`), dus dat deel is in orde.

---

## 3. SEO

### 3.1 Wat al goed staat

Dit is technisch een nette site — de basis hoeft niet gerepareerd te worden:

- `sitemap.xml` werkt, 222 URL's, dagelijks vernieuwd.
- `robots.txt` werkt, AI-crawlers expliciet welkom (goed voor vindbaarheid via
  ChatGPT/Claude/Perplexity).
- Canonical-URL's staan goed; `risegoods.nl` stuurt door naar `www`.
- hreflang-koppeling tussen nl en en staat op homepage, product- en
  categoriepagina's.
- Structured data: `Organization`, `WebSite` en `Product` per productpagina.
- Dagelijkse verse data — precies wat Google bij "trending" wil zien.

### 3.2 Doen: meten wat je nu niet meet

1. **Google Search Console** op <https://search.google.com/search-console>. Kies
   "URL-prefix", vul `https://www.risegoods.nl` in, verifieer via het
   HTML-bestand of via DNS, en dien daarna de sitemap in. Dit is de enige plek
   waar je ziet *op welke zoekwoorden* je al verschijnt en hoe vaak — die lijst
   is je SEO-agenda voor de maanden erna.
2. **Bing Webmaster Tools** op <https://www.bing.com/webmasters>. Daar kun je in
   één klik importeren uit Search Console. Bing voedt ook DuckDuckGo en de
   zoekresultaten in ChatGPT, dus dat is geen randverschijnsel meer.

### 3.3 Doen: de titels en namen fixen (grootste snelle winst)

De productnamen komen rechtstreeks uit de seed-zoekwoorden en staan in kleine
letters. Dat rolt door naar wat Google laat zien:

| Nu | Probleem |
|----|----------|
| `fairphone, trending duurzaam \| Risegoods` | naam met kleine letter, "trending duurzaam" is geen zoekterm |
| `Trending duurzame huis, september 2026` | geen Nederlands ("duurzame huis") |
| `wool dryer balls` als productnaam op een NL-site | Engelse naam in de Nederlandse ranglijst |

Wat beter werkt: een nette weergavenaam per product (`Fairphone`, `Wollen
drogerballen`) en titels die een echte zoekvraag nabootsen, bv. `Fairphone:
trendscore, prijs en duurzame winst | Risegoods` en `Trending duurzame
woonproducten — september 2026`.

### 3.4 Doen: de pagina's vullen die nu leeg zijn

- `product_offers`: **0 rijen**. Er staat op dit moment geen enkel koopkanaal in
  de database — dus ook geen enkele plek waar een Amazon-link zou landen. Dit is
  de harde blokkade voor inkomsten, niet de aanmelding bij Amazon.
- `site_content`: **0 rijen**. De CMS-teksten voor homepage en categorieën zijn
  nog de standaardteksten. Categoriepagina's met een eigen, inhoudelijke intro
  van 150–250 woorden zijn de pagina's die het makkelijkst gaan ranken.
- Redactionele velden per product (`description`, `why_sustainable`, `co2_note`)
  zijn wél gevuld: bij alle 89 goedgekeurde producten, in nl én en. Daarmee haal
  je Amazon's eis van april 2026 ("commentary, analysis or transformation for
  additional value") ruim. Wat ontbreekt is `co2_kg_per_year` (4 van 100) en
  `lifespan` (0 van 100), en dat zijn juist de cijfers achter de
  true-price-calculator. Zie `docs/werklijst.md`, werkstroom I.

Prioriteit: begin bij de 10–15 producten met de hoogste trendscore, niet bij
alle 100.

### 3.5 Kleine technische punten

- `public/robots.txt` doet niets: `app/robots.ts` overschrijft hem. De
  `Disallow: /embed/` uit dat dode bestand staat dus niet live, waardoor
  embed-pagina's indexeerbaar zijn. Samenvoegen in `app/robots.ts` en
  `public/robots.txt` weggooien.
- `x-default` hreflang ontbreekt (voor bezoekers buiten nl/en).
- `/blog` heeft geen canonical-URL.

### 3.6 Backlinks: je sterkste kaart ligt er al

De insluitbare calculator (`/embed/calculator`, zie `docs/embed-calculator.md`)
is een link-magneet. Elke gemeente, energiecoöperatie of duurzaamheidsblog die
hem insluit, levert een link terug. Dat is waardevoller dan welk SEO-trucje ook.
Aanpak: tien relevante partijen aanschrijven met "gratis te gebruiken,
bronvermelding verplicht".

Tweede kaart: het maandelijkse Risegoods Index-rapport (trede 1) is ook
persmateriaal. Een vakmedium dat je cijfers citeert, linkt naar je.

---

## 4. Google Ads: advies is *nu niet*

Dit is niet voorzichtigheid, het is rekenwerk. Een realistische keten:

| Stap | Aanname | Aantal |
|------|---------|--------|
| Klikken die je koopt | €0,45 per klik, budget €450 | 1.000 |
| Bezoekers die op een koopknop klikken | 20% | 200 |
| Daarvan die bij Amazon iets kopen | 6% | 12 |
| Gemiddelde order | €40 | €480 omzet |
| Jouw commissie | ~3% | **€14** |

€450 eruit, €14 terug. Ook met tweemaal optimistischer aannames blijft dat
verlies. Amazon's cookie leeft maar 24 uur en de commissie is 1–4% — te weinig
marge om klikken voor te kopen.

Drie extra redenen:

1. **Google's "thin affiliate"-beleid.** Advertenties van affiliatesites die
   vooral doorverwijzen worden afgekeurd. Je site is inhoudelijker dan
   gemiddeld, maar het is een reëel risico.
2. **Amazon's regels.** Advertenties mogen nooit rechtstreeks (of via een
   doorstuurlink) naar Amazon leiden — alleen naar je eigen site. En sinds **14
   april 2026** heeft Amazon de uitsluiting verbreed: aankopen via "any paid or
   boosted advertisement linking to Amazon" vervallen, ongeacht welke
   zoekwoorden je gebruikt. De beleidspagina staat betaalde advertenties naar je
   eigen site nog steeds toe, maar die twee teksten wringen. Zet hier geen geld
   op voordat je het zelf in de actuele operating agreement hebt nagelezen.
3. **Je weet nog niet wat werkt.** Zonder Search Console-data koop je klikken op
   zoekwoorden waarvan je niet weet of ze converteren.

**Wanneer Ads later wél kan:** niet om producten te verkopen, maar om
nieuwsbriefinschrijvingen of B2B-leads voor het Index-rapport te kopen. Eén lead
die €300/maand aan datalicentie oplevert, mag €20 kosten. Eén Amazon-klik mag
€0,01 kosten. Dat is het hele verschil.

---

## 5. Wel doen: de kanalen die nu passen

Op volgorde van opbrengst per uur werk:

1. **SEO op categorie- en productpagina's** (3.3 + 3.4). Traag, maar het enige
   dat cumuleert.
2. **Embed-calculator uitzetten voor backlinks** (3.6).
3. **Nieuwsbrief** — geen Amazon-links, maar wel de wekelijkse "wat versnelt
   er"-mail. Dit is trede 3 uit `strategie.md` en het maakt je onafhankelijk van
   Google.
4. **Reddit / forums**: alleen inhoudelijk meedoen (r/DutchFIRE, r/Netherlands,
   r/ZeroWaste), nooit linkdumpen. Eén goede reactie met je data erin kan
   honderden bezoekers geven.
5. **Pinterest**: voor duurzame producten onverwacht sterk, en het verkeer is
   koopgericht. Productkaarten pinnen naar productpagina's.
6. **Persmoment rond het eerste Index-rapport**: één cijfer dat een journalist
   kan citeren.

Bewust níet: Instagram/TikTok (tijdrovend, verkeer converteert slecht), gekochte
links, artikelnetwerken.

---

## 6. Eerste 30 dagen, in volgorde

| Wanneer | Wat | Wie |
|---------|-----|-----|
| Dag 1 | Migraties 0003 + 0009 uitvoeren in Supabase; `check-db.mjs` groen | jij (5 min) |
| Dag 1 | Google Search Console instellen + sitemap indienen | jij (15 min) |
| Dag 2 | Bing Webmaster Tools, importeren uit GSC | jij (5 min) |
| Dag 2 | Amazon Associates aanmelden + W-8BEN + direct deposit | jij (30 min) |
| Dag 3 | OneLink aanzetten, landen selecteren | jij |
| Week 1 | Disclosure-tekst + prijzen-uit-koopblok aanpassen in de code | Claude-taak |
| Week 1 | Productnamen en paginatitels netjes maken | Claude-taak |
| Week 2 | Top 15 producten: koopkanalen (Amazon) invoeren in de admin | jij |
| Week 2 | Categorie-intro's schrijven via het CMS | jij + Claude |
| Week 3 | Tien partijen aanschrijven voor de embed-calculator | jij |
| Week 4 | Search Console-data bekijken: waar verschijn je al? Daarop doorbouwen | samen |

Na 30 dagen weet je uit `/admin/stats` én Search Console eindelijk wát er
gebeurt. Alles hierboven is bedoeld om dat meetbaar te maken voordat er geld
naartoe gaat.

---

## Bronnen

- Amazon Associates programmabeleid (betaald zoeken):
  <https://affiliate-program.amazon.com/help/operating/policies>
- Wijzigingen operating agreement per 14 april 2026:
  <https://affiliate-program.amazon.com/help/operating/compare>
- Uitbetaling internationaal:
  <https://affiliate-program.amazon.com/help/node/topic/G8VUMS6GTBCR9RGV>
- OneLink / internationaal verkeer:
  <https://affiliate-program.amazon.com/resource-center/onelink-launch>
