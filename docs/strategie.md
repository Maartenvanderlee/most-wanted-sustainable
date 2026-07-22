# Risegoods — Strategie & draaiboek

> Werkdocument. Laad dit als projectcontext in Cowork, dan kent elke taak de
> hele achtergrond. Hoofdstuk 7 is het draaiboek: kant-en-klare prompts die je
> letterlijk kunt overnemen.
>
> Status van de code op moment van schrijven: 89 goedgekeurde producten,
> tweetalig (nl/en), live op https://www.risegoods.nl. Dagelijkse pipeline-cron
> draait (append-only `scores`/`signals`). True-pricing-kaart met CO2, euro's,
> tastbare vergelijkingen en gebruiksschuif staat live.

---

## 1. Kernprincipe: onafhankelijkheid is je activum, geen ideologie

Elk ander duurzaamheidslijstje in Nederland is affiliate-gedreven, en iedereen
ziet dat. Risegoods is de enige die kan zeggen: **"de score staat los van wie
ons betaalt."** Dat is precies wat je later verkoopt.

De valkuil: die claim vroeg omzetten in klikinkomsten. Dan ruil je een schaars
activum (geloofwaardige onafhankelijkheid) voor een paar tientjes per maand.
Alles hieronder volgt uit die ene keuze.

Concreet betekent dit dat de trendscore 100% los blijft van commercie — geen
uitzonderingen (staat al zo in `CLAUDE.md` en de `trend-score` skill). Elke
verdienstap hieronder is zo ontworpen dat hij die scheiding niet aantast.

---

## 2. Waar het geld zit — en het is niet bij de consument

Je verdient voorlopig niets aan bezoekers. Bij ~2.500 bezoekers/maand is
affiliate goed voor misschien €30. De echte waarde van je verkeer is dat het
**bewijs** is voor een B2B-verkoop.

Daar zit je persoonlijke voorsprong: je verkoopt in je werk al op DMU-niveau
(decision making unit). Dat is een oneerlijk voordeel dat de gemiddelde
site-eigenaar niet heeft — de meesten wachten passief op advertentie-inkomsten
omdat ze niet durven bellen.

### De verdienladder

| Trede | Wat | Vanaf | Verkeer nodig? | Orde van grootte |
|------|-----|-------|----------------|------------------|
| 1 | **Datalicentie** — "Risegoods Index" | ~maand 4 | Nee | €300–1.500 p/m per afnemer |
| 2 | **Calculator als betaalde embed** | maand 6+ | Nee | Jaarlicentie, whitelabel |
| 3 | **Nieuwsbriefsponsoring** | ~2.000 abonnees | Ja | €200–500 per plaatsing |
| 4 | **Affiliate** | pas als claim intact blijft | Ja | ~€30 p/m nu; marginaal |

**Trede 1 — Datalicentie (het fundament).** Een maandelijkse "Risegoods Index":
welke duurzame productcategorieën versnellen in NL, met onderbouwing uit je
append-only historie. Kopers: inkopers en categorymanagers bij retail (Bol,
Coolblue, HEMA, Jumbo), duurzaamheidsbureaus, merken die willen weten waar de
vraag heen beweegt. Klassieke B2B-verkoop, ordegrootte €300–1.500 per maand per
afnemer. Vijf afnemers is een salaris-vervangend bedrag. **Je hebt hier geen
publiek voor nodig — alleen de data die je al genereert.**

**Trede 2 — De calculator als betaalde embed.** Je CO2/euro-widget met de
gebruiksschuif (`app/true-price-card.tsx`) is een product op zichzelf.
Gemeenten, energiecoöperaties, woningcorporaties en energieadviesdiensten
hebben behoefte aan precies zo'n rekentool en bouwen die liever niet zelf.
Whitelabel, jaarlicentie.

**Trede 3 — Nieuwsbriefsponsoring.** Eén duidelijk gelabeld blok, nooit in de
ranglijst. Bij een niche-NL-lijst van ~2.000 abonnees is €200–500 per
plaatsing realistisch. Vereist eerst een Resend-account (gratis) voor de
digest.

**Trede 4 — Affiliate, pas als het mag zonder je claim te breken.** Als je het
ooit toevoegt: een apart, gelabeld "waar te koop"-blok, en de hero-claim wordt
"de trendscore staat los van commerciële belangen" in plaats van "100%
onafhankelijk van affiliate". Dat is het verschil tussen een correcte en een
misleidende claim onder EmpCo / EU Green Claims.

