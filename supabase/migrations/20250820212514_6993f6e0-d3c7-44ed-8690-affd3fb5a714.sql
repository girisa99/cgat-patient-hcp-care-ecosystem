-- Create workflow libraries table
CREATE TABLE public.workflow_libraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  category TEXT NOT NULL CHECK (category IN ('utility', 'ai', 'data', 'api', 'ui', 'security', 'healthcare', 'integration')),
  author TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  documentation_url TEXT,
  repository_url TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  is_installed BOOLEAN DEFAULT false,
  is_core BOOLEAN DEFAULT false,
  is_custom BOOLEAN DEFAULT false,
  configuration JSONB DEFAULT '{}'::JSONB,
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[],
  examples JSONB DEFAULT '[]'::JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow actions table
CREATE TABLE public.workflow_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('transform', 'validate', 'calculate', 'request', 'condition', 'loop', 'trigger', 'notification')),
  category TEXT NOT NULL,
  code TEXT,
  inputs JSONB DEFAULT '[]'::JSONB,
  outputs JSONB DEFAULT '[]'::JSONB,
  parameters JSONB DEFAULT '{}'::JSONB,
  validation_rules JSONB DEFAULT '{}'::JSONB,
  is_custom BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  average_execution_time_ms INTEGER DEFAULT 0,
  library_id UUID REFERENCES public.workflow_libraries(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow operators table  
CREATE TABLE public.workflow_operators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('arithmetic', 'comparison', 'logical', 'string', 'array', 'object', 'date', 'math')),
  syntax TEXT NOT NULL,
  examples TEXT[] DEFAULT ARRAY[]::TEXT[],
  precedence INTEGER DEFAULT 1,
  is_binary BOOLEAN DEFAULT true,
  return_type TEXT DEFAULT 'boolean',
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow connections table for tracking node connections
CREATE TABLE public.workflow_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL,
  source_node_id TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  library_id UUID REFERENCES public.workflow_libraries(id) ON DELETE SET NULL,
  action_id UUID REFERENCES public.workflow_actions(id) ON DELETE SET NULL,
  operator_id UUID REFERENCES public.workflow_operators(id) ON DELETE SET NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('library', 'action', 'operator')),
  configuration JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workflow_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workflow_libraries
CREATE POLICY "Users can view all libraries" 
ON public.workflow_libraries FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own libraries" 
ON public.workflow_libraries FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own libraries" 
ON public.workflow_libraries FOR UPDATE 
USING (auth.uid() = created_by OR is_core = false);

CREATE POLICY "Users can delete their own custom libraries" 
ON public.workflow_libraries FOR DELETE 
USING (auth.uid() = created_by AND is_custom = true);

-- Create RLS policies for workflow_actions
CREATE POLICY "Users can view all actions" 
ON public.workflow_actions FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own actions" 
ON public.workflow_actions FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own actions" 
ON public.workflow_actions FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own custom actions" 
ON public.workflow_actions FOR DELETE 
USING (auth.uid() = created_by AND is_custom = true);

-- Create RLS policies for workflow_operators
CREATE POLICY "Users can view all operators" 
ON public.workflow_operators FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own operators" 
ON public.workflow_operators FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own operators" 
ON public.workflow_operators FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own operators" 
ON public.workflow_operators FOR DELETE 
USING (auth.uid() = created_by);

-- Create RLS policies for workflow_connections
CREATE POLICY "Users can manage their own workflow connections" 
ON public.workflow_connections FOR ALL 
USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX idx_workflow_libraries_category ON public.workflow_libraries(category);
CREATE INDEX idx_workflow_libraries_author ON public.workflow_libraries(author);
CREATE INDEX idx_workflow_libraries_created_by ON public.workflow_libraries(created_by);

CREATE INDEX idx_workflow_actions_type ON public.workflow_actions(type);
CREATE INDEX idx_workflow_actions_category ON public.workflow_actions(category);
CREATE INDEX idx_workflow_actions_library_id ON public.workflow_actions(library_id);
CREATE INDEX idx_workflow_actions_created_by ON public.workflow_actions(created_by);

CREATE INDEX idx_workflow_operators_category ON public.workflow_operators(category);
CREATE INDEX idx_workflow_operators_symbol ON public.workflow_operators(symbol);
CREATE INDEX idx_workflow_operators_created_by ON public.workflow_operators(created_by);

CREATE INDEX idx_workflow_connections_workflow_id ON public.workflow_connections(workflow_id);
CREATE INDEX idx_workflow_connections_source_node ON public.workflow_connections(source_node_id);
CREATE INDEX idx_workflow_connections_target_node ON public.workflow_connections(target_node_id);

-- Create triggers for updated_at
CREATE TRIGGER update_workflow_libraries_updated_at
  BEFORE UPDATE ON public.workflow_libraries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_actions_updated_at
  BEFORE UPDATE ON public.workflow_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_operators_updated_at
  BEFORE UPDATE ON public.workflow_operators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflow_connections_updated_at
  BEFORE UPDATE ON public.workflow_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();