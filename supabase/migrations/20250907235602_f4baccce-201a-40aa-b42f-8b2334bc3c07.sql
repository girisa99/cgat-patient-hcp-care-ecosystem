-- Create workflow_templates table for dedicated workflow templates
CREATE TABLE public.workflow_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general'::text,
  industry TEXT,
  template_type TEXT NOT NULL DEFAULT 'workflow'::text,
  workflow_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  nodes_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges_config JSONB NOT NULL DEFAULT '[]'::jsonb,
  template_metadata JSONB DEFAULT '{}'::jsonb,
  version TEXT NOT NULL DEFAULT '1.0.0'::text,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tags TEXT[] DEFAULT '{}',
  complexity_level TEXT DEFAULT 'beginner'::text,
  estimated_completion_time INTEGER DEFAULT 30
);

-- Enable RLS
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public templates are viewable by everyone" 
ON public.workflow_templates 
FOR SELECT 
USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create their own templates" 
ON public.workflow_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own templates" 
ON public.workflow_templates 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" 
ON public.workflow_templates 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX idx_workflow_templates_category ON public.workflow_templates(category);
CREATE INDEX idx_workflow_templates_industry ON public.workflow_templates(industry);
CREATE INDEX idx_workflow_templates_tags ON public.workflow_templates USING GIN(tags);
CREATE INDEX idx_workflow_templates_public ON public.workflow_templates(is_public, is_featured);

-- Create trigger for updated_at
CREATE TRIGGER update_workflow_templates_updated_at
  BEFORE UPDATE ON public.workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample workflow templates
INSERT INTO public.workflow_templates (name, description, category, industry, template_type, workflow_data, nodes_config, edges_config, tags, complexity_level, created_by) VALUES
('Customer Onboarding', 'Complete customer onboarding workflow with validation and notification steps', 'business', 'general', 'workflow', 
 '{"workflow_type": "sequential", "auto_start": false}',
 '[{"id": "start", "type": "trigger", "position": {"x": 100, "y": 100}}, {"id": "validate", "type": "validation", "position": {"x": 300, "y": 100}}, {"id": "notify", "type": "notification", "position": {"x": 500, "y": 100}}]',
 '[{"id": "e1", "source": "start", "target": "validate"}, {"id": "e2", "source": "validate", "target": "notify"}]',
 '{"onboarding", "customer", "validation", "notification"}', 'beginner', null),

('Healthcare Patient Intake', 'Streamlined patient intake process with medical history validation', 'healthcare', 'healthcare', 'workflow',
 '{"workflow_type": "conditional", "auto_start": true}',
 '[{"id": "intake", "type": "data_collection", "position": {"x": 100, "y": 100}}, {"id": "medical_history", "type": "validation", "position": {"x": 300, "y": 100}}, {"id": "assignment", "type": "assignment", "position": {"x": 500, "y": 100}}]',
 '[{"id": "e1", "source": "intake", "target": "medical_history"}, {"id": "e2", "source": "medical_history", "target": "assignment"}]',
 '{"healthcare", "patient", "intake", "medical"}', 'intermediate', null),

('Data Processing Pipeline', 'Automated data processing with validation, transformation, and storage', 'automation', 'technology', 'workflow',
 '{"workflow_type": "pipeline", "auto_start": false}',
 '[{"id": "input", "type": "data_input", "position": {"x": 100, "y": 100}}, {"id": "validate", "type": "validation", "position": {"x": 250, "y": 100}}, {"id": "transform", "type": "transformation", "position": {"x": 400, "y": 100}}, {"id": "store", "type": "storage", "position": {"x": 550, "y": 100}}]',
 '[{"id": "e1", "source": "input", "target": "validate"}, {"id": "e2", "source": "validate", "target": "transform"}, {"id": "e3", "source": "transform", "target": "store"}]',
 '{"data", "processing", "pipeline", "automation"}', 'advanced', null);