---

## 3. Wat dit aan het plan verandert

**Erbij — leg alles vast alsof je het gaat verkopen.** Je methodologie, je
bronnen, je historische scores. Die tijdreeks *is* het product van trede 1, en
je kunt hem niet met terugwerkende kracht opbouwen.
→ *Goede nieuws: dit draait al.* De dagelijkse cron schrijft append-only
snapshots weg. Wat ontbreekt is **borging**: de historie structureel buiten
Supabase veiligstellen (de gratis tier kan pauzeren of data verliezen). Zie
taak 7.2.

**Erbij — de Engelse versie is geen bijzaak meer.** Je zit straks in New Jersey;
de Amerikaanse markt voor dit soort data is een orde van grootte groter.
Behandel `/en` als **markt twee, niet als vertaling** — met eigen
productselectie en eigen bronweging.

**Vervalt — de gedachte dat je eerst verkeer nodig hebt om te verdienen.** Je
kunt in september je eerste indexrapport verkopen terwijl de site nog 300
bezoekers doet. Sterker: dat gesprek levert je meteen inzicht op in welke
categorieën je moet meten.

---

## 4. Onafhankelijkheidsclaim & compliance

De claim is je activum, dus behandel hem juridisch als zodanig.

- **Nu correct houden:** zolang er geen affiliate-links op de site staan, is
  "100% onafhankelijk van affiliate of sponsoring" waar. Blijft zo tot trede 4.
- **Bij trede 4:** herformuleer naar "de trendscore staat los van commerciële
  belangen" en label elk verkooppunt expliciet. Onder EmpCo (Empowering
  Consumers) en de EU Green Claims-richtlijn is het verschil tussen die twee
  formuleringen het verschil tussen correct en misleidend.
- **Formeel:** zodra je structureel factureert (trede 1), moet er een
  KvK-inschrijving en btw-administratie staan, en moeten je algemene
  voorwaarden je onafhankelijkheidsclaim schragen. Vóór die tijd is "project"
  prima. *Dit is geen juridisch advies — laat de eerste licentieovereenkomst
  één keer nakijken.*

---

## 5. Tijdlijn

| Wanneer | Mijlpaal |
|---------|----------|
| **Deze week** | Zoekwoordinventarisatie (taak 7.1) + historie borgen (taak 7.2) |
| Maand 1–3 | Historie laten groeien; `/en` als markt twee opzetten (7.5); nieuwsbrief laten lopen |
| ~Maand 4 | Eerste Risegoods Index-rapport (7.3) → eerste B2B-gesprek |
| Maand 6+ | Calculator-embed als product (7.4); claim-compliance vóór eventuele affiliate (7.6) |
| ~2.000 abonnees | Nieuwsbriefsponsoring (7.7) |

---

## 6. Deze week — de twee onomkeerbare dingen

1. **Zoekwoordinventarisatie.** Levert direct SEO-richting én de categorie-as
   voor trede 1.
2. **Historie borgen.** Niet urgent qua deadline, wél onomkeerbaar als je het
   nalaat: verlies je de tijdreeks, dan verlies je het product van trede 1.

Alles hieronder in hoofdstuk 7 kun je als losse Cowork-taak oppakken.

---

## 7. Draaiboek — Cowork-taken als kant-en-klare prompts

> Kopieer een prompt hieronder in een Cowork/Claude Code-sessie met dit
> document als projectcontext. Ze zijn zo geschreven dat de agent eerst de
> bestaande code checkt en niets dubbel bouwt.

### 7.1 — Zoekwoordinventarisatie *(deze week)*

```
Werk data/seed-keywords.md uit tot een marktkaart voor duurzame producten.
Begin met wat er al staat (118 regels). Doel: (1) SEO-richting voor risegoods.nl
en (2) de categorie-as voor een later dataproduct. Groepeer zoekwoorden per
categorie (huis, verzorging, kleding, techniek, voeding), voeg per groep de
belangrijkste NL-zoektermen toe en markeer welke we nog niet als product of
seed-keyword dekken. Houd NL en US apart — dit worden twee markten. Lever een
overzicht van gaten (categorieën met vraag maar zonder producten in onze lijst).
Verzin geen zoekvolumes; markeer waar externe data nodig is.
```

### 7.2 — Historie borgen *(deze week)*

