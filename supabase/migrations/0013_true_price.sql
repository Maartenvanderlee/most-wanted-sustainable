-- Numerieke CO2- en besparingscijfers per product (true pricing), naast de
-- bestaande vrije-tekst co2_note. Zelfde regels als co2_note: indicatieve
-- schatting door de admin, t.o.v. het gangbare alternatief, nooit een
-- gecertificeerde meting. Voeden de "wat dit je oplevert"-kaart op de
-- productpagina.
alter table products add column co2_kg_per_year numeric;
alter table products add column annual_saving_eur numeric;
