// Eén centrale plek voor het publieke site-adres.
// Valt terug op het live domein als NEXT_PUBLIC_SITE_URL leeg is,
// zodat sitemap, metadata en llms.txt nooit een lege of localhost-URL tonen.
// www is de hoofdversie: risegoods.nl verwijst door naar www.risegoods.nl.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.risegoods.nl";
