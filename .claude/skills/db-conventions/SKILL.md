---
name: db-conventions
description: Use when creating or changing database tables, columns, migrations, Supabase configuration, indexes, or queries — anything touching the Postgres schema or data model.
---

# Database Conventions (Supabase / Postgres)

## Naming

- Tables and columns: English, `snake_case`, tables plural (`products`, not `product`)
- Primary keys: `id` (uuid, default `gen_random_uuid()`)
- Timestamps: `created_at` (default `now()`), `updated_at` where mutation happens
- Enums as Postgres enums: `source_name`, `product_status`

## Core schema

Current as of migration `0010_product_description.sql`. Every table below is
real — re-derived from `supabase/migrations/` on 2026-07-19; if you add a
migration, update this block in the same change.

```sql
products (
  id uuid PK,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,            -- home | personal_care | fashion | tech | food
  image_url text,
  affiliate_url text,                -- legacy single link; product_offers is now primary
  sustainability_tags text[] DEFAULT '{}',
  status product_status DEFAULT 'pending',  -- pending | approved | rejected
  rejection_reason text,
  lifespan text,                     -- free text, e.g. "5-10 jaar"          (0008)
  end_of_life text,                  -- free text, e.g. "Composteerbaar (GFT)" (0008)
  description text,                  -- editorial: what it is + use case (nl) (0010)
  description_en text,                -- same, English                        (0010)
  why_sustainable text,               -- vs. the conventional alternative (nl) (0010)
  why_sustainable_en text,             -- same, English                        (0010)
  co2_note text,                      -- indicative CO2 saving, range only (nl)(0010)
  co2_note_en text,                    -- same, English                        (0010)
  created_at timestamptz DEFAULT now()
)
-- description*/why_sustainable*/co2_note* are editorial (admin-filled),
-- always rendered with an "indicative estimate" disclaimer — never a
-- certified measurement. See sustainability-curation skill for claims rules.

signals (
  id uuid PK,
  product_id uuid REFERENCES products,
  source source_name NOT NULL,       -- google_trends | youtube | reddit
  value numeric NOT NULL,            -- raw value, never normalized
  measured_at timestamptz NOT NULL
)

scores (
  id uuid PK,
  product_id uuid REFERENCES products,
  score numeric NOT NULL,            -- 0-100
  rank integer NOT NULL,
  formula_version text NOT NULL,     -- e.g. 'v1'
  snapshot_date date NOT NULL,
  UNIQUE (product_id, snapshot_date)
)

newsletter_subscribers (
  id uuid PK,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
)

events (                             -- anonymous page_view/click/outbound (0003)
  id uuid PK,
  type event_type NOT NULL,          -- page_view | click | outbound
  path text NOT NULL,
  label text,
  visitor_id text,                   -- anonymous client-generated id, no PII
  created_at timestamptz DEFAULT now()
)

product_certifications (             -- verifiable evidence per label (0004)
  id uuid PK,
  product_id uuid REFERENCES products ON DELETE CASCADE,
  certification text NOT NULL,       -- slug, e.g. 'fsc' or 'b-corp'
  registration_number text,          -- number in the certifier's public register
  evidence_url text,                 -- link to that register entry
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (product_id, certification)
)

product_offers (                     -- up to 3 retailers per product (0005, 0006)
  id uuid PK,
  product_id uuid REFERENCES products ON DELETE CASCADE,
  position integer NOT NULL CHECK (position BETWEEN 1 AND 3),
  retailer text NOT NULL,            -- e.g. "Bol", "Amazon"
  url text NOT NULL,                 -- affiliate link
  price numeric,                     -- optional; feeds the price-range badge
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (product_id, position)
)

site_content (                       -- CMS: draft/published site copy (0007)
  key text PK,                       -- e.g. 'home.hero.title', 'en.trending.food.intro'
  published text,                    -- what visitors see
  draft text,                        -- only visible in Draft Mode preview
  updated_at timestamptz DEFAULT now()
)
-- No anon policy — server-only (service role). Empty/missing key falls back
-- to the hardcoded default in lib/content.ts, so the site works with zero rows.

admin_login_attempts (                -- brute-force throttle (0009)
  id uuid PK,
  ip text NOT NULL,
  created_at timestamptz DEFAULT now()
)
```

## Rules

1. **Migrations only.** Every schema change is a numbered SQL file in `supabase/migrations/` — never ad-hoc changes in the Supabase dashboard.
2. **scores and signals are append-only.** No UPDATE or DELETE on historical rows; history is the product.
3. **Indexes**: `signals(product_id, source, measured_at)`, `scores(snapshot_date, rank)`, `products(status, category)`, `product_certifications(product_id)`, `product_offers(product_id)`, `admin_login_attempts(ip, created_at)`.
4. **Row Level Security ON** for all tables. Public (anon) role: read-only on `products` (status = 'approved'), `scores`, and `product_certifications`/`product_offers` (only for products where status = 'approved'); insert-only on `newsletter_subscribers`. Everything else (`signals`, `site_content`, `admin_login_attempts`, `events`) is service-role-only — no anon policy at all.
5. **Keys**: anon key may reach the browser; the service role key is server-only and must never appear in client code. All keys live in `.env.local` / Vercel env vars, listed in `.env.example`.
6. **Untrusted values that end up in a hand-built PostgREST filter string** (e.g. a `.not(col, "in", "(...)")` built via string interpolation) must be validated against a known allowlist first — see `isCertification()` used in `app/admin/actions.ts` before building the `product_certifications` cleanup filter.
