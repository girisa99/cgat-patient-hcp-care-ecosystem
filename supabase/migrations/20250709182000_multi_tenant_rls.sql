-- Multi-tenant RLS setup
-- Created: 2025-07-09

-- 0. Ensure UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/* -------------------------------------------------------------------------- */
/* 1. ADD tenant_id COLUMN TO SHARED TABLES                                    */
/* -------------------------------------------------------------------------- */

ALTER TABLE profiles                    ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE api_integration_registry    ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE facilities                  ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE modules                     ADD COLUMN IF NOT EXISTS tenant_id uuid;

-- NOTE: for any existing data, you should back-fill tenant_id manually or via
--       an UPDATE statement once you know which tenant each row belongs to.

/* -------------------------------------------------------------------------- */
/* 2. DATABASE ROLES FOR THE APP                                             */
/* -------------------------------------------------------------------------- */

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_anon') THEN
    CREATE ROLE app_anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_admin') THEN
    CREATE ROLE app_admin NOLOGIN;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Helper: grant basic privileges (Supabase's service_role retains super-powers)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user, app_admin;
GRANT SELECT                ON ALL TABLES    IN SCHEMA public TO app_anon;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES   IN SCHEMA public TO app_user;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES   IN SCHEMA public TO app_admin;

/* -------------------------------------------------------------------------- */
/* 3. ROW-LEVEL-SECURITY POLICIES                                            */
/* -------------------------------------------------------------------------- */

-- Enable RLS + default deny
ALTER TABLE profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_integration_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities               ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules                  ENABLE ROW LEVEL SECURITY;

-- Shared expression: the tenant claim extracted from JWT
CREATE OR REPLACE FUNCTION current_tenant_uuid() RETURNS uuid LANGUAGE sql IMMUTABLE PARALLEL SAFE AS $$
  SELECT current_setting('request.jwt.claim.tenant_id', true)::uuid
$$;

-- SELECT policy – tenant isolation for all roles
CREATE POLICY profiles_select_tenant
  ON profiles FOR SELECT
  USING (tenant_id = current_tenant_uuid());

CREATE POLICY api_services_select_tenant
  ON api_integration_registry FOR SELECT
  USING (tenant_id = current_tenant_uuid());

CREATE POLICY facilities_select_tenant
  ON facilities FOR SELECT
  USING (tenant_id = current_tenant_uuid());

CREATE POLICY modules_select_tenant
  ON modules FOR SELECT
  USING (tenant_id = current_tenant_uuid());

-- INSERT/UPDATE policies – only allow if row's tenant matches claim
CREATE POLICY profiles_modify_tenant
  ON profiles FOR INSERT, UPDATE
  WITH CHECK (tenant_id = current_tenant_uuid());

CREATE POLICY api_services_modify_tenant
  ON api_integration_registry FOR INSERT, UPDATE
  WITH CHECK (tenant_id = current_tenant_uuid());

CREATE POLICY facilities_modify_tenant
  ON facilities FOR INSERT, UPDATE
  WITH CHECK (tenant_id = current_tenant_uuid());

CREATE POLICY modules_modify_tenant
  ON modules FOR INSERT, UPDATE
  WITH CHECK (tenant_id = current_tenant_uuid());

-- Admin bypass (optional): app_admin may access any tenant
CREATE POLICY profiles_admin_bypass
  ON profiles FOR ALL
  TO app_admin
  USING (true);

CREATE POLICY api_services_admin_bypass
  ON api_integration_registry FOR ALL
  TO app_admin
  USING (true);

CREATE POLICY facilities_admin_bypass
  ON facilities FOR ALL
  TO app_admin
  USING (true);

CREATE POLICY modules_admin_bypass
  ON modules FOR ALL
  TO app_admin
  USING (true);