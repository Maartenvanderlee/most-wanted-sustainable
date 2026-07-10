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

```sql
products (
  id uuid PK,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,            -- home | personal_care | fashion | tech | food
  image_url text,
  affiliate_url text,                -- nullable until curated
  sustainability_tags text[] DEFAULT '{}',
  status product_status DEFAULT 'pending',  -- pending | approved | rejected
  rejection_reason text,
  created_at timestamptz DEFAULT now()
)

signals (
  id uuid PK,
  product_id uuid REFERENCES products,
  source source_name NOT NULL,
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
```

## Rules

1. **Migrations only.** Every schema change is a numbered SQL file in `supabase/migrations/` — never ad-hoc changes in the Supabase dashboard.
2. **scores and signals are append-only.** No UPDATE or DELETE on historical rows; history is the product.
3. **Indexes**: `signals(product_id, source, measured_at)`, `scores(snapshot_date, rank)`, `products(status, category)`.
4. **Row Level Security ON** for all tables. Public (anon) role: read-only on `products` (status = 'approved') and `scores`; insert-only on `newsletter_subscribers`. Everything else via the service role on the server only.
5. **Keys**: anon key may reach the browser; the service role key is server-only and must never appear in client code. All keys live in `.env.local` / Vercel env vars, listed in `.env.example`.
