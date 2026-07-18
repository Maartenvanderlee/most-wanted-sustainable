-- Prijs per verkoopkanaal (in euro's), door de admin bijgehouden.
-- De site toont hieruit een prijsindicatie (min-max) bij de productfoto's.
alter table product_offers add column price numeric;
