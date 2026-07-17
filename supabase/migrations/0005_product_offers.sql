-- Verkoopkanalen per product: maximaal 3 winkels, elk met eigen (affiliate-)link.
-- Vervangt op termijn products.affiliate_url (blijft bestaan als fallback).
-- Volgt .claude/skills/db-conventions.

create table product_offers (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products (id) on delete cascade,
  position    integer not null check (position between 1 and 3),
  retailer    text not null,        -- winkelnaam, bv. "Bol" of "Amazon"
  url         text not null,        -- (affiliate-)link naar het product
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, position)
);

create index idx_product_offers_product on product_offers (product_id);

alter table product_offers enable row level security;

-- Publiek: links alleen lezen bij goedgekeurde producten.
create policy "public_read_offers_of_approved"
  on product_offers
  for select
  to anon
  using (
    exists (
      select 1 from products p
      where p.id = product_id and p.status = 'approved'
    )
  );

-- Schrijven kan alleen via de service role op de server (geen anon-policy).
