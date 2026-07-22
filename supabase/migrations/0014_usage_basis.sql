-- Waar "gemiddeld gebruik" (100% op de schuifregelaar) per product voor
-- staat, als korte tekst met bron. Voorbeeld: "2,9 wasbeurten per week
-- (gemiddeld Nederlands huishouden, Stichting HIER)". Admin-beheerd,
-- tweetalig; leeg = de kaart toont een generieke uitleg.
alter table products add column usage_basis text;
alter table products add column usage_basis_en text;
