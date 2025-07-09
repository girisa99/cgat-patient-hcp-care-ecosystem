-- Copied from 202507081700_multi_tenant_setup.sql but renamed with a 14-digit timestamp so the Supabase CLI will execute it.

-- Migration: multi-tenant base setup (schemas / triggers / RLS)

-- 1. Schemas -----------------------------------------------------------------
create schema if not exists public_dev;
create schema if not exists public_test;
create schema if not exists public_uat;

-- 2. Profiles table in each schema ------------------------------------------
create table if not exists public_dev.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists public_test.profiles (like public_dev.profiles including all);
create table if not exists public_uat.profiles  (like public_dev.profiles including all);

-- 3. Trigger: copy new users into public_dev by default ----------------------
create or replace function public.insert_profile_per_tenant()
returns trigger language plpgsql security definer as $$
declare
  tgt_schema text := 'public_dev';
begin
  execute format('insert into %I.profiles(id) values($1)', tgt_schema) using new.id;
  return new;
end$$;

drop trigger if exists trg_insert_profile on auth.users;
create trigger trg_insert_profile
  after insert on auth.users
  for each row execute function public.insert_profile_per_tenant();

-- 4. JWT custom claims -------------------------------------------------------
create or replace function public.jwt_custom_claims(user_id uuid)
returns jsonb language plpgsql stable as $$
begin
  return jsonb_build_object('tenant_id', 'dev');
end$$;

alter role authenticator set jwt_claims_func = 'public.jwt_custom_claims';

-- 5. RLS: restrict access by tenant_id --------------------------------------
create or replace function public.apply_rls(schema_name text, tenant text)
returns void language plpgsql as $$
begin
  execute format('alter table %I.profiles enable row level security', schema_name);
  execute format($sql$
    create policy if not exists by_tenant on %I.profiles
    for all using (
      (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id') = '%s'
    );
  $sql$, schema_name, tenant);
end$$;

select public.apply_rls('public_dev',  'dev');
select public.apply_rls('public_test', 'test');
select public.apply_rls('public_uat',  'uat');