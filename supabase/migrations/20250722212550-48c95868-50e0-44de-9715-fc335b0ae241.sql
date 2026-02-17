-- Create the agent_session_tasks table
CREATE TABLE public.agent_session_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  action_id TEXT NOT NULL,
  task_name TEXT NOT NULL,
  task_description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('action', 'workflow_step', 'connector')),
  task_order INTEGER NOT NULL DEFAULT 0,
  required_inputs JSONB DEFAULT '[]'::jsonb,
  expected_outputs JSONB DEFAULT '[]'::jsonb,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  timeout_minutes INTEGER DEFAULT 5,
  retry_attempts INTEGER DEFAULT 3,
  is_critical BOOLEAN DEFAULT false,
  ai_model_id TEXT,
  mcp_server_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agent_session_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for agent_session_tasks
CREATE POLICY "Users can view their own agent session tasks" 
ON public.agent_session_tasks 
FOR SELECT 
USING (auth.uid()::text = session_id OR auth.uid()::text IN (
  SELECT created_by FROM agents WHERE id = session_id
));

CREATE POLICY "Users can create their own agent session tasks" 
ON public.agent_session_tasks 
FOR INSERT 
WITH CHECK (auth.uid()::text = session_id OR auth.uid()::text IN (
  SELECT created_by FROM agents WHERE id = session_id
));

CREATE POLICY "Users can update their own agent session tasks" 
ON public.agent_session_tasks 
FOR UPDATE 
USING (auth.uid()::text = session_id OR auth.uid()::text IN (
  SELECT created_by FROM agents WHERE id = session_id
));

CREATE POLICY "Users can delete their own agent session tasks" 
ON public.agent_session_tasks 
FOR DELETE 
USING (auth.uid()::text = session_id OR auth.uid()::text IN (
  SELECT created_by FROM agents WHERE id = session_id
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_agent_session_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agent_session_tasks_updated_at
  BEFORE UPDATE ON public.agent_session_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_session_tasks_updated_at();

-- Add indexes for better performance
CREATE INDEX idx_agent_session_tasks_session_id ON public.agent_session_tasks(session_id);
CREATE INDEX idx_agent_session_tasks_task_order ON public.agent_session_tasks(task_order);
CREATE INDEX idx_agent_session_tasks_task_type ON public.agent_session_tasks(task_type);