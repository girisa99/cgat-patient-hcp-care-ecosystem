
-- First, let's drop any existing policies on api_integration_registry to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own API integrations" ON public.api_integration_registry;
DROP POLICY IF EXISTS "Users can insert their own API integrations" ON public.api_integration_registry;
DROP POLICY IF EXISTS "Users can update their own API integrations" ON public.api_integration_registry;

-- Enable RLS on api_integration_registry
ALTER TABLE public.api_integration_registry ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for api_integration_registry
CREATE POLICY "Users can view their own API integrations" 
ON public.api_integration_registry
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() OR 
    created_by IS NULL  -- Allow viewing records without creator for now
  )
);

CREATE POLICY "Users can insert their own API integrations" 
ON public.api_integration_registry
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (created_by = auth.uid() OR created_by IS NULL)
);

CREATE POLICY "Users can update their own API integrations" 
ON public.api_integration_registry
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() OR 
    created_by IS NULL
  )
);
