-- Migration: 2025-07-10 Initial core schema
-- Description: Creates baseline tables and foreign-key relationships that the React app expects.
-- NOTE: id naming & constraints closely match existing TypeScript models.

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-------------------------------------------------------------------------------
-- 1. profiles (users)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 2. roles & permissions lookup tables
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

-------------------------------------------------------------------------------
-- 3. linking tables for RBAC
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID      NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  role_id BIGINT    NOT NULL REFERENCES public.roles(id)      ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS public.user_permissions (
  user_id       UUID   NOT NULL REFERENCES public.profiles(id)     ON DELETE CASCADE,
  permission_id BIGINT NOT NULL REFERENCES public.permissions(id)  ON DELETE CASCADE,
  PRIMARY KEY (user_id, permission_id)
);

-------------------------------------------------------------------------------
-- 4. facilities & modules (optional but referenced by code)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.facilities (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  address     TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 5. audit logs
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id),
  action     TEXT NOT NULL,
  table_name TEXT,
  record_id  UUID,
  payload    JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 6. issue tracking (used by verification hooks)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.active_issues (
  id          BIGSERIAL PRIMARY KEY,
  severity    TEXT    NOT NULL DEFAULT 'medium',
  description TEXT    NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.issue_fixes (
  id          BIGSERIAL PRIMARY KEY,
  issue_id    BIGINT NOT NULL REFERENCES public.active_issues(id) ON DELETE CASCADE,
  description TEXT    NOT NULL,
  fixer_id    UUID REFERENCES public.profiles(id),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-------------------------------------------------------------------------------
-- 7. basic RLS examples (optional – app may expect them)
-------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY IF NOT EXISTS profiles_select_self ON public.profiles
  FOR SELECT USING ( auth.uid() = id );

-- Allow a user to update their own profile
CREATE POLICY IF NOT EXISTS profiles_update_self ON public.profiles
  FOR UPDATE USING ( auth.uid() = id );

-------------------------------------------------------------------------------
-- 8. Seed minimal lookup data (safe-insert)
-------------------------------------------------------------------------------
INSERT INTO public.roles (name)          VALUES ('admin'), ('user')
  ON CONFLICT DO NOTHING;
INSERT INTO public.permissions (name)    VALUES ('read'), ('write'), ('delete')
  ON CONFLICT DO NOTHING;

-- End of migration