-- 0003_events.sql
-- Eenvoudige, privacy-vriendelijke gebeurtenissen voor de eigen statistieken:
-- paginabezoeken en link-kliks. Geen persoonsgegevens, geen IP-adressen.
-- Alleen de server (service role, via /api/track) schrijft en leest events.

create type event_type as enum ('page_view', 'click', 'outbound');

create table events (
  id          uuid primary key default gen_random_uuid(),
  type        event_type not null,
  path        text not null,        -- pagina waarop het gebeurde
  label       text,                 -- link-tekst of doel-URL (bij kliks)
  visitor_id  text,                 -- anoniem, willekeurig ID (voor unieke bezoekers)
  created_at  timestamptz not null default now()
);

create index idx_events_type_created on events (type, created_at);
create index idx_events_visitor on events (visitor_id);

alter table events enable row level security;
-- Bewust geen publiek beleid: events zijn alleen toegankelijk via de service
-- role op de server.
