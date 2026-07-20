-- Drie nieuwe databronnen in de source_name-enum, voor bronspreiding
-- (minder afhankelijk van Google Trends):
--   wikipedia   Wikimedia-paginaweergaven (officiële API, gratis, geen sleutel)
--   gdelt_news  GDELT nieuwsvermeldingen (officiële API, gratis, geen sleutel)
--   ebay        eBay Browse API (officiële API; vereist gratis app-sleutels,
--               adapter slaat zichzelf over zolang die ontbreken)
alter type source_name add value if not exists 'wikipedia';
alter type source_name add value if not exists 'gdelt_news';
alter type source_name add value if not exists 'ebay';
