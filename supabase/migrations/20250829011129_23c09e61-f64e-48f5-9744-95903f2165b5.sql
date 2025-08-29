-- Create connection analytics table for monitoring incoming/outgoing connections
CREATE TABLE IF NOT EXISTS connection_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  connection_type TEXT CHECK (connection_type IN ('incoming', 'outgoing')) NOT NULL,
  source_node TEXT,
  target_node TEXT,
  connection_status TEXT CHECK (connection_status IN ('active', 'inactive', 'error', 'warning')) NOT NULL,
  latency_ms INTEGER,
  data_size_bytes INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for connection analytics
ALTER TABLE connection_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connection analytics"
  ON connection_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connection analytics"
  ON connection_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connection analytics"
  ON connection_analytics FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_connection_analytics_user_workflow ON connection_analytics(user_id, workflow_id);
CREATE INDEX IF NOT EXISTS idx_connection_analytics_node ON connection_analytics(node_id);
CREATE INDEX IF NOT EXISTS idx_connection_analytics_type ON connection_analytics(connection_type);
CREATE INDEX IF NOT EXISTS idx_connection_analytics_status ON connection_analytics(connection_status);
CREATE INDEX IF NOT EXISTS idx_connection_analytics_created_at ON connection_analytics(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_connection_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER trigger_update_connection_analytics_updated_at
  BEFORE UPDATE ON connection_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_connection_analytics_updated_at();

-- Create network monitoring table for comprehensive connection tracking
CREATE TABLE IF NOT EXISTS network_monitoring (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  monitoring_type TEXT CHECK (monitoring_type IN ('arize', 'custom', 'datadog', 'newrelic', 'prometheus')) NOT NULL,
  trace_id TEXT,
  span_id TEXT,
  operation_name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  status TEXT CHECK (status IN ('running', 'success', 'error', 'timeout')) NOT NULL,
  tags JSONB DEFAULT '{}',
  logs JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for network monitoring
ALTER TABLE network_monitoring ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own network monitoring data"
  ON network_monitoring FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own network monitoring data"
  ON network_monitoring FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for network monitoring
CREATE INDEX IF NOT EXISTS idx_network_monitoring_user_session ON network_monitoring(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_network_monitoring_trace ON network_monitoring(trace_id);
CREATE INDEX IF NOT EXISTS idx_network_monitoring_type ON network_monitoring(monitoring_type);
CREATE INDEX IF NOT EXISTS idx_network_monitoring_status ON network_monitoring(status);
CREATE INDEX IF NOT EXISTS idx_network_monitoring_start_time ON network_monitoring(start_time);