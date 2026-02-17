-- Create agent templates table for storing white-label configurations
CREATE TABLE public.agent_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL DEFAULT 'custom',
  logo_url TEXT,
  tagline TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#8b5cf6',
  accent_color TEXT DEFAULT '#06b6d4',
  configuration JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agents table for storing actual agent instances
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  purpose TEXT,
  use_case TEXT,
  agent_type TEXT DEFAULT 'single',
  template_id UUID REFERENCES public.agent_templates(id),
  status TEXT DEFAULT 'draft',
  configuration JSONB DEFAULT '{}'::jsonb,
  deployment_config JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent knowledge base association table
CREATE TABLE public.agent_knowledge_bases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  knowledge_base_id UUID NOT NULL REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_knowledge_bases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agent_templates
CREATE POLICY "Users can view all templates" 
ON public.agent_templates 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own templates" 
ON public.agent_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" 
ON public.agent_templates 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" 
ON public.agent_templates 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for agents
CREATE POLICY "Users can view their own agents" 
ON public.agents 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own agents" 
ON public.agents 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own agents" 
ON public.agents 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own agents" 
ON public.agents 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for agent_knowledge_bases
CREATE POLICY "Users can manage their agent knowledge bases" 
ON public.agent_knowledge_bases 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.agents 
    WHERE agents.id = agent_knowledge_bases.agent_id 
    AND agents.created_by = auth.uid()
  )
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_agent_templates_updated_at
  BEFORE UPDATE ON public.agent_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.agent_templates (name, description, template_type, tagline, is_default) VALUES
('Healthcare Assistant', 'General healthcare support and information', 'healthcare', 'Your AI Healthcare Companion', true),
('Patient Support', 'Patient engagement and support services', 'patient', 'Supporting Your Health Journey', true),
('Clinical Research', 'Clinical trial and research assistance', 'research', 'Advancing Healthcare Through Research', true),
('Regulatory Compliance', 'Compliance and regulatory guidance', 'compliance', 'Ensuring Regulatory Excellence', true),
('Custom Agent', 'Start from scratch with full customization', 'custom', 'Built For Your Unique Needs', true);