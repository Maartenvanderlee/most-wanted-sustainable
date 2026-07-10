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

## Current sources (MVP)

- `google_trends`: interest-over-time per keyword, weekly values (unofficial API — expect breakage, degrade gracefully)
- `reddit`: public JSON API, subreddits BuyItForLife, ZeroWaste, sustainability, Anticonsumption; count keyword mentions in top posts (last 7 days)
- `youtube`: YouTube Data API v3, sum of views on videos from the last 30 days per keyword; watch daily quota (10k units)

## Adding a source later (eBay, Amazon, Bol, TikTok)

Copy `template.ts`, implement `fetchSignals`, register the adapter, add env vars to `.env.example`, write the mock test, then update the weights in the trend-score skill and the /methodologie page.
