-- Re-apply with distinct dollar-quoting to avoid nested $$ conflicts in DO blocks

CREATE OR REPLACE FUNCTION public._table_exists(p_table text)
RETURNS boolean
LANGUAGE sql
STABLE
AS $fn$
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name = p_table
  );
$fn$;

-- Facilities
DO $do$
BEGIN
  IF public._table_exists('facilities') THEN
    EXECUTE $$
      CREATE OR REPLACE FUNCTION public.ensure_no_duplicate_facilities()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $fn$
      DECLARE
        _exists boolean;
      BEGIN
        IF NEW.email IS NOT NULL THEN
          SELECT EXISTS (
            SELECT 1 FROM public.facilities f
            WHERE lower(f.email) = lower(NEW.email)
              AND (NEW.id IS NULL OR f.id <> NEW.id)
          ) INTO _exists;
          IF _exists THEN RAISE EXCEPTION 'Duplicate facility email detected'; END IF;
        END IF;
        IF NEW.license_number IS NOT NULL THEN
          SELECT EXISTS (
            SELECT 1 FROM public.facilities f
            WHERE f.license_number = NEW.license_number
              AND (NEW.id IS NULL OR f.id <> NEW.id)
          ) INTO _exists;
          IF _exists THEN RAISE EXCEPTION 'Duplicate facility license_number detected'; END IF;
        END IF;
        IF NEW.npi_number IS NOT NULL THEN
          SELECT EXISTS (
            SELECT 1 FROM public.facilities f
            WHERE f.npi_number = NEW.npi_number
              AND (NEW.id IS NULL OR f.id <> NEW.id)
          ) INTO _exists;
          IF _exists THEN RAISE EXCEPTION 'Duplicate facility npi_number detected'; END IF;
        END IF;
        RETURN NEW;
      END;
      $fn$;
    $$;

    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE t.tgname='ensure_facilities_uniques' AND n.nspname='public' AND c.relname='facilities'
    ) THEN
      EXECUTE 'CREATE TRIGGER ensure_facilities_uniques BEFORE INSERT OR UPDATE ON public.facilities FOR EACH ROW EXECUTE FUNCTION public.ensure_no_duplicate_facilities()';
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS facilities_admin_all_safe ON public.facilities';
    EXECUTE 'CREATE POLICY facilities_admin_all_safe ON public.facilities FOR ALL USING (public.is_admin_user_safe(auth.uid())) WITH CHECK (public.is_admin_user_safe(auth.uid()))';
  END IF;
END
$do$;

-- Modules
DO $do$
BEGIN
  IF public._table_exists('modules') THEN
    EXECUTE $$
      CREATE OR REPLACE FUNCTION public.ensure_no_duplicate_modules()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $fn$
      BEGIN
        IF NEW.name IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.modules m
          WHERE lower(m.name) = lower(NEW.name)
            AND (NEW.id IS NULL OR m.id <> NEW.id)
        ) THEN
          RAISE EXCEPTION 'Duplicate module name detected';
        END IF;
        RETURN NEW;
      END;
      $fn$;
    $$;

    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE t.tgname='ensure_modules_uniques' AND n.nspname='public' AND c.relname='modules'
    ) THEN
      EXECUTE 'CREATE TRIGGER ensure_modules_uniques BEFORE INSERT OR UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.ensure_no_duplicate_modules()';
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS modules_admin_all_safe ON public.modules';
    EXECUTE 'CREATE POLICY modules_admin_all_safe ON public.modules FOR ALL USING (public.is_admin_user_safe(auth.uid())) WITH CHECK (public.is_admin_user_safe(auth.uid()))';
  END IF;
END
$do$;

