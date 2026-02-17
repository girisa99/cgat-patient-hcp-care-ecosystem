-- Safe Migration: Optimize User Roles Structure
-- This migration ensures data integrity and performance without breaking functionality

-- Step 1: Clean up any potential NULL values in critical fields
UPDATE public.user_roles 
SET user_id = NULL 
WHERE user_id IS NULL;

UPDATE public.user_roles 
SET role_id = NULL 
WHERE role_id IS NULL;

-- Step 2: Remove any rows with NULL user_id or role_id (these would be invalid anyway)
DELETE FROM public.user_roles 
WHERE user_id IS NULL OR role_id IS NULL;

-- Step 3: Remove any duplicate assignments (keep the oldest one)
DELETE FROM public.user_roles 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, role_id) id
  FROM public.user_roles
  ORDER BY user_id, role_id, created_at ASC
);

-- Step 4: Now safely add NOT NULL constraints
ALTER TABLE public.user_roles 
ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE public.user_roles 
ALTER COLUMN role_id SET NOT NULL;

-- Step 5: Add unique constraint to prevent duplicates
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role_id);

-- Step 6: Add performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id 
ON public.user_roles (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_role_id 
ON public.user_roles (role_id);

-- Step 7: Update the validation trigger to be more robust
CREATE OR REPLACE FUNCTION public.validate_user_role_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Ensure user_id is not null (critical for RLS and security)
    IF NEW.user_id IS NULL THEN
        RAISE EXCEPTION 'user_id cannot be null for role assignments';
    END IF;
    
    -- Ensure role_id is not null
    IF NEW.role_id IS NULL THEN
        RAISE EXCEPTION 'role_id cannot be null for role assignments';
    END IF;
    
    -- Validate that the user exists in profiles
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.user_id) THEN
        RAISE EXCEPTION 'Invalid user_id: user profile does not exist';
    END IF;
    
    -- Validate that the role exists
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE id = NEW.role_id) THEN
        RAISE EXCEPTION 'Invalid role_id: role does not exist';
    END IF;
    
    -- Prevent system roles from being assigned by non-admins (security check)
    IF EXISTS (
        SELECT 1 FROM public.roles 
        WHERE id = NEW.role_id 
        AND name IN ('superAdmin', 'onboardingTeam') 
        AND NOT is_admin_user_safe(auth.uid())
    ) THEN
        RAISE EXCEPTION 'Only administrators can assign system roles';
    END IF;
    
    -- Set assigned_by if not provided
    IF NEW.assigned_by IS NULL THEN
        NEW.assigned_by := auth.uid();
    END IF;
    
    -- Set created_at if not provided
    IF NEW.created_at IS NULL THEN
        NEW.created_at := now();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Step 8: Ensure the trigger is attached
DROP TRIGGER IF EXISTS validate_user_role_assignment_trigger ON public.user_roles;
CREATE TRIGGER validate_user_role_assignment_trigger
    BEFORE INSERT OR UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_user_role_assignment();

-- Step 9: Add helpful utility function for role checking (performance optimization)
CREATE OR REPLACE FUNCTION public.user_has_any_role(check_user_id uuid, role_names text[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name::text = ANY(role_names)
  );
$$;

-- Step 10: Verify data integrity after migration
DO $$
DECLARE
    duplicate_count INTEGER;
    null_user_count INTEGER;
    null_role_count INTEGER;
BEGIN
    -- Check for any remaining duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id, role_id, COUNT(*)
        FROM public.user_roles
        GROUP BY user_id, role_id
        HAVING COUNT(*) > 1
    ) dups;
    
    -- Check for NULL user_ids
    SELECT COUNT(*) INTO null_user_count
    FROM public.user_roles
    WHERE user_id IS NULL;
    
    -- Check for NULL role_ids  
    SELECT COUNT(*) INTO null_role_count
    FROM public.user_roles
    WHERE role_id IS NULL;
    
    -- Report results
    RAISE NOTICE 'Migration verification complete:';
    RAISE NOTICE 'Duplicate assignments: %', duplicate_count;
    RAISE NOTICE 'NULL user_ids: %', null_user_count;
    RAISE NOTICE 'NULL role_ids: %', null_role_count;
    
    IF duplicate_count > 0 OR null_user_count > 0 OR null_role_count > 0 THEN
        RAISE EXCEPTION 'Migration verification failed - data integrity issues detected';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully - all data integrity checks passed';
END;
$$;