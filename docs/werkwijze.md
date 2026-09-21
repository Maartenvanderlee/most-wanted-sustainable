# Werkwijze — vijf werkstromen, drie ritmes, één lijst

> **Let op — hoofdstuk 2 is achterhaald.** Het dagelijkse ritme hieronder (bord
> lezen, item kiezen) bleek het verkeerde ontwerp: het vraagt je elke ochtend om
> te kiezen, en dat kiezen ís de versplintering. Het is vervangen door de
> 10-minutenversie in `docs/eerste-tien-gesprekken.md`: één contact per werkdag,
> al het technische werk gebatcht naar één blok per week.
>
> Wat hier wél geldig blijft: **hoofdstuk 1** (de vijf werkstromen, geordend naar
> wie mag beslissen), **hoofdstuk 3** (de twee regels die je aandacht beschermen)
> en **hoofdstuk 4** (wat skills, subagents en geplande taken echt kunnen). De
> waakhond uit hoofdstuk 2 blijft ook overeind, maar zwijgend: hij draait en
> meldt zich alleen als er iets stuk is.

> De bedoeling van dit document: je hoeft niet meer te onthouden wat er nog moet,
> en je hoeft niet elk obstakel dat we tegenkomen op te lossen op het moment dat
> het opduikt. Dat is wat het versplinterd maakt. De regels hieronder staan hier
> zodat Claude ze handhaaft in plaats van jij.
>
> Het bord staat in `docs/werklijst.md`. Dit document verandert bijna nooit; het
> bord verandert dagelijks.

---

## 1. De vijf werkstromen

Ze zijn niet gescheiden op onderwerp maar op **wie er iets mag beslissen**. Dat
is de enige scheiding die telt, want dat bepaalt of iets aan een agent kan.

| Code | Werkstroom | Wat erin zit | Wie beslist | Delegeerbaar? |
|------|-----------|--------------|-------------|---------------|
| **W** | **Waken** | Draait de pipeline? Is de backup gelukt? Zijn de cijfers geloofwaardig? | niemand — feiten, geen keuzes | **volledig**, en op schema |
| **B** | **Bouwen** | features, code, tests, migraties | jij keurt goed | ja, met review |
| **I** | **Inhoud & curatie** | producten, beschrijvingen, keurmerken, claims | **alleen jij** | agent bereidt voor, jij beslist |
| **M** | **Marketing & verkeer** | SEO, blog, backlinks, nieuwsbrief | jij bij alles wat naar buiten gaat | grotendeels |
| **C** | **Commercie** | Amazon, B2B-verkoop, facturen, accounts | **alleen jij** | nee — alleen materiaal voorbereiden |

**Waarom W bovenaan staat.** Dit is de werkstroom die tot nu toe geen eigenaar
had, en dat heeft drie keer geld of geloofwaardigheid gekost (zie
`docs/werklijst.md`, sectie "Wat er stil kapot was"). Het is ook de enige
werkstroom die een machine beter doet dan een mens: het is elke dag hetzelfde
lijstje en het is geen greintje creatief.

**Waarom I en C niet delegeerbaar zijn.** Je hele activum is dat de score en de
duurzaamheidsclaim te vertrouwen zijn (`docs/strategie.md`, hoofdstuk 1). Een
agent die zelfstandig een product goedkeurt of een CO2-cijfer verzint, zet
precies dat op het spel. En bij C gaat het om jouw naam, jouw belastingnummer en
jouw geld. Een agent mag daar materiaal voor maken, nooit handelen.

---

## 2. De drie ritmes

### Elke ochtend, automatisch (werkstroom W) — 0 minuten van jou

Een geplande waakhond draait het vaste rondje en schrijft één blok bovenaan
`docs/werklijst.md`:

- draaide de pipeline vannacht, met hoeveel producten en welke bronnen?
- is de wekelijkse backup gelukt?
- staan alle databasetabellen er nog (`scripts/check-db.mjs`)?
- bezoekers, kliks en inschrijvingen van gisteren
- is de CI groen?

Alles wat goed is, krijgt één regel met een ✓. Alleen een ✗ vraagt je aandacht.
**Als er geen ✗ staat, hoef je niets te doen en niets te lezen.**

### Elke dag, jij — 15 tot 30 minuten

