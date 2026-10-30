create table public.orbit_widget_connections(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,kind text not null check(kind in ('law','routine')),name text not null,token_hash text not null unique check(token_hash ~ '^[0-9a-f]{64}$'),created_at timestamptz not null default now(),expires_at timestamptz not null,revoked_at timestamptz);
create index orbit_widget_connections_user on public.orbit_widget_connections(user_id);
alter table public.orbit_widget_connections enable row level security;
revoke all on public.orbit_widget_connections from public,anon,authenticated;
grant all on public.orbit_widget_connections to service_role;
comment on table public.orbit_widget_connections is 'Independent revocable law-task or routine widget credentials. Hashes only; no access to journal or argument bodies.';
