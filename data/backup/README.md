# Data-backup — duurzame kopie van de historie

Deze map is de **versiebeheerde backup** van de belangrijkste tabellen, buiten
Supabase. Elke wekelijkse GitHub Action (`.github/workflows/archive.yml`)
overschrijft deze bestanden met een verse export en commit ze; de **git-historie
van deze map is daarmee de tijdreeks-backup** — ook als de gratis Supabase-tier
ooit pauzeert of data verliest.

## Wat zit erin

`products`, `signals`, `scores`, `curation_history`, `product_certifications`,
`product_offers` — als JSON, één bestand per tabel, plus `_summary.json` met
rij-aantallen en exportdatum.

**Bewust NIET hierin:** `newsletter_subscribers`. Dat zijn persoonsgegevens en
horen niet in de git-historie (niet te wissen bij een AVG-verzoek). Die tabel
zit alleen in de lokale export (`npm run archive` → `data/archive/<datum>/`).

## Zelf een backup draaien (lokaal)

```
npm run archive
```

Schrijft naar `data/archive/<datum>/` (blijft lokaal, gitignored, mét subscribers).

## Herstellen uit deze backup

De bestanden zijn platte JSON-arrays van rijen. Terugzetten in een lege of
nieuwe Supabase-database kan met de service-role-key via een klein import-script
(spiegelbeeld van `export-archive.mjs`: lees elk `*.json` en `insert` de rijen in
de gelijknamige tabel). Draai de migraties uit `supabase/migrations/` eerst,
zodat de tabellen bestaan.

Een oudere stand terughalen: `git log data/backup/signals.json` toont elke
wekelijkse versie; `git show <commit>:data/backup/signals.json` geeft die kopie.
