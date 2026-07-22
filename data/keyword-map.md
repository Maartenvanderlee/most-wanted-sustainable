# Zoekwoord-marktkaart (taak 7.1)

> **Menselijk strategiedocument, geen pipeline-input.** De pipeline leest alleen
> `data/seed-keywords.md` (Engels, machine-leesbaar). Dit bestand is de
> marktkaart eromheen: Nederlandse SEO-termen, de VS als aparte markt, en de
> gaten. Zet de NL-termen hieronder **niet** als `- regel` onder een `##`-kopje
> in `seed-keywords.md` — de parser in `lib/keywords.ts` zou ze dan als extra
> te-meten pipeline-zoekwoorden oppikken en talen in de trendscore mengen.
>
> Geen zoekvolumes verzonnen. Waar prioritering een keyword-tool vereist
> (Google Keyword Planner / Trends / Ahrefs), staat dat expliciet gemarkeerd.

## Twee markten, twee lagen

| | Wat | Status |
|---|---|---|
| **VS / internationaal** | De 100 Engelse termen in `seed-keywords.md` | Draait; voedt de trendscore |
| **NL** | De vertaalde/gelokaliseerde termen hieronder | **Nog nergens getrackt** — het grootste gat |

Kernprobleem: het hoofddomein is `risegoods.nl` (Nederlandstalig publiek), maar
de pipeline en dus de trendscore meten uitsluitend op **Engelse** termen. Voor
markt twee (VS, taak 7.5) is dat prima; voor de thuismarkt is de hele
Nederlandse zoeklaag nu een blinde vlek. Dit is het belangrijkste gat dat 7.1
blootlegt.

---

## NL-zoektermen per categorie

Gelokaliseerd naar hóé Nederlanders zoeken (niet letterlijk vertaald).
`≈` = Engelse term wordt in NL ook zo gebruikt. `?` = onzeker, keyword-tool
nodig ter bevestiging.

### home

| EN seed | NL-zoekterm(en) | Opmerking |
|---|---|---|
| beeswax food wraps | bijenwasdoek, bijenwasdoeken | |
| compostable trash bags | composteerbare vuilniszakken, afbreekbare afvalzakken | |
| bamboo cutting board | bamboe snijplank | |
| wool dryer balls | wasbollen, wollen drogerballen, drogerballen | 3 varianten, tool nodig voor de sterkste |
| refillable cleaning spray | navulbare allesreiniger, schoonmaak navultabletten | refill-trend groeit hard in NL |
| solid dish soap bar | vaste afwaszeep, afwasblok | |
| silicone food storage bags | siliconen diepvrieszakjes, herbruikbare diepvrieszakken | |
| recycled toilet paper | gerecycled toiletpapier | |
| bamboo paper towels | herbruikbare keukenrol, bamboe keukenrol | |
| glass food containers | glazen vershoudbakjes, glazen bewaardozen | |
| natural loofah sponge | loofah spons, natuurspons | |
| swedish dishcloth | sponsdoekje, vaatdoekje ≈ | |
| countertop compost bin | gft-bakje keuken, aanrecht compostbak | |
| energy efficient led bulbs | energiezuinige ledlamp, led lampen zuinig | |
| smart thermostat | slimme thermostaat | hoog volume (energie) |
| water saving shower head | waterbesparende douchekop | |
| linen bedding organic | linnen dekbedovertrek, biologisch beddengoed | |
| recycled plastic rug | gerecycled vloerkleed, buitenkleed gerecycled | |
| cork yoga mat | kurk yogamat | |
| upcycled furniture | opgeknapte meubels, tweedehands meubels | |

### personal_care

| EN seed | NL-zoekterm(en) | Opmerking |
|---|---|---|
| bamboo toothbrush | bamboe tandenborstel | |
| toothpaste tablets | tandpasta tabletten | |
| refillable deodorant | navulbare deodorant | |
| shampoo bar | shampoo bar, vaste shampoo | ≈ |
| conditioner bar | conditioner bar, vaste conditioner | ≈ |
| safety razor | safety razor, klassiek scheermes | ≈ |
| reusable makeup remover pads | wasbare wattenschijfjes | |
| menstrual cup | menstruatiecup | |
| period underwear | menstruatie ondergoed, period underwear | ≈ |
| solid perfume | vaste parfum | ? laag volume |
| zero waste floss | navulbare flosdraad, plasticvrij flossen | |
| refillable lip balm | navulbare lippenbalsem | |
| natural sunscreen reef safe | natuurlijke zonnebrand, koraalvriendelijke zonnebrand | |
| konjac sponge | konjac spons | |
| reusable cotton swab | herbruikbare wattenstaafjes | |
| plastic free soap | plasticvrije zeep | |
| organic cotton towels | biologische katoenen handdoeken | |
| refillable body wash | navulbare douchegel | |
| biodegradable wet wipes | biologisch afbreekbare doekjes | |
| mineral sunscreen stick | minerale zonnebrand stick | |

### fashion

| EN seed | NL-zoekterm(en) | Opmerking |
|---|---|---|
| organic cotton t shirt | biologisch katoenen t-shirt | |
| recycled polyester jacket | gerecycled polyester jas | |
| hemp clothing | hennep kleding | |
| cork wallet | kurk portemonnee | |
| vegan leather bag | vegan leren tas | |
| recycled sneakers | duurzame sneakers, gerecyclede sneakers | |
| merino wool socks | merino wollen sokken | |
| upcycled denim | upcycled spijkerbroek | |
| tencel dress | tencel jurk | ? niche |
| bamboo underwear | bamboe ondergoed | |
| fair trade jeans | fairtrade spijkerbroek | |
| recycled swimwear | duurzame badkleding, gerecyclede bikini | |
| pinatex shoes | ananasleer schoenen, piñatex | ? niche |
| capsule wardrobe basics | capsule wardrobe, basisgarderobe | |
| secondhand designer bags | tweedehands designtassen | |
| repairable shoes | repareerbare schoenen | |
| organic linen shirt | linnen overhemd biologisch | |
| recycled cashmere | gerecyclede kasjmier | ? niche |
| mushroom leather | paddenstoelenleer, mycelium leer | ? niche |
| deadstock fabric clothing | deadstock kleding | ? zeer niche |

