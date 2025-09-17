-- Create MCP configurations table for flexible table-agnostic MCP setups
CREATE TABLE public.mcp_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  mcp_type TEXT NOT NULL CHECK (mcp_type IN ('database', 'api', 'memory', 'file', 'hybrid')),
  tables TEXT[] NOT NULL DEFAULT '{}',
  schema_name TEXT NOT NULL DEFAULT 'public',
  permissions JSONB NOT NULL DEFAULT '{"read": true, "write": false, "delete": false}',
  filters JSONB DEFAULT '{}',
  api_endpoints JSONB DEFAULT '{}',
  memory_config JSONB DEFAULT '{}',
  hybrid_config JSONB DEFAULT '{}',
  module_context TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.mcp_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own MCP configurations" 
ON public.mcp_configurations 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own MCP configurations" 
ON public.mcp_configurations 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own MCP configurations" 
ON public.mcp_configurations 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own MCP configurations" 
ON public.mcp_configurations 
FOR DELETE 
USING (auth.uid() = created_by);

-- Create indexes for performance
CREATE INDEX idx_mcp_configurations_module_context ON public.mcp_configurations(module_context);
CREATE INDEX idx_mcp_configurations_mcp_type ON public.mcp_configurations(mcp_type);
CREATE INDEX idx_mcp_configurations_created_by ON public.mcp_configurations(created_by);

-- Create trigger for updated_at
CREATE TRIGGER update_mcp_configurations_updated_at
BEFORE UPDATE ON public.mcp_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();