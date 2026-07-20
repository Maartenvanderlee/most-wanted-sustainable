---
name: source-adapter
description: Use when building or modifying a data source adapter for the trend pipeline (Google Trends, Reddit, YouTube, eBay, Amazon, Bol, TikTok), when adding a new signal source, or when changing how signals are fetched, cached, or rate-limited.
---

# Source Adapter

Every data source is an isolated adapter. The pipeline must never depend on the internals of any single source.

## Interface (mandatory)

Every adapter implements exactly this contract (see `template.ts` in this folder):

```typescript
export interface Signal {
  keyword: string;        // matches an entry in data/seed-keywords
  source: SourceName;     // 'google_trends' | 'reddit' | 'youtube' | ...
  value: number;          // raw metric for this measurement
  measuredAt: string;     // ISO timestamp
}

export interface SourceAdapter {
  name: SourceName;
  fetchSignals(keywords: string[]): Promise<Signal[]>;
}
```

## Rules

1. **One adapter, one file** in `src/lib/adapters/<source>.ts`. Register it in `src/lib/adapters/index.ts`.
2. **Failure isolation.** A failing adapter returns an empty array and logs the error. It must NEVER throw out of `fetchSignals` and NEVER crash the pipeline. Wrap all external calls in try/catch.
3. **Rate limits.** Respect per-source limits; add a small delay between batched requests (default 1000ms). Batch keywords where the API allows it. Never retry more than twice, with exponential backoff.
4. **Caching.** Raw responses are cached for 12h (Supabase table `raw_cache` or filesystem in dev) so re-runs during development don't burn quota.
5. **No secrets in code.** API keys come from environment variables only; add every new variable to `.env.example` with a comment.
6. **Store raw, compute later.** Adapters store raw signal values. Normalization and scoring happen in the scoring step (see trend-score skill), never inside an adapter.
7. **Every new adapter gets a test** with a mocked API response in `src/lib/adapters/__tests__/`.

## Current sources

Active (weigh into the score, see `lib/scoring/version.ts`):
- `google_trends`: interest-over-time per keyword (unofficial API — expect breakage, degrade gracefully). Cookie-primed to dodge 429s. Best-effort.
- `youtube`: YouTube Data API v3, sum of views on videos from the last 30 days per keyword; watch daily quota (10k units). Needs `YOUTUBE_API_KEY`.
- `wikipedia`: Wikimedia APIs (no key). Search → best-matching article title → sum of last-30-days page views. A keyword with no matching article simply has no signal (scores 0 for that component).
- `gdelt_news`: GDELT Doc 2.0 API (no key), `mode=timelinevol`, sum of the week's news-volume intensity. **Hard rate limit: 1 request / 5 seconds** — the adapter runs strictly serial with a 5.5s spacing AND an internal time budget (~180s), then returns what it has. Best-effort, like Google Trends.

Standby (adapter exists, self-skips until keys/access are configured — not in the weights yet):
- `reddit`: app-only OAuth; needs `REDDIT_CLIENT_ID`/`REDDIT_CLIENT_SECRET`. Deferred (Reddit's Responsible Builder Policy).
- `ebay`: eBay Browse API, active-listing count as a commerce signal; needs `EBAY_CLIENT_ID`/`EBAY_CLIENT_SECRET` (free developer keyset). Marketplace EBAY_NL.

## Adding a source later (Amazon, Bol, TikTok, …)

Copy `template.ts`, implement `fetchSignals`, register the adapter in `index.ts`, add env vars to `.env.example`, write the mock test, add the new enum value in a migration + `SourceName` in `lib/supabase/types.ts`, add a `sourceLabel` + measurement-format string in `lib/i18n.ts`, then update the weights in `lib/scoring/version.ts` (bump the version), the trend-score skill and the /methodologie page (nl+en).

Note: the pipeline stores signals **per source in a separate insert** (`lib/pipeline/run.ts`), so a source whose enum value isn't in the DB yet (deploy-before-migration) only loses its own rows — the others still save.
