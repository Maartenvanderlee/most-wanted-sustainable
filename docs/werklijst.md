# Werklijst

> Het enige bord. Spelregels staan in `docs/werkwijze.md`.
> **Maximaal één lopend item per werkstroom, maximaal twee werkstromen open.**
> Werkstromen: **W** waken · **B** bouwen · **I** inhoud · **M** marketing · **C** commercie
>
> Bijgewerkt: 21 september 2026 (na doormeting van de hele site en database)

---

## Waakhondrapport

*Nog niet geautomatiseerd. Zodra de geplande ochtendrun staat, schrijft die hier
elke dag één blok. Handmatige meting van 21 september 2026:*

| Check | Uitkomst |
|-------|----------|
| Pipeline vannacht | ✓ 21 sept, 100 producten, alle 4 bronnen, formule v4 |
| Historie (append-only) | ✓ 63 van 65 kalenderdagen sinds 19 juli (mist 25 juli en 12 aug) |
| Wekelijkse backup | ✗ **faalt elke maandag sinds 23 juli** — zie W1 |
| Databasetabellen | ✗ 2 van 10 ontbreken — zie W2 |
| CI | ✓ groen |
| Bezoekers gisteren | ✗ niet te meten zolang W2 openstaat |

---

## Wat er stil kapot was

Drie dingen die maanden onopgemerkt fout gingen. Ze horen alle drie in werkstroom
**W**, die tot nu toe geen eigenaar had. Dit is de reden dat die werkstroom als
eerste geautomatiseerd wordt.

1. **De trendscore zag maanden lang maar 6% van de signalen** — gevonden en
   gerepareerd op 17 september (commit `b72ed29`). Gevolg: de scores van eind
   juli tot 17 september zijn op een verminkte basis berekend. Dat is een
   methodologiebreuk in de tijdreeks die je later aan een B2B-koper moet kunnen
   uitleggen.
2. **De `events`-tabel bestond niet** — gevonden 21 september. `/admin/stats`
   stond daarom altijd op 0 bezoekers, terwijl Google de site wél had
   geïndexeerd.
3. **De wekelijkse backup faalt sinds de dag dat hij gebouwd is** — gevonden
   21 september. De laatste echte export is van **22 juli** en bevat 44
   score-rijen; er zijn er nu 5.324. Het "waardevolste bezit" is dus twee maanden
   lang niet geborgd geweest.

---

## De koers (herzien 21 september 2026)

Twee sporen parallel, en ze concurreren niet om dezelfde tijd.

**Spoor 1 — verkeer en conversie (mijn werk, zaterdagbatch).** Amazon wordt
geactiveerd, niet uitgesteld. Niet om de ~€30 per maand, maar omdat kliks en
aankopen de ontbrekende laag onder het B2B-rapport zijn: "welke versnelling
converteert echt" is een betere propositie dan "welke categorie versnelt". Een
bewezen inkomstenstroom, hoe klein ook, is bovendien een vertrekpunt voor
optimalisatie dat nul niet is.

**Spoor 2 — kopersgesprekken (jouw 10 minuten per dag).** Eén bericht uit
`docs/eerste-tien-gesprekken.md`. Niet wachten tot de conversiedata "goed genoeg"
is: de eerste orders zeggen statistisch niets, en de gesprekken vertellen je of
het rapport iets waard is.

**Eén harde grens.** Affiliate-data mag de trendscore nooit raken (`CLAUDE.md`,
geen uitzonderingen). Conversiecijfers worden een aparte, duidelijk gescheiden
sectie in het B2B-rapport — nooit een bron in de score.

---

## Nu doen (urgent, vandaag)

| # | Stroom | Item | Wie |
|---|--------|------|-----|
| W1 | W | Migraties 0003 + 0009 uitvoeren in de Supabase SQL Editor (SQL in `docs/verkeersplan.md` §1). Daarna `npm run check-db` → alles ✅. **Dit is het instrument, niet alleen een reparatie:** `/api/track` registreert `outbound`-kliks per product. Dat is de helft van de conversiedata die je rapport legitimeert, en het werkt los van Amazon. | jij, 5 min |
| W2 | W | GitHub-secrets instellen zodat de wekelijkse backup werkt. Repo → **Settings → Secrets and variables → Actions → New repository secret**: `NEXT_PUBLIC_SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` (waarden uit `.env.local`). Daarna Actions → *Weekly data archive* → **Run workflow**. | jij, 5 min |
| C1 | C | Amazon Associates aanmelden + W-9 of W-8BEN + direct deposit (`docs/verkeersplan.md` §2.2). Daarna OneLink aanzetten. Deadline drie verkopen: 180 dagen na aanmelding. | jij, 30 min |

