-- Create workflow tracing and monitoring tables

-- Table for storing workflow execution traces
CREATE TABLE IF NOT EXISTS workflow_execution_traces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID,
    session_id UUID REFERENCES agent_sessions(id),
    trace_id TEXT NOT NULL UNIQUE,
    arize_trace_id TEXT,
    status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'error', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_duration_ms INTEGER,
    node_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for storing individual node execution steps
CREATE TABLE IF NOT EXISTS workflow_execution_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id UUID NOT NULL REFERENCES workflow_execution_traces(id) ON DELETE CASCADE,
    step_index INTEGER NOT NULL,
    node_id TEXT NOT NULL,
    node_name TEXT NOT NULL,
    node_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'error', 'skipped')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    error_details JSONB,
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for Arize integration configuration
CREATE TABLE IF NOT EXISTS arize_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    organization_key TEXT,
    space_key TEXT,
    model_id TEXT,
    model_version TEXT DEFAULT '1.0.0',
    is_enabled BOOLEAN DEFAULT false,
    log_level TEXT DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error')),
    sampling_rate DECIMAL(3,2) DEFAULT 1.0 CHECK (sampling_rate >= 0 AND sampling_rate <= 1),
    api_endpoint TEXT DEFAULT 'https://api.arize.com/v1',
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Table for storing workflow performance metrics
CREATE TABLE IF NOT EXISTS workflow_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID,
    session_id UUID REFERENCES agent_sessions(id),
    metric_type TEXT NOT NULL CHECK (metric_type IN ('latency', 'throughput', 'error_rate', 'success_rate', 'cost', 'accuracy')),
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit TEXT NOT NULL,
    measurement_window TEXT DEFAULT '1h',
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflow_traces_session ON workflow_execution_traces(session_id);
CREATE INDEX IF NOT EXISTS idx_workflow_traces_status ON workflow_execution_traces(status);
CREATE INDEX IF NOT EXISTS idx_workflow_traces_created_by ON workflow_execution_traces(created_by);
CREATE INDEX IF NOT EXISTS idx_workflow_traces_started_at ON workflow_execution_traces(started_at);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_trace ON workflow_execution_steps(trace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_status ON workflow_execution_steps(status);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_node_type ON workflow_execution_steps(node_type);

CREATE INDEX IF NOT EXISTS idx_arize_config_user ON arize_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_arize_config_enabled ON arize_configurations(is_enabled);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_session ON workflow_performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON workflow_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_measured_at ON workflow_performance_metrics(measured_at);

-- RLS Policies
ALTER TABLE workflow_execution_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE arize_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Users can manage their own workflow traces
CREATE POLICY "Users can manage their workflow traces" ON workflow_execution_traces
    FOR ALL USING (created_by = auth.uid());

-- Users can view steps for their traces
CREATE POLICY "Users can view their workflow steps" ON workflow_execution_steps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM workflow_execution_traces 
            WHERE id = workflow_execution_steps.trace_id 
            AND created_by = auth.uid()
        )
    );

-- Users can manage their Arize configuration
CREATE POLICY "Users can manage their Arize config" ON arize_configurations
    FOR ALL USING (user_id = auth.uid());

-- Users can view their performance metrics
CREATE POLICY "Users can view their performance metrics" ON workflow_performance_metrics
    FOR ALL USING (
        session_id IN (
            SELECT id FROM agent_sessions WHERE user_id = auth.uid()
        )
    );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_workflow_trace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION update_arize_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_workflow_traces_updated_at
    BEFORE UPDATE ON workflow_execution_traces
    FOR EACH ROW
    EXECUTE FUNCTION update_workflow_trace_updated_at();

CREATE TRIGGER update_arize_configurations_updated_at
    BEFORE UPDATE ON arize_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_arize_config_updated_at();