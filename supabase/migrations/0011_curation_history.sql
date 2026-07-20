-- Permanente, append-only curatiegeschiedenis: elke goedkeur/afwijs-beslissing
-- op een product wordt hier als NIEUWE rij vastgelegd (nooit overschreven).
-- Doel: als een product later opnieuw wordt overwogen (zelfde slug, bv. na
-- een nieuwe pipeline-run), kan de admin de volledige eerdere geschiedenis
-- zien vóórdat hij/zij goedkeurt. Losstaand van products.rejection_reason
-- (dat toont alleen de laatste reden; hier blijft alles bewaard).
create table curation_history (
  id           uuid primary key default gen_random_uuid(),
  product_slug text not null,
  product_name text not null,
  decision     text not null check (decision in ('approved', 'rejected')),
  reason       text,
  decided_at   timestamptz not null default now()
);

create index idx_curation_history_slug
  on curation_history (product_slug, decided_at desc);

alter table curation_history enable row level security;
-- Geen anon-policy: alleen bereikbaar via de service role (admin).
