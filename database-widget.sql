create table public.discipline_widget_connections (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
 name text not null check (char_length(name) between 1 and 60),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 revoked_at timestamptz,
 check (expires_at > created_at)
);
create index discipline_widget_connections_owner_idx on public.discipline_widget_connections(user_id);
alter table public.discipline_widget_connections enable row level security;
revoke all on public.discipline_widget_connections from public,anon,authenticated;
grant select,insert,update on public.discipline_widget_connections to service_role;
comment on table public.discipline_widget_connections is 'Hashed, expiring, revocable read-only widget credentials. Access only via authenticated Edge Function.';