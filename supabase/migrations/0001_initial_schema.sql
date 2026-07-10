-- 0001_initial_schema.sql
-- Basisschema voor Most Wanted Sustainable.
-- Tabellen: products, signals, scores, newsletter_subscribers.
-- Volgt .claude/skills/db-conventions.

-- ---------- Enums ----------

-- Bronnen waaruit signalen komen (uitbreidbaar in latere migraties).
create type source_name as enum ('google_trends', 'reddit', 'youtube');

-- Levensfase van een product in de catalogus.
create type product_status as enum ('pending', 'approved', 'rejected');

-- ---------- Tabellen ----------

-- Producten in de catalogus.
create table products (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  slug                 text unique not null,
  category             text not null,            -- home | personal_care | fashion | tech | food
  image_url            text,
  affiliate_url        text,                      -- leeg tot een product gecureerd is
  sustainability_tags  text[] not null default '{}',
  status               product_status not null default 'pending',
  rejection_reason     text,
  created_at           timestamptz not null default now()
);

-- Ruwe meetwaarden per bron. Append-only: nooit updaten of verwijderen.
create table signals (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products (id) on delete cascade,
  source       source_name not null,
  value        numeric not null,                 -- ruwe waarde, nooit genormaliseerd
  measured_at  timestamptz not null
);

-- Berekende trendscores per dag. Append-only: historie is het waardevolste bezit.
create table scores (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references products (id) on delete cascade,
  score            numeric not null,             -- 0-100
  rank             integer not null,
  formula_version  text not null,                -- bv. 'v1'
  snapshot_date    date not null,
  unique (product_id, snapshot_date)
);

-- Nieuwsbrief-inschrijvingen.
create table newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  created_at  timestamptz not null default now()
);

-- ---------- Indexen ----------

create index idx_signals_product_source_measured
  on signals (product_id, source, measured_at);

create index idx_scores_snapshot_rank
  on scores (snapshot_date, rank);

create index idx_products_status_category
  on products (status, category);
