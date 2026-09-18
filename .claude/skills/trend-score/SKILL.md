---
name: trend-score
description: Use when calculating, changing, or displaying the trend score, ranking products, normalizing signals, changing source weights, or editing the /methodologie page. Also use when adding a new data source (weights must be rebalanced).
---

# Trend Score

The score measures **acceleration, not volume**. A product climbing fast beats a product that is merely big. This principle is non-negotiable.

## Formula (current version: v4 — see lib/scoring/version.ts)

Only sources that actually produced a growth figure for that product count, and
their weights are rescaled to 100%:

```
score = Σ (weight_s * norm(growth_s))  /  Σ (weight_s)
        for every source s that HAS a growth figure for this product

weights: googleTrends 0.40 · youtube 0.25 · wikipedia 0.20 · gdeltNews 0.15
```

Weights live in `lib/scoring/version.ts` (the `WEIGHTS` map — only active
sources appear there, and they must sum to 1). History:
- v1: Google Trends 45 / Reddit 30 / YouTube 25 (Reddit never went live).
- v2: Reddit dropped (blocks anon + needs commercial approval); reweighted to
  Google Trends 65 / YouTube 35.
- v3: source diversification. Added Wikipedia and GDELT (both free, no key) so
  the score survives if Google Trends breaks. Reddit and eBay adapters exist
  but stay on standby (need keys).
- v4: dynamic reweighting. Weights unchanged; what changed is how a MISSING
  source is treated. Up to v3 it counted as 0% growth, as if we had measured
  that nothing happened. That silently capped the maximum score (with Wikipedia
  and GDELT quiet the ceiling was 65, not 100) and unfairly compared products
  that happened to have data from a sparse source against those that did not.
  From v4 a source only counts for a product when it actually produced a growth
  figure, and the remaining weights are rescaled to 100%.
  Shipped together with putting **Wikipedia on standby**: the adapter keeps
  running and its measurements are stored (building history), but it no longer
  counts towards the score. Its article matching picks the first search hit,
  which was wrong for 7 out of 10 sampled keywords ("solar power bank" matched a
  Moroccan power station; many others matched a generic article like "Shampoo"
  whose traffic has little to do with the product). Re-enable only after the
  matching is reliable. Remaining weights keep their original 40 : 25 : 15 ratio,
  rescaled to 100%.

The original v1 formula, for reference:

```
score = 0.45 * norm(googleTrendsGrowth)
      + 0.30 * norm(redditMentionsGrowth)
      + 0.25 * norm(youtubeViewsGrowth)
```

- **Growth** = week-over-week percentage change of the raw signal value: `(thisWeek - lastWeek) / max(lastWeek, 1)`.
- **norm()** = min-max normalization to 0–100, per source, across only the products that have a growth figure for that source on that snapshot day. Recompute per snapshot; never reuse old min/max.
- A product missing a source is **excluded from that component** and its weight is redistributed over the sources it does have (v4). Never treat a missing measurement as zero growth. The UI shows "insufficient data" for that source.
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
