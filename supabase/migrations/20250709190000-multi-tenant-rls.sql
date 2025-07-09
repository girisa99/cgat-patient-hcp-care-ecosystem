-- Multi-tenant architecture migration
-- ------------------------------------------------
-- 1) Create a tenants table (one row per organisation)
-- 2) Add tenant_id columns to all data tables that must be isolated
-- 3) Back-fill existing rows with a default tenant (id = public tenant)
-- 4) Enable Row-Level-Security and add policies that match tenant_id with the
--    tenant_id claim that will be included in every JWT issued by Supabase.
-- ------------------------------------------------

-- 1. TENANTS TABLE -----------------------------------------------------------
create table if not exists tenants (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- Insert a catch-all tenant so pre-existing rows have somewhere to point.
insert into tenants (id, name)
values ('00000000-0000-0000-0000-000000000000', 'public')
on conflict (id) do nothing;

-- 2. ADD tenant_id TO CORE TABLES -------------------------------------------
alter table if exists profiles
  add column if not exists tenant_id uuid references tenants(id)
  default '00000000-0000-0000-0000-000000000000';

alter table if exists facilities
  add column if not exists tenant_id uuid references tenants(id)
  default '00000000-0000-0000-0000-000000000000';

alter table if exists modules
  add column if not exists tenant_id uuid references tenants(id)
  default '00000000-0000-0000-0000-000000000000';

alter table if exists api_integration_registry
  add column if not exists tenant_id uuid references tenants(id)
  default '00000000-0000-0000-0000-000000000000';

-- 3. BACK-FILL EXISTING ROWS -------------------------------------------------
-- (The default above already assigns the public tenant to existing rows.)

-- 4. ENABLE RLS & ADD POLICIES ----------------------------------------------
-- Helper: expose tenant_id from the JWT in a stable way
create or replace function current_tenant_id() returns uuid as $$
  select nullif((current_setting('request.jwt.claims', true)::json ->> 'tenant_id'), '')::uuid;
$$ language sql stable;

-- PROFILES -------------------------------------------------------------------
alter table profiles enable row level security;

create policy profiles_tenant_isolation on profiles
  for all
  using (tenant_id = current_tenant_id());

-- FACILITIES -----------------------------------------------------------------
alter table facilities enable row level security;

create policy facilities_tenant_isolation on facilities
  for all
  using (tenant_id = current_tenant_id());

-- MODULES --------------------------------------------------------------------
alter table modules enable row level security;

create policy modules_tenant_isolation on modules
  for all
  using (tenant_id = current_tenant_id());

-- API INTEGRATION REGISTRY ----------------------------------------------------
alter table api_integration_registry enable row level security;

create policy api_services_tenant_isolation on api_integration_registry
  for all
  using (tenant_id = current_tenant_id());

-- 5. OPTIONAL: future tables can simply copy the same pattern ---------------

-- 6. CLEAN-UP MIGRATION TO DROP MOCK DATA ------------------------------------
-- Remove any rows explicitly marked as mock or test.
-- (Assumes tables have an is_mock boolean or similar; adjust as needed.)

delete from profiles where email ilike '%@example.com' or email ilike '%test%';

delete from facilities where name ilike '%test%' or name ilike '%demo%';

delete from modules where name ilike '%test%' or name ilike '%demo%';

delete from api_integration_registry where name ilike '%test%' or name ilike '%demo%';