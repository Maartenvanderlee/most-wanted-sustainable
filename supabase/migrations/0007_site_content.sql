-- Bewerkbare siteteksten (CMS in de admin).
-- published = wat bezoekers zien; draft = concept dat alleen in previewmodus
-- zichtbaar is. Ontbrekende sleutels vallen terug op de standaardtekst in de code.
create table site_content (
  key         text primary key,
  published   text,
  draft       text,
  updated_at  timestamptz not null default now()
);

alter table site_content enable row level security;
-- Geen anon-policy: alleen de server (service role) leest en schrijft.
