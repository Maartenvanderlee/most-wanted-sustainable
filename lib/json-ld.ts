// Veilige serialisatie voor <script type="application/ld+json">-blokken.
// JSON.stringify escapet géén "<", dus een productnaam die ooit "</script>"
// bevat zou anders uit het script-element kunnen breken en willekeurige HTML
// injecteren. We escapen "<" naar het Unicode-escape <, wat voor JSON-
// parsers volledig gelijkwaardig is aan het gewone teken.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
