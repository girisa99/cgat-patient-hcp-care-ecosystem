-- Migration: add foreign keys for user_roles and user_facilities
-- This file is idempotent: each constraint is added only if missing.

-- 1) user_roles.user_id → profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_id_fkey'
      AND conrelid = 'user_roles'::regclass
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END$$;

-- 2) user_roles.role_id → roles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_role_id_fkey'
      AND conrelid = 'user_roles'::regclass
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_role_id_fkey
      FOREIGN KEY (role_id)
      REFERENCES public.roles(id)
      ON DELETE CASCADE;
  END IF;
END$$;

-- 3) user_facilities.user_id → profiles.id (optional multi-tenant isolation)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'user_facilities'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_facilities_user_id_fkey'
      AND conrelid = 'user_facilities'::regclass
  ) THEN
    ALTER TABLE public.user_facilities
      ADD CONSTRAINT user_facilities_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END$$;

-- 4) user_facilities.facility_id → facilities.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'user_facilities'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_facilities_facility_id_fkey'
      AND conrelid = 'user_facilities'::regclass
  ) THEN
    ALTER TABLE public.user_facilities
      ADD CONSTRAINT user_facilities_facility_id_fkey
      FOREIGN KEY (facility_id)
      REFERENCES public.facilities(id)
      ON DELETE CASCADE;
  END IF;
END$$;