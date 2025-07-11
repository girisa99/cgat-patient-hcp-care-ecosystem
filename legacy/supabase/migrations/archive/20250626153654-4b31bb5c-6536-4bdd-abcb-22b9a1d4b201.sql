
-- First, let's check the current state and fix the RLS policies for external_api_registry
-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "External APIs are publicly viewable when published" ON public.external_api_registry;
DROP POLICY IF EXISTS "Authenticated users can create external APIs" ON public.external_api_registry;
DROP POLICY IF EXISTS "Users can update their own external APIs" ON public.external_api_registry;
DROP POLICY IF EXISTS "Users can view external APIs they created or published ones" ON public.external_api_registry;
DROP POLICY IF EXISTS "Users can insert their own external APIs" ON public.external_api_registry;
DROP POLICY IF EXISTS "Users can delete their own external APIs" ON public.external_api_registry;

-- Ensure RLS is enabled
ALTER TABLE public.external_api_registry ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for external_api_registry
CREATE POLICY "Users can view external APIs they created or published ones" 
ON public.external_api_registry
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    created_by = auth.uid() OR 
    status = 'published' OR
    visibility IN ('public', 'marketplace')
  )
);

CREATE POLICY "Users can insert their own external APIs" 
ON public.external_api_registry
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  created_by = auth.uid()
);

CREATE POLICY "Users can update their own external APIs" 
ON public.external_api_registry
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  created_by = auth.uid()
);

CREATE POLICY "Users can delete their own external APIs" 
ON public.external_api_registry
FOR DELETE USING (
  auth.uid() IS NOT NULL AND 
  created_by = auth.uid()
);
