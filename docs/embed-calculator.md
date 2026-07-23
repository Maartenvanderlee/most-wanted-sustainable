# CO₂-waardecalculator — insluiten (embed)

Een zelfstandige, insluitbare rekentool die een hoeveelheid vermeden CO₂ vertaalt
naar de verborgen maatschappelijke waarde (€) en tastbare vergelijkingen
(autokilometers, CO₂-opname van een boom). Bedoeld voor derden — gemeenten,
energiecoöperaties, woningcorporaties, energieadviesdiensten — om op hun eigen
site te plaatsen.

De rekenmethode en bronvermelding (CE Delft, CBS, Staatsbosbeheer) blijven altijd
zichtbaar; whitelabel betekent *jouw merknaam en kleur*, niet het verbergen van
de onderbouwing.

## Snelste manier: plak deze iframe

```html
<iframe
  src="https://www.risegoods.nl/embed/calculator"
  style="width:100%;max-width:640px;height:440px;border:0"
  title="CO2-waardecalculator"
  loading="lazy"
></iframe>
```

Meer niet. De widget werkt op elk domein (framing is bewust alleen voor de
`/embed`-route toegestaan; de rest van de site blijft tegen clickjacking
beschermd).

## Whitelabel — parameters

Voeg parameters toe aan de `src`-URL:

| Parameter | Wat | Voorbeeld | Standaard |
|---|---|---|---|
| `brand` | Eigen titel/merknaam bovenaan | `brand=Gemeente%20Delft` | "Wat is je CO₂-winst waard?" |
| `accent` | Accentkleur (hex, ge-encode `#` als `%23`) | `accent=%230E7C4A` | `#0E7C4A` |
| `locale` | Taal: `nl` of `en` | `locale=en` | `nl` |
| `kg` | Beginwaarde CO₂ (kg/jaar) | `kg=120` | `24` |
| `label` | Wat de besparing veroorzaakt | `label=deze%20maatregel` | — |
| `powered` | `0` verbergt de "door Risegoods"-regel | `powered=0` | zichtbaar |

Voorbeeld met alles:

```html
<iframe
  src="https://www.risegoods.nl/embed/calculator?brand=Gemeente%20Delft&accent=%230E7C4A&locale=nl&kg=120&label=je%20isolatiemaatregel"
  style="width:100%;max-width:640px;height:440px;border:0"
  title="CO2-waardecalculator" loading="lazy"></iframe>
```

## Optioneel: automatisch meeschalende hoogte

De widget stuurt zijn hoogte naar de insluitende pagina. Wil je dat de iframe
automatisch meegroeit (in plaats van een vaste hoogte), voeg dan dit toe:

```html
<script>
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "risegoods-embed-height") {
      var f = document.querySelector('iframe[src*="risegoods.nl/embed"]');
      if (f) f.style.height = e.data.height + "px";
    }
  });
</script>
```

## Voor onszelf: waar het zit

- Route: `app/embed/calculator/` (server-pagina + client-component).
- Rekenlogica en bronnen: `lib/true-price.ts` (gedeeld met de productpagina).
- Framebaar gemaakt in `next.config.mjs` — alleen `/embed`, met
  `Content-Security-Policy: frame-ancestors *`; de rest houdt `X-Frame-Options:
  DENY`.
- Niet indexeerbaar (`robots: noindex`) en uitgesloten van de eigen analytics.
