-- Gebruiksduur en afdankfase per product (vrije tekst, door de admin beheerd).
-- Voorbeelden: lifespan '5-10 jaar', end_of_life 'Composteerbaar (GFT)'.
alter table products add column lifespan text;
alter table products add column end_of_life text;
