-- Registreert mislukte admin-inlogpogingen per IP, om brute-force te
-- vertragen. Alleen de service role (server) leest en schrijft hier ooit.
create table admin_login_attempts (
  id          uuid primary key default gen_random_uuid(),
  ip          text not null,
  created_at  timestamptz not null default now()
);

create index idx_admin_login_attempts_ip_time
  on admin_login_attempts (ip, created_at);

alter table admin_login_attempts enable row level security;
-- Bewust geen publieke policy: alleen bereikbaar via de service role.
