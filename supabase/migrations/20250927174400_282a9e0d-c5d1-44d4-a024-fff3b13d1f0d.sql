-- CRITICAL SECURITY FIX: Protect sensitive business data with RLS policies
-- This fixes the exposed healthcare business data identified in security scan

-- 1. Enable RLS on treatment_center_onboarding table (185 records with tax IDs, bank accounts)
ALTER TABLE public.treatment_center_onboarding ENABLE ROW LEVEL SECURITY;

-- Create policy for authorized healthcare staff only
CREATE POLICY "Only authorized staff can access treatment center data" 
ON public.treatment_center_onboarding 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id  
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam', 'patientCaregiver')
  )
);

-- 2. Enable RLS on products table (65 records with $475K pricing data)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy for authorized healthcare professionals only  
CREATE POLICY "Only authorized healthcare professionals can access product data"
ON public.products
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('superAdmin', 'onboardingTeam', 'patientCaregiver')
  )
);

-- 3. Enable RLS on services table (20 records with pricing models)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policy for authorized users only
CREATE POLICY "Only authorized users can access service data"
ON public.services  
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam', 'patientCaregiver') 
  )
);

-- 4. Enable RLS on service_providers table (business partner data)
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- Create policy for authorized users only
CREATE POLICY "Only authorized users can access service provider data"
ON public.service_providers
FOR ALL  
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam', 'patientCaregiver')
  )
);

-- 5. Enable RLS on therapies table (37 records with medical research)
ALTER TABLE public.therapies ENABLE ROW LEVEL SECURITY;

-- Create policy for authorized healthcare professionals only
CREATE POLICY "Only authorized healthcare professionals can access therapy data"  
ON public.therapies
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam', 'patientCaregiver')
  )
);

-- 6. Enable RLS on modalities table (treatment modality data)
ALTER TABLE public.modalities ENABLE ROW LEVEL SECURITY;

-- Create policy for authorized healthcare professionals only
CREATE POLICY "Only authorized healthcare professionals can access modality data"
ON public.modalities  
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('superAdmin', 'onboardingTeam', 'patientCaregiver')
  )
);

-- Add audit logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_healthcare_access()
RETURNS trigger
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to sensitive healthcare data for INSERT, UPDATE, DELETE operations
  PERFORM public.log_sensitive_data_access(TG_TABLE_NAME, TG_OP, COALESCE(NEW.id, OLD.id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit logging to all sensitive tables (for data modifications only)
CREATE TRIGGER log_treatment_center_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.treatment_center_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_healthcare_access();

CREATE TRIGGER log_products_modifications  
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_healthcare_access();

CREATE TRIGGER log_services_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.services  
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_healthcare_access();

CREATE TRIGGER log_service_providers_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_healthcare_access();

CREATE TRIGGER log_therapies_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.therapies
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_healthcare_access();

CREATE TRIGGER log_modalities_modifications  
  AFTER INSERT OR UPDATE OR DELETE ON public.modalities
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_healthcare_access();