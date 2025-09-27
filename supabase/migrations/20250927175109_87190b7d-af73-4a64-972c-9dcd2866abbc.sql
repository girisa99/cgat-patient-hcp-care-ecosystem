-- FIX PRODUCTS TABLE SECURITY: Clean up conflicting policies and implement secure access
-- Remove all existing conflicting policies from products table
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Healthcare professionals can view products" ON public.products;
DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Only authorized healthcare professionals can access product data" ON public.products;
DROP POLICY IF EXISTS "Products management for authorized users" ON public.products;
DROP POLICY IF EXISTS "products_admin_management" ON public.products;
DROP POLICY IF EXISTS "products_authenticated_read_only" ON public.products;
DROP POLICY IF EXISTS "products_restricted_access" ON public.products;

-- Create single, secure policy for products table
CREATE POLICY "products_secure_access" 
ON public.products 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id  
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam', 'patientCaregiver')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id  
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam', 'patientCaregiver')
  )
);

-- Also fix the service_providers and workflow_node_types tables that still show as exposed
-- Clean up service_providers policies
DROP POLICY IF EXISTS "Only authorized users can access service provider data" ON public.service_providers;

CREATE POLICY "service_providers_secure_access"
ON public.service_providers
FOR ALL
TO authenticated  
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam', 'patientCaregiver')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('superAdmin', 'onboardingTeam', 'patientCaregiver')
  )
);

-- Secure workflow_node_types table
ALTER TABLE public.workflow_node_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflow_node_types_authenticated_access"
ON public.workflow_node_types
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);