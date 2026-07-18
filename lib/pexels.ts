// Groene code: vraag bij het Pexels-CDN precies de fotomaat op die de plek
// nodig heeft, in plaats van overal de grootste variant te laden.
// Scheelt 50-80% aan dataverkeer (en dus energie) per paginaweergave.
export function pexelsSized(
  url: string,
  width: number,
  height: number
): string {
  try {
    const u = new URL(url);
    if (u.hostname !== "images.pexels.com") return url;
    u.searchParams.set("auto", "compress");
    u.searchParams.set("cs", "tinysrgb");
    u.searchParams.set("w", String(width));
    u.searchParams.set("h", String(height));
    u.searchParams.set("dpr", "1");
    return u.toString();
  } catch {
    return url; // geen geldige URL: laat ongemoeid
  }
}
