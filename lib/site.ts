// Eén centrale plek voor het publieke site-adres.
// Valt terug op het live Vercel-adres als NEXT_PUBLIC_SITE_URL leeg is,
// zodat sitemap, metadata en llms.txt nooit een lege of localhost-URL tonen.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://most-wanted-sustainable.vercel.app";
