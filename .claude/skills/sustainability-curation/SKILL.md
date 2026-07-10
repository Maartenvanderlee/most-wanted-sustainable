---
name: sustainability-curation
description: Use when adding products to the catalog, approving or rejecting products in the admin, assigning sustainability tags, writing product descriptions, or anything involving sustainability claims, certifications, or greenwashing checks.
---

# Sustainability Curation

Trust is the moat. One greenwashing incident costs more than any revenue it brings. When in doubt: reject.

## Three gates — a product must pass at least one of gates 1–2, and always gate 3

**Gate 1 — Certification.** Accepted labels (store as `sustainability_tags`):
`b-corp`, `fairtrade`, `gots`, `eu-ecolabel`, `fsc`, `cradle-to-cradle`, `oeko-tex`, `energy-star`, `rainforest-alliance`, `demeter`, `msc-asc`

**Gate 2 — Manual curation checklist** (no certificate, but demonstrably sustainable). Requires a YES on at least 3 of 5, recorded in the admin:
1. Made from recycled, renewable, or biodegradable materials?
2. Replaces a disposable/single-use product with a durable one?
3. Transparent supply chain published by the brand?
4. Repairable or refillable by design?
5. Brand's core business is sustainability (not a green side-line of a conventional brand)?

**Gate 3 — Exclusion list.** Automatic rejection regardless of score or certificates:
- Fast-fashion brands and their sub-brands
- Single-use gadgets and dropship gimmicks with green marketing
- Products whose primary claim has been publicly debunked (greenwashing rulings, e.g. by advertising standards bodies)
- Anything requiring the product page to make health claims we cannot verify

## Claims and copy rules (EU Green Claims aware)

- Never write absolute claims: not "duurzaam", but "voldoet aan onze criteria: [tags]"
- Every product page must show WHY it is listed (which gate, which tags)
- Never invent certifications; if unverifiable, leave the tag off
- Comparative claims ("greener than X") are forbidden

## Admin workflow

New products from the pipeline land in status `pending`. Only a human sets `approved`. The public site shows `approved` products only. Rejections store a reason so re-submissions are caught.
