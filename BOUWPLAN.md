# Bouwplan — plak deze opdrachten één voor één in Claude Code

Wacht steeds tot een opdracht helemaal af is en je het resultaat hebt bekeken voordat je de volgende plakt.

## Opdracht 1 — Het skelet

> Bouw de basis van "Most Wanted Sustainable" met Next.js 14 (App Router, TypeScript, Tailwind). Maak een homepage met een voorbeeldlijst van 10 duurzame producten (verzonnen testdata is prima) met rang, naam, categorie-badge, duurzaamheids-tags en een trendscore. Clean design, veel wit, groene accenten, geschikt voor mobiel. Laat me daarna zien hoe ik de site kan bekijken. Vink fase 1 af in CLAUDE.md als het werkt.

## Opdracht 2 — De database

> Verbind het project met Supabase volgens de db-conventions skill. Maak de migraties voor alle tabellen. Ik heb een Supabase-account maar heb daar nog niets ingesteld — geef me stap voor stap klikinstructies voor wat ik op de Supabase-website moet doen, en vertel me precies welke sleutels ik moet kopiëren en waar ik ze plak. Vink fase 2 af als het werkt.

## Opdracht 3 — De data-pipeline

> Bouw de pipeline volgens de source-adapter en trend-score skills met drie bronnen: Google Trends, de publieke Reddit JSON API en de YouTube Data API. Gebruik de keywords uit data/seed-keywords.md en zorg dat producten uit de pipeline op status "pending" komen. Voor YouTube heb ik een Google Cloud-account maar nog geen API-sleutel — geef me klikinstructies om die aan te maken. Maak een commando of knop waarmee ik de pipeline handmatig kan draaien om te testen. Vink fase 3 af als het werkt.

## Opdracht 4 — De rest van de MVP

> Maak af volgens de skills: (1) productdetailpagina met score-opbouw per bron en een 30-dagen-grafiekje, (2) de pagina /methodologie in gewone taal, (3) filters op categorie en tag, (4) nieuwsbrief-aanmelding die e-mails in Supabase opslaat, (5) admin-pagina op /admin met wachtwoord (via environment variable) waar ik producten kan goedkeuren/afwijzen volgens de sustainability-curation skill, tags kan aanpassen en affiliate-links kan toevoegen. Werk de README bij. Vink fase 4 af als het werkt.

## Opdracht 5 — Online zetten

> Ik wil de site online zetten met Vercel. Ik heb een Vercel-account (gekoppeld aan GitHub) en een GitHub-account, maar heb beide nog nooit gebruikt. Zet het project op GitHub en geef me daarna klikinstructies om het via Vercel online te zetten, inclusief waar ik mijn environment variables invul. Stel de dagelijkse cron in zodat de pipeline elke dag draait. Vink fase 5 af als de site live is.
