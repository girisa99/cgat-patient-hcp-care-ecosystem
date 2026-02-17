-- CRITICAL SECURITY FIX: Clean up treatment_center_onboarding table policies
-- Remove all conflicting policies and implement secure access

-- Remove all existing policies that may be conflicting
DROP POLICY IF EXISTS "Admins can manage treatment_center_onboarding" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Admins can view treatment_center_onboarding" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Onboarding team can update all applications" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Onboarding team can view all applications" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Only authorized staff can access treatment center data" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Users can create their own onboarding applications" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Users can update their own onboarding applications" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "Users can view their own onboarding applications" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "tco_admin_all_safe" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "treatment_center_onboarding_admin_management" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "treatment_center_onboarding_admin_only" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "treatment_center_onboarding_authenticated_read_only" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "treatment_center_onboarding_own_view" ON public.treatment_center_onboarding;
DROP POLICY IF EXISTS "users_can_read_own_onboarding_data" ON public.treatment_center_onboarding;

-- Create comprehensive secure policy for treatment center onboarding
-- Users can view/edit their own applications, authorized staff can see all
CREATE POLICY "treatment_center_secure_access"
ON public.treatment_center_onboarding
FOR ALL
TO authenticated
USING (
  -- Users can access their own applications
  (auth.uid() = user_id) 
  OR 
  -- Authorized staff can access all applications
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam')
  )
)
WITH CHECK (
  -- Users can only create/update their own applications
  (auth.uid() = user_id)
  OR
  -- Authorized staff can manage all applications  
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam')
  )
);

-- Add enhanced audit logging for this sensitive table
CREATE OR REPLACE FUNCTION public.log_treatment_center_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all access to treatment center data with enhanced details
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    additional_context
  ) VALUES (
    auth.uid(),
    TG_OP || ' on treatment_center_onboarding',
    'treatment_center_onboarding',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'timestamp', now(),
      'sensitive_data_access', true,
      'federal_tax_id_accessed', CASE WHEN COALESCE(NEW.federal_tax_id, OLD.federal_tax_id) IS NOT NULL THEN true ELSE false END,
      'dea_number_accessed', CASE WHEN COALESCE(NEW.dea_number, OLD.dea_number) IS NOT NULL THEN true ELSE false END,
      'hin_number_accessed', CASE WHEN COALESCE(NEW.hin_number, OLD.hin_number) IS NOT NULL THEN true ELSE false END
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply enhanced audit trigger
DROP TRIGGER IF EXISTS log_treatment_center_access ON public.treatment_center_onboarding;
CREATE TRIGGER log_treatment_center_enhanced_access
  AFTER INSERT OR UPDATE OR DELETE ON public.treatment_center_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.log_treatment_center_access();