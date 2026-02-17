-- Create agent_template_journey_stages table
CREATE TABLE public.agent_template_journey_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  owner_role TEXT,
  entry_criteria JSONB DEFAULT '[]'::jsonb,
  tasks_checklist JSONB DEFAULT '[]'::jsonb,
  expected_duration_minutes INTEGER,
  sla JSONB DEFAULT '{}'::jsonb,
  outputs_success_criteria JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  dependencies JSONB DEFAULT '[]'::jsonb,
  validation_checkpoints JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agent_template_journey_stages ENABLE ROW LEVEL SECURITY;

-- Create policies for journey stages
CREATE POLICY "Users can manage their own template journey stages" 
ON public.agent_template_journey_stages 
FOR ALL 
USING (true);

-- Create index for better performance
CREATE INDEX idx_agent_template_journey_stages_template_id ON public.agent_template_journey_stages(template_id);
CREATE INDEX idx_agent_template_journey_stages_order ON public.agent_template_journey_stages(template_id, order_index);

-- Add trigger for updated_at
CREATE TRIGGER update_agent_template_journey_stages_updated_at
  BEFORE UPDATE ON public.agent_template_journey_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();