---
name: trend-score
description: Use when calculating, changing, or displaying the trend score, ranking products, normalizing signals, changing source weights, or editing the /methodologie page. Also use when adding a new data source (weights must be rebalanced).
---

# Trend Score

The score measures **acceleration, not volume**. A product climbing fast beats a product that is merely big. This principle is non-negotiable.

## Formula (current version: v3 — see lib/scoring/version.ts)

```
score = 0.40 * norm(googleTrendsGrowth)
      + 0.25 * norm(youtubeViewsGrowth)
      + 0.20 * norm(wikipediaPageviewsGrowth)
      + 0.15 * norm(gdeltNewsVolumeGrowth)
```

Weights live in `lib/scoring/version.ts` (the `WEIGHTS` map — only active
sources appear there, and they must sum to 1). History:
- v1: Google Trends 45 / Reddit 30 / YouTube 25 (Reddit never went live).
- v2: Reddit dropped (blocks anon + needs commercial approval); reweighted to
  Google Trends 65 / YouTube 35.
- v3: source diversification. Added Wikipedia and GDELT (both free, no key) so
  the score survives if Google Trends breaks. Reddit and eBay adapters exist
  but stay on standby (need keys) until v4 adds them to the weights.

The original v1 formula, for reference:

```
score = 0.45 * norm(googleTrendsGrowth)
      + 0.30 * norm(redditMentionsGrowth)
      + 0.25 * norm(youtubeViewsGrowth)
```

- **Growth** = week-over-week percentage change of the raw signal value: `(thisWeek - lastWeek) / max(lastWeek, 1)`.
- **norm()** = min-max normalization to 0–100 across the full product set for that snapshot day. Recompute per snapshot; never reuse old min/max.
- A product missing a source gets 0 for that component (it is not excluded), and the UI shows "insufficient data" for that source.
- New products need at least 2 weeks of signals before they receive a score.

## Snapshots and ranking

- The pipeline writes one row per product per day to `scores` (score, rank, snapshot_date).
- Rank change (▲▼) compares today's rank with 7 days ago.
- Historical snapshots are append-only. Never update or delete old score rows — the history is the product's most valuable asset.

## Changing the formula

Any change to weights, sources, or normalization requires ALL of the following in the same change:

1. Bump the version (v1 → v2) in `src/lib/scoring/version.ts`
2. Update the public `/methodologie` page in plain, non-technical Dutch — transparency is a brand value
3. Store the version with every score row so history remains interpretable
4. Note the change in CHANGELOG.md

## Anti-patterns (do not do)

- Ranking by absolute values (views, sales rank) instead of growth
- Letting one source dominate because its raw numbers are bigger — that is what normalization prevents
- Recomputing history with a new formula (history stays as measured)
- Any scoring influence from affiliate commissions or sponsorships — the score is 100% independent, always
