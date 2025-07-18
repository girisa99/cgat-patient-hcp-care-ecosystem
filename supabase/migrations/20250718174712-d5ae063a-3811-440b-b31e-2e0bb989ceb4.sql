-- Enhance agents table with category mapping and organizational association
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS business_units TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS organization_id UUID,
ADD COLUMN IF NOT EXISTS facility_id UUID;

-- Create agent_user_associations table for tracking roles and access
CREATE TABLE IF NOT EXISTS public.agent_user_associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  access_level TEXT DEFAULT 'read',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, user_id)
);

-- Create agent_organization_mapping table for organizational context
CREATE TABLE IF NOT EXISTS public.agent_organization_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  organization_id UUID,
  facility_id UUID,
  business_unit TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agent_id, organization_id, facility_id)
);

-- Enable RLS on new tables
ALTER TABLE public.agent_user_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_organization_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_user_associations
CREATE POLICY "Users can view their own agent associations" 
ON public.agent_user_associations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent associations" 
ON public.agent_user_associations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent associations" 
ON public.agent_user_associations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent associations" 
ON public.agent_user_associations 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for agent_organization_mapping
CREATE POLICY "Users can view organization mapping for their agents" 
ON public.agent_organization_mapping 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.agents 
  WHERE agents.id = agent_organization_mapping.agent_id 
  AND agents.created_by = auth.uid()
));

CREATE POLICY "Users can create organization mapping for their agents" 
ON public.agent_organization_mapping 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.agents 
  WHERE agents.id = agent_organization_mapping.agent_id 
  AND agents.created_by = auth.uid()
));

CREATE POLICY "Users can update organization mapping for their agents" 
ON public.agent_organization_mapping 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.agents 
  WHERE agents.id = agent_organization_mapping.agent_id 
  AND agents.created_by = auth.uid()
));

CREATE POLICY "Users can delete organization mapping for their agents" 
ON public.agent_organization_mapping 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.agents 
  WHERE agents.id = agent_organization_mapping.agent_id 
  AND agents.created_by = auth.uid()
));

-- Add triggers for updated_at columns
CREATE TRIGGER update_agent_user_associations_updated_at
BEFORE UPDATE ON public.agent_user_associations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing agents table to include category fields in configuration if needed
UPDATE public.agents 
SET configuration = jsonb_set(
  COALESCE(configuration, '{}'::jsonb),
  '{category_mapping}',
  '{"categories": [], "business_units": [], "topics": []}'::jsonb
)
WHERE configuration IS NULL OR NOT (configuration ? 'category_mapping');