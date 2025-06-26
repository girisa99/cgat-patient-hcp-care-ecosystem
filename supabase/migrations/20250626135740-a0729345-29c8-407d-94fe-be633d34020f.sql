
-- Phase 1: Enhanced API Classification System
-- Add new columns to existing tables for better API classification

-- Enhance api_change_tracking with direction and lifecycle fields
ALTER TABLE public.api_change_tracking 
ADD COLUMN direction TEXT CHECK (direction IN ('inbound', 'outbound', 'bidirectional')) DEFAULT 'inbound',
ADD COLUMN lifecycle_stage TEXT CHECK (lifecycle_stage IN ('development', 'staging', 'production', 'deprecated')) DEFAULT 'development',
ADD COLUMN impact_assessment JSONB DEFAULT '{}',
ADD COLUMN migration_notes TEXT;

-- Create API integration registry table for comprehensive tracking
CREATE TABLE public.api_integration_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'bidirectional')),
  type TEXT NOT NULL CHECK (type IN ('internal', 'external')),
  purpose TEXT NOT NULL CHECK (purpose IN ('consuming', 'publishing', 'hybrid')),
  category TEXT NOT NULL CHECK (category IN ('healthcare', 'auth', 'data', 'integration', 'utility')),
  base_url TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'deprecated', 'maintenance')) DEFAULT 'active',
  lifecycle_stage TEXT NOT NULL CHECK (lifecycle_stage IN ('development', 'staging', 'production', 'deprecated')) DEFAULT 'development',
  endpoints_count INTEGER DEFAULT 0,
  rls_policies_count INTEGER DEFAULT 0,
  data_mappings_count INTEGER DEFAULT 0,
  documentation_url TEXT,
  contact_info JSONB DEFAULT '{}',
  sla_requirements JSONB DEFAULT '{}',
  security_requirements JSONB DEFAULT '{}',
  rate_limits JSONB DEFAULT '{}',
  webhook_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  last_modified_by UUID
);

-- Create API lifecycle events table for tracking changes
CREATE TABLE public.api_lifecycle_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_integration_id UUID NOT NULL REFERENCES public.api_integration_registry(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'deprecated', 'activated', 'deactivated', 'version_released', 'breaking_change')),
  from_stage TEXT,
  to_stage TEXT,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  impact_level TEXT NOT NULL CHECK (impact_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  requires_migration BOOLEAN DEFAULT FALSE,
  migration_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create API consumption tracking table
CREATE TABLE public.api_consumption_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_integration_id UUID NOT NULL REFERENCES public.api_integration_registry(id) ON DELETE CASCADE,
  endpoint_path TEXT NOT NULL,
  method TEXT NOT NULL,
  consumer_id UUID,
  request_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_status INTEGER,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  error_details JSONB,
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on new tables
ALTER TABLE public.api_integration_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_consumption_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for API integration registry
CREATE POLICY "Admins can manage API integration registry"
  ON public.api_integration_registry
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'superAdmin'
    )
  );

-- Create RLS policies for lifecycle events
CREATE POLICY "Admins can manage API lifecycle events"
  ON public.api_lifecycle_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'superAdmin'
    )
  );

-- Create RLS policies for consumption logs (admins and API consumers)
CREATE POLICY "Admins and consumers can view API consumption logs"
  ON public.api_consumption_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'superAdmin'
    ) OR consumer_id = auth.uid()
  );

-- Add updated_at trigger to api_integration_registry
CREATE TRIGGER update_api_integration_registry_updated_at
  BEFORE UPDATE ON public.api_integration_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_api_integration_registry_direction ON public.api_integration_registry(direction);
CREATE INDEX idx_api_integration_registry_type ON public.api_integration_registry(type);
CREATE INDEX idx_api_integration_registry_purpose ON public.api_integration_registry(purpose);
CREATE INDEX idx_api_integration_registry_status ON public.api_integration_registry(status);
CREATE INDEX idx_api_lifecycle_events_api_id ON public.api_lifecycle_events(api_integration_id);
CREATE INDEX idx_api_consumption_logs_api_id ON public.api_consumption_logs(api_integration_id);
CREATE INDEX idx_api_consumption_logs_timestamp ON public.api_consumption_logs(request_timestamp);
