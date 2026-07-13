# Most Wanted Sustainable

Een publieke ranglijst van duurzame producten, gerangschikt op een **trendscore
die versnelling meet, niet volume** — een product dat hard stijgt verslaat een
product dat alleen maar groot is. Gebouwd door een niet-technische founder samen
met Claude Code.

- **Stack:** Next.js 14 (App Router, TypeScript, Tailwind) · Supabase (Postgres) · Vercel
- **Datastroom & ontwerpkeuzes:** zie [`docs/architecture.md`](docs/architecture.md)
- **Wijzigingen per fase:** zie [`CHANGELOG.md`](CHANGELOG.md)
- **Productvisie, regels en fasen:** zie [`CLAUDE.md`](CLAUDE.md)
- **Leidende specificaties:** de skills in [`.claude/skills/`](.claude/skills/)

## Aan de slag

```bash
npm install                 # dependencies installeren
cp .env.example .env.local  # daarna de sleutels invullen (zie hieronder)
npm run dev                 # site draaien op http://localhost:3000
```

### Omgevingsvariabelen (`.env.local`)

Alle sleutels staan met uitleg in [`.env.example`](.env.example). Nooit in de
code of in de chat plaatsen; `.env.local` staat in `.gitignore`.

| Variabele | Nodig vanaf | Waar vandaan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Fase 2 | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Fase 2 | Supabase → API (publishable/anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Fase 2 | Supabase → API (secret/service_role, geheim) |
| `YOUTUBE_API_KEY` | Fase 3 | Google Cloud Console → Credentials |
| `ADMIN_PASSWORD` | Fase 4 | zelf verzinnen |
| `CRON_SECRET` | Fase 3/5 | zelf verzinnen (lange willekeurige tekst) |

## Commando's

| Commando | Wat het doet |
|---|---|
| `npm run dev` | Ontwikkelserver met hot reload |
| `npm run build` | Productie-build (controleert ook alle types) |
| `npm test` | Alle tests (Vitest) |
| `npm run check-db` | Controleert de Supabase-verbinding en of alle tabellen bestaan |
| `npm run pipeline` | Testrun van de pipeline met 8 zoekwoorden |
| `npm run pipeline -- 25` | Testrun met 25 zoekwoorden |
| `npm run pipeline -- all` | Volledige run (alle zoekwoorden) |

De pipeline kan ook via de beveiligde API-route draaien (voor de cron):
`POST /api/pipeline/run` met header `Authorization: Bearer <CRON_SECRET>`.

## Database

Het schema staat als genummerde SQL-migraties in
[`supabase/migrations/`](supabase/migrations/) — dat is de bron van waarheid.
Wijzig het schema nooit los in het Supabase-dashboard; voeg altijd een nieuwe
migratie toe. Regels: zie de `db-conventions` skill.

## Tests

```bash
npm test
```

Gedekt: elke bron-adapter (parsing + geïsoleerde fout), de scoring
(groei-berekening + normalisatie) en het inlezen van de zoekwoorden. Elke
nieuwe adapter krijgt verplicht een test met een gemockte API-respons.

## Projectstatus

Zie de fasen-checklist in [`CLAUDE.md`](CLAUDE.md). Kort:

- [x] Fase 1 — skelet (homepage met testdata)
- [x] Fase 2 — Supabase gekoppeld, schema aangemaakt
- [~] Fase 3 — pipeline met 3 bronnen (code klaar; live test + YouTube-sleutel resteert)
- [ ] Fase 4 — detailpagina's, /methodologie, filters, nieuwsbrief, admin
- [ ] Fase 5 — live op Vercel met dagelijkse cron
