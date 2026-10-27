create table public.discipline_sync_documents (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null check (revision > 0),
 payload jsonb not null check (jsonb_typeof(payload) = 'object'),
 operation_id uuid not null,
 updated_at timestamptz not null default now()
);
alter table public.discipline_sync_documents enable row level security;
revoke all on table public.discipline_sync_documents from anon;
revoke all on table public.discipline_sync_documents from authenticated;
grant select, insert, update on table public.discipline_sync_documents to authenticated;
create policy discipline_select_own on public.discipline_sync_documents for select to authenticated using ((select auth.uid())=user_id);
create policy discipline_insert_own on public.discipline_sync_documents for insert to authenticated with check ((select auth.uid())=user_id);
create policy discipline_update_own on public.discipline_sync_documents for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create function public.discipline_sync_read()
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare uid uuid := auth.uid(); doc public.discipline_sync_documents%rowtype;
begin
 if uid is null then raise insufficient_privilege using message='Sign in required'; end if;
 select * into doc from public.discipline_sync_documents where user_id=uid;
 if not found then return jsonb_build_object('owner',uid,'revision',0,'data',null,'updatedAt',null); end if;
 return jsonb_build_object('owner',uid,'revision',doc.revision,'data',doc.payload,'updatedAt',doc.updated_at);
end;
$$;

create function public.discipline_sync_write(expected_revision bigint, operation uuid, snapshot jsonb)
returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare uid uuid := auth.uid(); doc public.discipline_sync_documents%rowtype;
begin
 if uid is null then raise insufficient_privilege using message='Sign in required'; end if;
 if expected_revision is null or expected_revision < 0 or operation is null or snapshot is null
 or jsonb_typeof(snapshot) <> 'object' or snapshot->>'version' is distinct from '6'
 or not (snapshot ?& array['tasks','checks','snapshots','events','routines','routineChecks','records','diaries','reviews','v6'])
 or jsonb_typeof(snapshot->'tasks') <> 'array' or jsonb_typeof(snapshot->'events') <> 'array'
 or jsonb_typeof(snapshot->'v6') <> 'object' or jsonb_typeof(snapshot->'v6'->'rules') is distinct from 'array'
 or jsonb_typeof(snapshot->'v6'->'categories') is distinct from 'array'
 then raise invalid_parameter_value using message='Invalid snapshot'; end if;
 if octet_length(snapshot::text)>3145728 then raise program_limit_exceeded using message='Snapshot exceeds 3MB';end if;
 if expected_revision=0 then
  insert into public.discipline_sync_documents(user_id,revision,payload,operation_id)
  values(uid,1,snapshot,operation) on conflict(user_id) do nothing returning * into doc;
 else
  update public.discipline_sync_documents set revision=revision+1,payload=snapshot,operation_id=operation,updated_at=now()
  where user_id=uid and revision=expected_revision returning * into doc;
 end if;
 if found then return jsonb_build_object('owner',uid,'revision',doc.revision,'updatedAt',doc.updated_at);end if;
 select * into doc from public.discipline_sync_documents where user_id=uid;
 if found and doc.operation_id=operation then return jsonb_build_object('owner',uid,'revision',doc.revision,'replayed',true);end if;
 return jsonb_build_object('conflict',true,'revision',coalesce(doc.revision,0));
end;
$$;
revoke all on function public.discipline_sync_read() from public, anon;
revoke all on function public.discipline_sync_write(bigint,uuid,jsonb) from public, anon;
grant execute on function public.discipline_sync_read() to authenticated;
grant execute on function public.discipline_sync_write(bigint,uuid,jsonb) to authenticated;


