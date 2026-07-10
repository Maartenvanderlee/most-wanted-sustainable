-- 0002_row_level_security.sql
-- Zet Row Level Security (RLS) aan voor alle tabellen en definieert het
-- publieke (anon) toegangsbeleid. Alles wat hier niet expliciet is toegestaan,
-- kan alleen via de service role op de server. Volgt .claude/skills/db-conventions.

-- RLS aanzetten. Zonder policy is er standaard geen toegang.
alter table products               enable row level security;
alter table signals                enable row level security;
alter table scores                 enable row level security;
alter table newsletter_subscribers enable row level security;

-- ---------- products ----------
-- Publiek: alleen goedgekeurde producten lezen.
create policy "public_read_approved_products"
  on products
  for select
  to anon
  using (status = 'approved');

-- ---------- scores ----------
-- Publiek: alle scores lezen (voor de ranglijst en grafieken).
create policy "public_read_scores"
  on scores
  for select
  to anon
  using (true);

-- ---------- newsletter_subscribers ----------
-- Publiek: alleen inschrijven (insert), nooit lezen.
create policy "public_insert_newsletter"
  on newsletter_subscribers
  for insert
  to anon
  with check (true);

-- ---------- signals ----------
-- Geen publieke policy: signals zijn uitsluitend toegankelijk via de
-- service role op de server (die RLS omzeilt).
