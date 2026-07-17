-- Bewijs per keurmerk per product: registratienummer in een openbaar register
-- en/of een link waarmee de claim te controleren is.
-- Welke keurmerken een product heeft blijft in products.sustainability_tags;
-- deze tabel legt de onderbouwing vast (poort 1 van de curatie herleidbaar maken).
-- Volgt .claude/skills/db-conventions.

create table product_certifications (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references products (id) on delete cascade,
  certification       text not null,        -- slug, bv. 'fsc' of 'b-corp'
  registration_number text,                 -- nummer in het openbare register
  evidence_url        text,                 -- link naar registervermelding of certificaat
  notes               text,                 -- vrije toelichting voor de admin
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (product_id, certification)
);

create index idx_product_certifications_product
  on product_certifications (product_id);

alter table product_certifications enable row level security;

-- Publiek: bewijs alleen lezen bij goedgekeurde producten (zelfde grens als products).
create policy "public_read_certifications_of_approved"
  on product_certifications
  for select
  to anon
  using (
    exists (
      select 1 from products p
      where p.id = product_id and p.status = 'approved'
    )
  );

-- Schrijven kan alleen via de service role op de server (geen anon-policy).