1. Kijk of er een ✗ staat. Zo ja: dat is je taak van vandaag, klaar met kiezen.
2. Zo nee: pak **één** item van het bord. Eén. Niet twee.
3. Aan het eind: Claude werkt het bord bij en maakt een git-herstelpunt.

**WIP-regel: maximaal één lopend item per werkstroom, en maximaal twee
werkstromen tegelijk open.** Alles daarboven is de versplintering die je nu
voelt. Het bord weigert meer.

### Elke maandag, jij + Claude — 30 minuten

`/weekstart`: bord opschonen, per werkstroom het volgende item kiezen, en één
commerciële actie voor de week vastleggen (werkstroom C verdwijnt anders altijd
onder het technische werk, omdat technisch werk zichtbaarder voelt).

### Elke maand

Het Risegoods Index-rapport genereren en één B2B-gesprek voeren
(`docs/strategie.md`, trede 1). Dit is de enige werkstroom die echt geld
oplevert; hij hoort daarom in het ritme en niet op een wenslijst.

---

## 3. De twee regels die de aandacht beschermen

### Regel 1 — Obstakels gaan op de lijst, niet in de taak

> Duikt er tijdens een taak een probleem op dat **vandaag het resultaat niet
> blokkeert**, dan noemt Claude het, zet het op `docs/werklijst.md`, en gaat
> verder met de oorspronkelijke taak. Het wordt nú niet opgelost.

Claude handhaaft dit. Jij mag de regel doorbreken, maar dan expliciet
("laten we dit nu wel uitzoeken"). Dit is de belangrijkste regel van dit
document: hij zet de rem waar jij die zelf niet kunt vasthouden.

### Regel 2 — Eén resultaat per sessie, in gewone taal

Elke sessie eindigt met één zin die begint met "Nu kan..." of "Nu weet...". Geen
opsomming van wat er technisch is veranderd. Kan die zin niet geschreven worden,
dan was het een verkenning en hoort het resultaat op het bord te staan als
"onderzocht: X, conclusie Y".

---

## 4. Wat waar in techniek landt

Vier verschillende dingen, en ze worden makkelijk verward. Wat elk écht kan:

| Middel | Wat het is | Waar het hier voor dient |
|--------|-----------|--------------------------|
| **Skills** (`.claude/skills/`) | regels die Claude automatisch inleest bij een passend onderwerp | de *kwaliteitseisen*: hoe een adapter, score, curatie, migratie of SEO-pagina hoort. Je hebt er vijf. Er komt één bij: deze werkwijze. |
| **Slash-commands** (`.claude/commands/`) | een vast prompt dat je met één woord start | de *ritmes*: `/dagstart`, `/weekstart`. Grootste winst voor de minste moeite. |
| **Subagents** (`.claude/agents/`) | een aparte agent met eigen opdracht en eigen gereedschap | *begrensde klussen met een controleerbaar resultaat*: waakhond, SEO-redacteur, curatievoorbereider. |
| **Geplande taken** | draaien zonder dat jij een sessie opent | de ochtendwaakhond, en later het maandrapport. |

Twee waarschuwingen, eerlijk bedoeld:

- **Een subagent begint koud.** Hij kent dit gesprek niet en moet alles
  opnieuw uitzoeken. Dat is prima voor "controleer X en rapporteer", en slecht
  voor "bedenk wat we nu moeten doen". Meer agents lossen versplintering niet
  op — het ritme doet dat. De agents doen daarna het werk.
- **Geen agent publiceert, keurt goed of doet een duurzaamheidsclaim.** Een
  agent mag voorstellen; publiceren is altijd jouw klik. Daarom staat I en C in
  de tabel van hoofdstuk 1 zoals het er staat.

### Wat een agent mag zonder te vragen

Alleen als het aan alle vier voldoet: **geen geld**, **niets naar buiten**,
**geen duurzaamheidsclaim**, en **omkeerbaar via git**. Valt iets daarbuiten,
dan komt er een voorstel en wacht de agent op jouw ja.

---

## 5. De bouwvolgorde

1. `docs/werklijst.md` + deze werkwijze als skill + `/dagstart`
2. Waakhond als subagent + geplande ochtendrun (dan stopt het stille kapotgaan)
3. `/weekstart`
4. Redacteur- en curatievoorbereider-agent voor werkstroom M en I

Niet alles tegelijk. Stap 1 en 2 halen de meeste onrust weg.
