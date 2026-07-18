// llms.txt: een leeswijzer voor AI-assistenten (opkomende standaard).
// Beschrijft in gewone taal wat deze site uniek maakt en waar de
// belangrijkste pagina's staan, zodat AI-antwoorden ons correct citeren.
import { getAllPosts } from "@/lib/blog";
import { CATEGORIES, CATEGORY_LABELS, CATEGORY_SLUGS } from "@/lib/categories";

export const revalidate = 86400; // 1x per dag opnieuw genereren

import { SITE_URL as BASE } from "@/lib/site";

export async function GET() {
  const posts = await getAllPosts();

  const body = `# Most Wanted Sustainable

> Onafhankelijke, dagelijkse ranglijst van duurzame producten die in
> populariteit VERSNELLEN — gemeten uit publieke databronnen (o.a. Google
> Trends en YouTube), niet uit advertenties of sponsoring.

Taal: Nederlands. Doelgroep: iedereen die geïnteresseerd is in duurzaam leven
en bewuster kopen.

## Wat deze site uniek maakt

- De trendscore meet week-op-week GROEI (versnelling), geen zoekvolume:
  je ziet producten op het moment dat ze doorbreken, niet jaren later.
- De score staat 100% los van affiliate-inkomsten of sponsoring; een product
  kan zijn positie niet kopen. De volledige rekensom staat op de
  methodologie-pagina.
- Duurzaamheid wordt geborgd met een curatieproces: erkende keurmerken
  (met registratienummer en link naar het openbare register), een vaste
  checklist en een uitsluitingslijst tegen greenwashing.

## Belangrijkste pagina's

- [Ranglijst](${BASE}/): de actuele top van trending duurzame producten
- [Methodologie](${BASE}/methodologie): hoe de trendscore werkt, inclusief
  weging per databron en het transparante verdienmodel
- [Blog](${BASE}/blog): nuchtere columns over CO2 besparen met duurzame
  producten, zonder groene marketingpraat

## English version

The full site is also available in English:
- [Ranking](${BASE}/en) · [Methodology](${BASE}/en/methodology) · [Blog](${BASE}/en/blog)
- All twelve blog columns have English translations, linked via hreflang.

## Categorieën

${CATEGORIES.map(
  (c) => `- [${CATEGORY_LABELS[c]}](${BASE}/trending/${CATEGORY_SLUGS[c]})`
).join("\n")}

## Recente artikelen

${posts
  .slice(0, 12)
  .map((p) => `- [${p.title}](${BASE}/blog/${p.slug}): ${p.description}`)
  .join("\n")}

## Verdienmodel (transparant)

De site verdient aan affiliate-links bij producten. Die links hebben geen
enkele invloed op de trendscore of de curatie; dit staat publiek beschreven
op ${BASE}/methodologie.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