```
De append-only scores/signals-historie is ons belangrijkste bezit, maar staat
nu alleen in Supabase (gratis tier kan pauzeren). scripts/export-archive.mjs
bestaat al. Maak van het exporteren een betrouwbaar, terugkerend proces:
onderzoek of we het als extra Vercel-cron of GitHub Action kunnen draaien die
periodiek een export wegschrijft naar een duurzame plek buiten Supabase.
Controleer eerst wat export-archive.mjs nu precies exporteert en of scores en
signals er volledig in zitten. Verander niets aan de append-only regel. Lever
een concreet, getest voorstel; wijzig geen productie-cron zonder het uit te
leggen.
```

### 7.3 — Risegoods Index, eerste rapport (trede 1)

```
Bouw een generator voor een maandelijks "Risegoods Index"-rapport uit de
bestaande scores/signals-historie: welke duurzame productcategorieën versnellen
in NL, met onderbouwing per bron. Doel is een verkoopbaar B2B-rapport, geen
publieke pagina. Begin met het lezen van lib/scoring/ en lib/queries.ts zodat
het rapport dezelfde methodologie gebruikt als de site. Output als een net
databestand of PDF-vriendelijke markdown. Geen verzonnen cijfers: alles moet
herleidbaar zijn tot onze eigen metingen.
```

### 7.4 — Calculator als embed (trede 2)

```
Maak van de true-pricing-calculator (app/true-price-card.tsx) een losstaand,
insluitbaar widget dat derden (gemeenten, energiecoöperaties) kunnen whitelabelen.
Behoud de bronvermelding (lib/true-price.ts, CE Delft-schaduwprijs). Onderzoek
de schoonste technische vorm (iframe-embed of los script) en lever een werkend
prototype plus een korte uitleg hoe een externe partij het insluit. Raak de
bestaande productpagina niet.
```

### 7.5 — /en als markt twee (VS)

```
Behandel de Engelse site als een aparte markt, niet als vertaling. Onderzoek in
de codebase hoe productselectie en bronweging nu gedeeld zijn tussen nl en en,
en stel een aanpak voor waarbij /en een eigen productselectie en eigen
bronweging kan hebben (bv. US-bronnen zwaarder). Begin met een analyse en een
plan; bouw pas na akkoord. Houd rekening met de bestaande i18n-structuur
(lib/i18n.ts) en de hreflang-koppeling.
```

### 7.6 — Claim-compliance vóór affiliate (trede 4)

```
Bereid de site voor op affiliate-links zonder de onafhankelijkheidsclaim te
breken. Inventariseer waar nu "100% onafhankelijk van affiliate of sponsoring"
staat (o.a. lib/i18n.ts, lib/content.ts). Stel de herformulering voor naar "de
trendscore staat los van commerciële belangen", en ontwerp een duidelijk
gelabeld "waar te koop"-blok dat visueel én qua tekst gescheiden is van de
score. Toets tegen EmpCo / EU Green Claims. Lever een plan; wijzig nog niets
live.
```

### 7.7 — Nieuwsbrief sponsor-waardig maken (trede 3)

```
Bereid de nieuwsbrief voor op sponsoring bij ~2.000 abonnees. Vereist eerst een
Resend-account (gratis). Ontwerp een wekelijkse digest met precies één duidelijk
gelabeld sponsorblok, nooit in de ranglijst. Begin met het onderzoeken van de
huidige nieuwsbrief-aanmelding en subscribers-tabel in de codebase. Lever een
plan voor de digest-opbouw en het sponsorblok; bouw na akkoord.
```

---

## Bijlage — waar wat staat in de code

- Trendscore & weging: `lib/scoring/`, `lib/scoring/version.ts`
- Append-only historie: `scores`/`signals` tabellen; pipeline `app/api/pipeline/run`
- Dagelijkse cron: `vercel.json` (06:00 + 06:40 UTC, 2 batches)
- True-pricing-calculator: `app/true-price-card.tsx`, `lib/true-price.ts`
- Zoekwoorden: `data/seed-keywords.md`
- Export/backup: `scripts/export-archive.mjs`
- Tweetaligheid: `lib/i18n.ts`, gedeelde views (`home-view`/`product-view`/`category-view`)
- Curatie & claims: `.claude/skills/sustainability-curation/SKILL.md`
- Skills (leidend): `.claude/skills/` (adapters, scoring, curatie, db, seo)
