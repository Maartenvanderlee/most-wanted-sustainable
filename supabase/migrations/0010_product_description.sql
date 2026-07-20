-- Redactionele productinformatie, tweetalig (nl/en), door de admin beheerd:
--   description        korte beschrijving van het product en de toepassing
--   why_sustainable    waarom dit duurzamer is dan het gangbare alternatief
--   co2_note           indicatieve CO2-besparing t.o.v. dat alternatief
--                      (bandbreedtes, incl. productie en transport; op de
--                      site altijd getoond mét disclaimer "indicatieve
--                      schatting" — geen gecertificeerde meting)
alter table products add column description        text;
alter table products add column description_en     text;
alter table products add column why_sustainable    text;
alter table products add column why_sustainable_en text;
alter table products add column co2_note           text;
alter table products add column co2_note_en        text;
