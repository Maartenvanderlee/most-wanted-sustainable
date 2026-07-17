// Zoekt automatisch een productfoto via de Pexels API (gratis, commercieel
// gebruik toegestaan zonder naamsvermelding). Vereist PEXELS_API_KEY.
// De foto's zijn stockfoto's op zoekwoord — passend omdat onze producten
// generieke producttermen zijn, geen specifieke merkproducten.
import "server-only";

const API = "https://api.pexels.com/v1/search";

export function hasPexelsKey(): boolean {
  return Boolean(process.env.PEXELS_API_KEY);
}

// Beste foto voor een zoekwoord, of null als er niets gevonden is.
// large2x is ~1880px breed: scherp genoeg voor de uitgelichte kaart.
export async function findImageFor(keyword: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;

  const url =
    `${API}?query=${encodeURIComponent(keyword)}` +
    `&per_page=1&orientation=landscape`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    photos?: { src?: { large2x?: string; large?: string } }[];
  };
  const src = data.photos?.[0]?.src;
  return src?.large2x ?? src?.large ?? null;
}
