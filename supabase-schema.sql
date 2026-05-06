create extension if not exists pgcrypto;

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  score int not null,
  risk_level text not null,
  result jsonb not null,
  created_at timestamp with time zone default now()
);

create index if not exists scans_domain_idx on scans(domain);
create index if not exists scans_created_at_idx on scans(created_at desc);
