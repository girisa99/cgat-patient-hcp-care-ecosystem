-- Fix RLS and collection_method constraint for enrollment flow

-- 1) Relax brittle CHECK constraint and replace with trigger-based normalization
DO $$
BEGIN
  -- Drop the CHECK constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'enrollment_consent_collection_method_check'
      AND n.nspname = 'public'
      AND t.relname = 'enrollment_consent'
  ) THEN
    ALTER TABLE public.enrollment_consent
      DROP CONSTRAINT enrollment_consent_collection_method_check;
  END IF;
END$$;

-- Create function to sanitize/normalize collection_method
CREATE OR REPLACE FUNCTION public.sanitize_enrollment_collection_method()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed text[] := ARRAY['digital', 'paper', 'phone'];
BEGIN
  -- Normalize common aliases
  IF NEW.collection_method IS NULL OR NEW.collection_method = '' THEN
    NEW.collection_method := 'digital';
  ELSE
    NEW.collection_method := lower(NEW.collection_method);
    IF NEW.collection_method IN ('electronic', 'digital_signature') THEN
      NEW.collection_method := 'digital';
    ELSIF NEW.collection_method IN ('verbal', 'voice', 'whatsapp') THEN
      NEW.collection_method := 'phone';
    END IF;
    -- Fallback to default if not allowed
    IF NOT (NEW.collection_method = ANY(allowed)) THEN
      NEW.collection_method := 'digital';
    END IF;
  END IF;
  RETURN NEW;
END
$$;

-- Attach trigger (idempotent: drop then create)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'sanitize_enrollment_collection_method_before'
  ) THEN
    DROP TRIGGER sanitize_enrollment_collection_method_before ON public.enrollment_consent;
  END IF;
  CREATE TRIGGER sanitize_enrollment_collection_method_before
  BEFORE INSERT OR UPDATE ON public.enrollment_consent
  FOR EACH ROW EXECUTE FUNCTION public.sanitize_enrollment_collection_method();
END$$;

-- 2) Ensure RLS policies allow authenticated users to manage their own enrollment data
-- Enable RLS if not already enabled
ALTER TABLE public.patient_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollment_consent ENABLE ROW LEVEL SECURITY;

-- Drop and recreate patient_enrollments policies
DROP POLICY IF EXISTS "patient_enrollments_insert_own" ON public.patient_enrollments;
DROP POLICY IF EXISTS "patient_enrollments_select_own" ON public.patient_enrollments;
DROP POLICY IF EXISTS "patient_enrollments_update_own" ON public.patient_enrollments;
DROP POLICY IF EXISTS "patient_enrollments_delete_own" ON public.patient_enrollments;

CREATE POLICY "patient_enrollments_insert_own"
ON public.patient_enrollments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "patient_enrollments_select_own"
ON public.patient_enrollments
FOR SELECT
USING (auth.uid() = user_id OR is_admin_user_safe(auth.uid()));

CREATE POLICY "patient_enrollments_update_own"
ON public.patient_enrollments
FOR UPDATE
USING (auth.uid() = user_id OR is_admin_user_safe(auth.uid()));

CREATE POLICY "patient_enrollments_delete_own"
ON public.patient_enrollments
FOR DELETE
USING (auth.uid() = user_id OR is_admin_user_safe(auth.uid()));

-- Drop and recreate enrollment_consent policies
DROP POLICY IF EXISTS "enrollment_consent_insert_via_parent" ON public.enrollment_consent;
DROP POLICY IF EXISTS "enrollment_consent_select_via_parent" ON public.enrollment_consent;
DROP POLICY IF EXISTS "enrollment_consent_update_via_parent" ON public.enrollment_consent;
DROP POLICY IF EXISTS "enrollment_consent_delete_via_parent" ON public.enrollment_consent;

CREATE POLICY "enrollment_consent_insert_via_parent"
ON public.enrollment_consent
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patient_enrollments pe
    WHERE pe.id = enrollment_id
      AND (pe.user_id = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
);

CREATE POLICY "enrollment_consent_select_via_parent"
ON public.enrollment_consent
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_enrollments pe
    WHERE pe.id = enrollment_id
      AND (pe.user_id = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
);

CREATE POLICY "enrollment_consent_update_via_parent"
ON public.enrollment_consent
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.patient_enrollments pe
    WHERE pe.id = enrollment_id
      AND (pe.user_id = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
);

CREATE POLICY "enrollment_consent_delete_via_parent"
ON public.enrollment_consent
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.patient_enrollments pe
    WHERE pe.id = enrollment_id
      AND (pe.user_id = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
);