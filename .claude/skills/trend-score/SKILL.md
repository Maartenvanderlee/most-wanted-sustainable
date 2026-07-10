---
name: trend-score
description: Use when calculating, changing, or displaying the trend score, ranking products, normalizing signals, changing source weights, or editing the /methodologie page. Also use when adding a new data source (weights must be rebalanced).
---

# Trend Score

The score measures **acceleration, not volume**. A product climbing fast beats a product that is merely big. This principle is non-negotiable.

## Formula (current version: v1)

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