-- Roles
DO $do$
BEGIN
  IF public._table_exists('roles') THEN
    EXECUTE $$
      CREATE OR REPLACE FUNCTION public.ensure_no_duplicate_roles()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $fn$
      BEGIN
        IF NEW.name IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.roles r
          WHERE r.name = NEW.name AND (NEW.id IS NULL OR r.id <> NEW.id)
        ) THEN
          RAISE EXCEPTION 'Duplicate role name detected';
        END IF;
        RETURN NEW;
      END;
      $fn$;
    $$;

    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE t.tgname='ensure_roles_uniques' AND n.nspname='public' AND c.relname='roles'
    ) THEN
      EXECUTE 'CREATE TRIGGER ensure_roles_uniques BEFORE INSERT OR UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.ensure_no_duplicate_roles()';
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS roles_admin_all_safe ON public.roles';
    EXECUTE 'CREATE POLICY roles_admin_all_safe ON public.roles FOR ALL USING (public.is_admin_user_safe(auth.uid())) WITH CHECK (public.is_admin_user_safe(auth.uid()))';
  END IF;
END
$do$;

-- Profiles
DO $do$
BEGIN
  IF public._table_exists('profiles') THEN
    EXECUTE $$
      CREATE OR REPLACE FUNCTION public.ensure_no_duplicate_profiles()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $fn$
      BEGIN
        IF NEW.email IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE lower(p.email) = lower(NEW.email)
            AND (NEW.id IS NULL OR p.id <> NEW.id)
        ) THEN
          RAISE EXCEPTION 'Duplicate user/patient email detected';
        END IF;
        RETURN NEW;
      END;
      $fn$;
    $$;

    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE t.tgname='ensure_profiles_uniques' AND n.nspname='public' AND c.relname='profiles'
    ) THEN
      EXECUTE 'CREATE TRIGGER ensure_profiles_uniques BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.ensure_no_duplicate_profiles()';
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS profiles_admin_all_safe ON public.profiles';
    EXECUTE 'CREATE POLICY profiles_admin_all_safe ON public.profiles FOR ALL USING (public.is_admin_user_safe(auth.uid())) WITH CHECK (public.is_admin_user_safe(auth.uid()))';
  END IF;
END
$do$;

-- Treatment Center Onboarding
DO $do$
BEGIN
  IF public._table_exists('treatment_center_onboarding') THEN
    EXECUTE $$
      CREATE OR REPLACE FUNCTION public.ensure_no_duplicate_treatment_center_onboarding()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $fn$
      DECLARE
        _exists boolean;
      BEGIN
        IF NEW.federal_tax_id IS NOT NULL THEN
          SELECT EXISTS (
            SELECT 1 FROM public.treatment_center_onboarding t
            WHERE t.federal_tax_id = NEW.federal_tax_id
              AND (NEW.id IS NULL OR t.id <> NEW.id)
          ) INTO _exists;
          IF _exists THEN RAISE EXCEPTION 'Duplicate federal_tax_id detected'; END IF;
        END IF;
        IF NEW.dea_number IS NOT NULL THEN
          SELECT EXISTS (
            SELECT 1 FROM public.treatment_center_onboarding t
            WHERE t.dea_number = NEW.dea_number
              AND (NEW.id IS NULL OR t.id <> NEW.id)
          ) INTO _exists;
          IF _exists THEN RAISE EXCEPTION 'Duplicate dea_number detected'; END IF;
        END IF;
        IF NEW.hin_number IS NOT NULL THEN
          SELECT EXISTS (
            SELECT 1 FROM public.treatment_center_onboarding t
            WHERE t.hin_number = NEW.hin_number
              AND (NEW.id IS NULL OR t.id <> NEW.id)
          ) INTO _exists;
          IF _exists THEN RAISE EXCEPTION 'Duplicate hin_number detected'; END IF;
        END IF;
        RETURN NEW;
      END;
      $fn$;
    $$;

    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE t.tgname='ensure_tco_uniques' AND n.nspname='public' AND c.relname='treatment_center_onboarding'
    ) THEN
      EXECUTE 'CREATE TRIGGER ensure_tco_uniques BEFORE INSERT OR UPDATE ON public.treatment_center_onboarding FOR EACH ROW EXECUTE FUNCTION public.ensure_no_duplicate_treatment_center_onboarding()';
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS tco_admin_all_safe ON public.treatment_center_onboarding';
    EXECUTE 'CREATE POLICY tco_admin_all_safe ON public.treatment_center_onboarding FOR ALL USING (public.is_admin_user_safe(auth.uid())) WITH CHECK (public.is_admin_user_safe(auth.uid()))';
  END IF;
