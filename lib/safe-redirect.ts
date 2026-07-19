// Beperkt redirect-doelen tot interne paden. Zonder deze check zou
// ?path=//evil.com (begint met "/", dus de naïeve check "startsWith('/')"
// laat 'm door) een open redirect zijn: browsers behandelen "//host" als
// protocol-relatieve URL naar een ander domein.
export function safeInternalPath(path: string | null, fallback = "/"): string {
  if (!path) return fallback;
  if (!path.startsWith("/")) return fallback;
  if (path.startsWith("//")) return fallback;
  if (path.includes("\\")) return fallback; // browsers normaliseren \ naar /
  return path;
}