---

## Werkvoorraad per werkstroom

### W — Waken

- [ ] Waakhond als subagent + geplande ochtendrun (haalt punt 1–3 hierboven voorgoed weg)
- [ ] Faalmelding van GitHub Actions ergens laten landen waar je hem ziet
- [ ] Methodologiebreuk (17 sept) vastleggen in `CHANGELOG.md`, zodat een B2B-koper de knik in de reeks uitgelegd krijgt
- [ ] Accepteren en noteren: 25 juli en 12 augustus missen in de historie

### B — Bouwen

- [ ] Amazon-disclosuretekst toevoegen (`lib/i18n.ts`, `affiliateNote`)
- [ ] Prijzen uit het koopblok halen voor Amazon-kanalen (beleidsregel, zie `docs/verkeersplan.md` §2.4)
- [ ] `public/robots.txt` opruimen (doet niets; `app/robots.ts` overschrijft hem) en `Disallow: /embed/` daar toevoegen
- [ ] `x-default` hreflang toevoegen; canonical op `/blog`

### I — Inhoud & curatie

- [ ] **Keurmerken: 2 van 89 goedgekeurde producten hebben een erkend keurmerk** (beide FSC), en de bewijstabel `product_certifications` is leeg. `CLAUDE.md` belooft "certificeringen met verifieerbaar registerbewijs". Dit gat is je grootste geloofwaardigheidsrisico — en het eerste waar een B2B-koper of een EmpCo-klacht op zou vallen.
- [ ] **CO2-cijfers: 4 van 100 producten** hebben `co2_kg_per_year`. De true-price-calculator, jouw beste B2B-troef, is dus voor 96% van de catalogus leeg.
- [ ] `lifespan` is bij 0 van de 100 producten gevuld
- [ ] Koopkanalen (`product_offers`): 0 rijen — begin bij de top 15 op trendscore
- [ ] Categorie- en homepageteksten via het CMS (`site_content`: 0 rijen)

*Wel in orde:* beschrijving, why_sustainable, co2_note en foto zijn bij alle 89
goedgekeurde producten gevuld, in nl én en.

### M — Verkeer, conversie & marketing

Op volgorde: eerst meten, dan koopkant, dan verkeer. Meten zonder koopknop geeft
geen conversie; verkeer zonder meting leert je niets.

- [ ] W1 afronden zodat `outbound`-kliks per product binnenkomen
- [ ] Amazon-disclosuretekst + prijzen uit het koopblok (zie werkstroom B)
- [ ] Koopkanalen invoeren voor de top 15 op trendscore (`product_offers`: nu 0 rijen) — dit is de harde blokkade, niet de aanmelding bij Amazon
- [ ] Google Search Console instellen + sitemap indienen
- [ ] Bing Webmaster Tools (importeren uit GSC)
- [ ] Productnamen netjes maken (staan nu in kleine letters, Engels op de NL-site)
- [ ] Paginatitels herschrijven ("Trending duurzame huis" is geen Nederlands)
- [ ] Categorie-intro's via het CMS (`site_content`: nu 0 rijen)
- [ ] Tien partijen aanschrijven voor de embed-calculator (backlinks)
- [ ] Later: conversiesectie in het Index-rapport, strikt gescheiden van de score

### C — Commercie

- [ ] C1 hierboven: Amazon aanmelden + OneLink
- [ ] Eén bericht per werkdag uit `docs/eerste-tien-gesprekken.md`, antwoord loggen
- [ ] Maandelijks `npm run report` en sturen naar wie reageerde

---

## Bewust niet doen

- Google Ads (rekent niet uit: €450 in, ~€14 uit — `docs/verkeersplan.md` §4)
- Reddit- en eBay-adapter activeren (standby, sleutels nodig, levert nu niets op)
- Instagram/TikTok
- Nieuwe features zolang W1 en W2 openstaan
