-- Create system_connectors table
CREATE TABLE IF NOT EXISTS public.system_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('database', 'api', 'messaging', 'external_service', 'ai_model', 'file_system')),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'testing', 'error')),
  base_url TEXT,
  auth_type TEXT NOT NULL,
  configuration JSONB DEFAULT '{}',
  endpoints JSONB DEFAULT '[]',
  usage_count INTEGER DEFAULT 0,
  success_rate INTEGER DEFAULT 0,
  last_tested TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create connector_activity_logs table
CREATE TABLE IF NOT EXISTS public.connector_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id UUID REFERENCES public.system_connectors(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_description TEXT,
  status TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create connector_assignments table
CREATE TABLE IF NOT EXISTS public.connector_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_session_id UUID NOT NULL,
  connector_id UUID REFERENCES public.system_connectors(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('action', 'workflow_step', 'connector')),
  assignment_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.system_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connector_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connector_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_connectors
CREATE POLICY "Users can view their own connectors" ON public.system_connectors
FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own connectors" ON public.system_connectors
FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own connectors" ON public.system_connectors
FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own connectors" ON public.system_connectors
FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for connector_activity_logs
CREATE POLICY "Users can view activity logs for their connectors" ON public.connector_activity_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.system_connectors 
    WHERE id = connector_activity_logs.connector_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "System can insert activity logs" ON public.connector_activity_logs
FOR INSERT WITH CHECK (true);

-- RLS Policies for connector_assignments
CREATE POLICY "Users can manage their own connector assignments" ON public.connector_assignments
FOR ALL USING (auth.uid() = created_by);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_connectors_updated_at
  BEFORE UPDATE ON public.system_connectors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connector_assignments_updated_at
  BEFORE UPDATE ON public.connector_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();