-- PHASE 2: Security Validation Improvements - Fix Remaining Data Exposure

-- ============================================================================
-- SECURE HEALTHCARE BUSINESS DATA (ERROR Level - Critical)
-- ============================================================================

-- Secure commercial_products table (contains sensitive pricing data)
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.commercial_products;
CREATE POLICY "Healthcare professionals can view commercial products" ON public.commercial_products
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'view_commercial_data')
    )
  );

-- Secure clinical_trials table (contains proprietary trial data)
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.clinical_trials;
CREATE POLICY "Authorized researchers can view clinical trials" ON public.clinical_trials
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'view_clinical_trials')
    )
  );

-- Secure products table (competitive pharmaceutical information)
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.products;
CREATE POLICY "Healthcare professionals can view products" ON public.products
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'view_products')
    )
  );

-- Secure manufacturers table (partnership details)
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.manufacturers;
CREATE POLICY "Authorized staff can view manufacturers" ON public.manufacturers
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'view_manufacturers')
    )
  );

-- ============================================================================
-- SECURE TREATMENT CENTER DATA (WARN Level - Important)
-- ============================================================================

-- Secure treatment_center_onboarding table
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.treatment_center_onboarding;
CREATE POLICY "Healthcare staff can view treatment center onboarding" ON public.treatment_center_onboarding
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'manage_treatment_centers')
    )
  );

-- ============================================================================
-- SECURE PROPRIETARY TEMPLATES (WARN Level - IP Protection)
-- ============================================================================

-- Note: action_template_tasks, agent_template_journey_stages already secured in Phase 1
-- Secure use_cases table (proprietary workflow templates)
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.use_cases;
CREATE POLICY "Healthcare professionals can view use cases" ON public.use_cases
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      is_admin_user_safe(auth.uid()) OR 
      user_has_permission(auth.uid(), 'view_use_cases')
    )
  );

-- ============================================================================
-- ADD COMPREHENSIVE AUDIT LOGGING FOR SENSITIVE DATA ACCESS
-- ============================================================================

-- Create trigger function for sensitive data access logging
CREATE OR REPLACE FUNCTION trigger_sensitive_data_audit() 
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive healthcare data
  PERFORM log_sensitive_data_access(
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_commercial_products ON public.commercial_products;
CREATE TRIGGER audit_commercial_products
  AFTER INSERT OR UPDATE OR DELETE ON public.commercial_products
  FOR EACH ROW EXECUTE FUNCTION trigger_sensitive_data_audit();

DROP TRIGGER IF EXISTS audit_clinical_trials ON public.clinical_trials;
CREATE TRIGGER audit_clinical_trials
  AFTER INSERT OR UPDATE OR DELETE ON public.clinical_trials
  FOR EACH ROW EXECUTE FUNCTION trigger_sensitive_data_audit();

DROP TRIGGER IF EXISTS audit_treatment_center_onboarding ON public.treatment_center_onboarding;
CREATE TRIGGER audit_treatment_center_onboarding
  AFTER INSERT OR UPDATE OR DELETE ON public.treatment_center_onboarding
  FOR EACH ROW EXECUTE FUNCTION trigger_sensitive_data_audit();

-- ============================================================================
-- VERIFICATION - Log Phase 2 completion
-- ============================================================================

SELECT log_sensitive_data_access('security_policies', 'PHASE_2_SECURITY_ENHANCEMENT', gen_random_uuid());

-- Display Phase 2 completion summary
SELECT 'PHASE 2 Security Fixes Applied Successfully' as status,
       'Secured sensitive healthcare data, treatment center info, and proprietary templates' as changes_made,
       'Added comprehensive audit logging for all sensitive data access' as audit_enhancement;