
-- Enable RLS on external_api_registry if not already enabled
ALTER TABLE public.external_api_registry ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for external_api_registry
CREATE POLICY IF NOT EXISTS "Users can view external APIs they created or published ones" 
ON public.external_api_registry
FOR SELECT USING (
  created_by = auth.uid() OR 
  status = 'published' OR
  visibility IN ('public', 'marketplace')
);

CREATE POLICY IF NOT EXISTS "Users can insert their own external APIs" 
ON public.external_api_registry
FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update their own external APIs" 
ON public.external_api_registry
FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete their own external APIs" 
ON public.external_api_registry
FOR DELETE USING (created_by = auth.uid());
