# Most Wanted Sustainable — startpakket

Dit is de voorbereide projectmap voor het bouwen van Most Wanted Sustainable met Claude Code. Er zit nog geen code in — wel alles wat Claude Code nodig heeft om consistent en goed te bouwen.

## Wat zit erin

- `CLAUDE.md` — projectcontext die Claude Code bij elke sessie automatisch leest (inclusief de afspraak dat alles in gewone taal wordt uitgelegd)
- `.claude/skills/` — vijf instructiekaarten (skills) die Claude Code automatisch gebruikt: databron-adapters, de trendscore, duurzaamheidscuratie, databaseregels en SEO-pagina's
- `BOUWPLAN.md` — de vijf bouwopdrachten, klaar om één voor één te plakken
- `data/seed-keywords.md` — 100 duurzame product-zoektermen als startpunt voor de pipeline
- `.env.example` — overzicht van de geheime sleutels die je gaandeweg gaat invullen

## Eerste stappen

1. Installeer de Claude Desktop-app via claude.com/download en log in (betaald plan vereist voor het Code-tabblad)
2. Zet deze map ergens vast op je computer, bijvoorbeeld in Documenten
3. Open in de Claude-app het tabblad **Code**, kies **Local** en selecteer deze map
4. Typ als eerste bericht: "Lees CLAUDE.md en BOUWPLAN.md en vertel me in gewone taal of alles klaarstaat om met opdracht 1 te beginnen."
5. Volg daarna BOUWPLAN.md, opdracht voor opdracht

## Onthoud

- Eén verbetering per opdracht
- Bij twijfel: "leg uit wat dit doet" vóór je goedkeurt
- Na elke werkende feature: "maak een git-herstelpunt"
- Geheime sleutels horen in `.env.local`, nooit in de chat of online