END
$do$;

-- Role/Module/User assignments
DO $do$
BEGIN
  IF public._table_exists('role_module_assignments') THEN
    EXECUTE $$
      CREATE OR REPLACE FUNCTION public.ensure_no_duplicate_role_module_assignments()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $fn$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM public.role_module_assignments r
          WHERE r.role_id = NEW.role_id AND r.module_id = NEW.module_id
            AND (NEW.id IS NULL OR r.id <> NEW.id)
        ) THEN
          RAISE EXCEPTION 'Duplicate role-module assignment detected';
        END IF;
        RETURN NEW;
      END;
      $fn$;
    $$;

    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE t.tgname='ensure_rma_uniques' AND n.nspname='public' AND c.relname='role_module_assignments'
    ) THEN
      EXECUTE 'CREATE TRIGGER ensure_rma_uniques BEFORE INSERT OR UPDATE ON public.role_module_assignments FOR EACH ROW EXECUTE FUNCTION public.ensure_no_duplicate_role_module_assignments()';
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS rma_admin_all_safe ON public.role_module_assignments';
    EXECUTE 'CREATE POLICY rma_admin_all_safe ON public.role_module_assignments FOR ALL USING (public.is_admin_user_safe(auth.uid())) WITH CHECK (public.is_admin_user_safe(auth.uid()))';
  END IF;

  IF public._table_exists('user_module_assignments') THEN
    EXECUTE $$
      CREATE OR REPLACE FUNCTION public.ensure_no_duplicate_user_module_assignments()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $fn$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM public.user_module_assignments u
          WHERE u.user_id = NEW.user_id AND u.module_id = NEW.module_id
            AND (NEW.id IS NULL OR u.id <> NEW.id)
        ) THEN
          RAISE EXCEPTION 'Duplicate user-module assignment detected';
        END IF;
        RETURN NEW;
      END;
      $fn$;
    $$;

    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE t.tgname='ensure_uma_uniques' AND n.nspname='public' AND c.relname='user_module_assignments'
    ) THEN
      EXECUTE 'CREATE TRIGGER ensure_uma_uniques BEFORE INSERT OR UPDATE ON public.user_module_assignments FOR EACH ROW EXECUTE FUNCTION public.ensure_no_duplicate_user_module_assignments()';
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS uma_admin_all_safe ON public.user_module_assignments';
    EXECUTE 'CREATE POLICY uma_admin_all_safe ON public.user_module_assignments FOR ALL USING (public.is_admin_user_safe(auth.uid())) WITH CHECK (public.is_admin_user_safe(auth.uid()))';
  END IF;

  IF public._table_exists('user_roles') THEN
    EXECUTE $$
      CREATE OR REPLACE FUNCTION public.ensure_no_duplicate_user_roles()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path TO 'public'
      AS $fn$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM public.user_roles ur
          WHERE ur.user_id = NEW.user_id AND ur.role_id = NEW.role_id
            AND (NEW.id IS NULL OR ur.id <> NEW.id)
        ) THEN
          RAISE EXCEPTION 'Duplicate user-role assignment detected';
        END IF;
        RETURN NEW;
      END;
      $fn$;
    $$;

    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE t.tgname='ensure_user_roles_uniques' AND n.nspname='public' AND c.relname='user_roles'
    ) THEN
      EXECUTE 'CREATE TRIGGER ensure_user_roles_uniques BEFORE INSERT OR UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.ensure_no_duplicate_user_roles()';
    END IF;

    EXECUTE 'DROP POLICY IF EXISTS user_roles_admin_all_safe2 ON public.user_roles';
    EXECUTE 'CREATE POLICY user_roles_admin_all_safe2 ON public.user_roles FOR ALL USING (public.is_admin_user_safe(auth.uid())) WITH CHECK (public.is_admin_user_safe(auth.uid()))';
  END IF;
END
$do$;