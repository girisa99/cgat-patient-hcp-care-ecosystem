-- Create agent_sessions table for save and continue functionality
CREATE TABLE public.agent_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID,
  template_type TEXT DEFAULT 'custom' CHECK (template_type IN ('ai_generated', 'custom', 'system')),
  current_step TEXT NOT NULL DEFAULT 'basic_info' CHECK (current_step IN ('basic_info', 'canvas', 'actions', 'connectors', 'knowledge', 'rag', 'deploy')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'ready_to_deploy', 'deployed')),
  
  -- Session data for each step
  basic_info JSONB DEFAULT '{}',
  canvas JSONB DEFAULT '{}',
  actions JSONB DEFAULT '{}',
  connectors JSONB DEFAULT '{}',
  knowledge JSONB DEFAULT '{}',
  rag JSONB DEFAULT '{}',
  deployment JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own agent sessions" 
ON public.agent_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own agent sessions" 
ON public.agent_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent sessions" 
ON public.agent_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent sessions" 
ON public.agent_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agent_sessions_updated_at
BEFORE UPDATE ON public.agent_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_agent_sessions_user_id ON public.agent_sessions(user_id);
CREATE INDEX idx_agent_sessions_status ON public.agent_sessions(status);
CREATE INDEX idx_agent_sessions_updated_at ON public.agent_sessions(updated_at DESC);