### tech

| EN seed | NL-zoekterm(en) | Opmerking |
|---|---|---|
| solar power bank | solar powerbank, zonne-energie powerbank | |
| solar phone charger | solar telefoonoplader | |
| refurbished smartphone | refurbished telefoon | hoog volume |
| fairphone | fairphone | merknaam, hoog volume |
| solar garden lights | solar tuinverlichting | |
| rechargeable batteries usb | oplaadbare batterijen usb | |
| e ink tablet | e-ink tablet | |
| energy monitor plug | slimme energiemeter, verbruiksmeter stekker | |
| hand crank radio | opwindradio, noodradio | |
| solar security camera | solar beveiligingscamera | |
| refurbished laptop | refurbished laptop | hoog volume |
| modular headphones | modulaire koptelefoon | ? niche |
| biodegradable phone case | composteerbaar telefoonhoesje | |
| wind up flashlight | opwindzaklamp, knijpkat | |
| smart power strip | slimme stekkerdoos | |
| solar backpack | solar rugzak | ? niche |
| repairable earbuds | repareerbare oordopjes | |
| e bike conversion kit | e-bike ombouwset, ombouwset elektrische fiets | |
| water powered clock | waterklok | ? zeer niche |
| low energy mini pc | energiezuinige mini pc | |

### food

| EN seed | NL-zoekterm(en) | Opmerking |
|---|---|---|
| oat milk powder | havermelk poeder | |
| reusable coffee filter | herbruikbare koffiefilter | |
| loose leaf tea plastic free | losse thee plasticvrij | |
| beeswax honey local | lokale honing | |
| plant based protein powder | plantaardige eiwitshake, vegan proteïne | |
| fair trade chocolate | fairtrade chocolade | |
| bulk food containers | voorraadbakken, bulk bewaarbakken | |
| reusable produce bags | herbruikbare groente- en fruitzakjes | |
| compostable coffee pods | composteerbare koffiecups | |
| mushroom coffee | paddenstoelenkoffie, mushroom coffee | ≈ |
| regenerative olive oil | regeneratieve olijfolie | ? niche |
| upcycled snacks | upcycled snacks, reststroom-snacks | |
| plastic free tea bags | plasticvrije theezakjes | |
| fermentation kit | fermenteerset | |
| sprouting jar | kiempot, spruitpot | |
| carbon neutral coffee beans | co2-neutrale koffiebonen | |
| seaweed snacks sustainable | zeewiersnacks | |
| refillable spice jars | navulbare kruidenpotjes | |
| imperfect produce box | kromme groenten box, misfit groentebox | |
| vegan jerky | vegan jerky | ≈ |

---

## Gaten-analyse

Vier soorten gaten. De eerste is structureel en het belangrijkst; de rest
vereist een keyword-tool om te prioriteren.

### Gat 1 — De hele NL-zoeklaag wordt niet gemeten *(structureel, grootste)*
De trendscore meet alleen Engelse termen. Voor `risegoods.nl` (NL-publiek) is er
dus geen enkel signaal over wat Néderlanders zoeken. Opties (beslissing nodig,
niet nu bouwen):
- **A.** NL-termen als eigen categorie-set meemeten en apart scoren (raakt de
  formule → trend-score skill volgen, gewicht herijken).
- **B.** NL puur voor SEO/content gebruiken, scoring internationaal houden.
Aanbeveling: begin met **B** (geen risico voor de score), overweeg **A** pas als
markt-NL bewezen waarde heeft.

### Gat 2 — Wonen & energie ondergedekt t.o.v. NL-vraag
De NL-zoekvraag rond energie besparen is enorm (energiecrisis), maar de seed-lijst
dekt alleen `smart thermostat`, `led bulbs`, `shower head`, `energy monitor`.
Ontbrekend met vermoedelijk hoge NL-vraag (tool nodig ter bevestiging):
tochtstrips, radiatorfolie, isolatie(materiaal), tijdschakelaar, regenton,
waterbesparende kraan-aerator.

### Gat 3 — Repair / tweedehands / kringloop ondergedekt
Grote NL-trend (Repair Café, Marktplaats, kringloop), dun in de seed-lijst.
Ontbrekend: reparatieset kleding, fietsreparatie, tweedehands elektronica-breed,
verpakkingsvrij/refill-winkel-termen.

### Gat 4 — Concrete producten met vraag die noch product noch seed-keyword zijn
Opgevallen tijdens deze sessie:
- **herbruikbare koffiebeker / thermosbeker** — hoog volume, staat nergens in
  (juist het voorbeeld uit onze true-pricing-mockup).
- **drinkfles RVS / herbruikbare waterfles** — hoog volume, ontbreekt.
- **lunchbox / broodtrommel RVS** — ontbreekt.

---

## Openstaand (vereist externe data of DB-toegang)

- **Zoekvolumes & prioritering:** welke NL-termen echt volume hebben, kan alleen
  met Google Keyword Planner / Trends / Ahrefs. Niet in te schatten zonder tool.
- **Exacte product-dekking:** een sluitende "welk seed-keyword werd wél/niet een
  product"-tabel vereist een uitlezing van alle 89 producten uit Supabase
  (`slug` vergelijken met `slugify(keyword)`). Losse vervolgtaak; hier
  bewust niet gegokt.
