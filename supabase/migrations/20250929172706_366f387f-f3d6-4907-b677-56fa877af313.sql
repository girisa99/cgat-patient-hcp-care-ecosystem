-- Add tracking tables for Genie instances

-- Genie conversation tracking (extends agent_conversations)
CREATE TABLE IF NOT EXISTS public.genie_conversation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  brand_config_id UUID REFERENCES public.genie_brand_configs(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  user_ip_address INET,
  user_agent TEXT,
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  models_used JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  average_response_time_ms INTEGER,
  escalation_requested BOOLEAN DEFAULT FALSE,
  privacy_consent_given BOOLEAN DEFAULT FALSE,
  cookies_accepted BOOLEAN DEFAULT FALSE,
  deployment_type TEXT CHECK (deployment_type IN ('public', 'internal', 'mcp', 'embedded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genie rate limiting tracking
CREATE TABLE IF NOT EXISTS public.genie_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- Could be IP, session_id, or user_id
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('ip_address', 'session_id', 'user_id', 'api_key')),
  brand_config_id UUID REFERENCES public.genie_brand_configs(id) ON DELETE CASCADE,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE,
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMP WITH TIME ZONE,
  block_reason TEXT,
  last_request_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(identifier, identifier_type, brand_config_id, window_start)
);

-- Genie IP address tracking and reputation
CREATE TABLE IF NOT EXISTS public.genie_ip_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  brand_config_id UUID REFERENCES public.genie_brand_configs(id) ON DELETE CASCADE,
  total_requests INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  blocked_count INTEGER DEFAULT 0,
  last_blocked_at TIMESTAMP WITH TIME ZONE,
  reputation_score NUMERIC(3,2) DEFAULT 1.00, -- 0.00 to 1.00
  is_whitelisted BOOLEAN DEFAULT FALSE,
  is_blacklisted BOOLEAN DEFAULT FALSE,
  country_code VARCHAR(2),
  region TEXT,
  city TEXT,
  isp TEXT,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ip_address, brand_config_id)
);

-- Genie deployment tracking (links configs to deployment locations)
CREATE TABLE IF NOT EXISTS public.genie_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_config_id UUID REFERENCES public.genie_brand_configs(id) ON DELETE CASCADE NOT NULL,
  deployment_name TEXT NOT NULL,
  deployment_type TEXT NOT NULL CHECK (deployment_type IN ('public', 'internal', 'mcp', 'embedded')),
  deployment_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'degraded', 'down', 'unknown')),
  last_health_check TIMESTAMP WITH TIME ZONE,
  total_conversations INTEGER DEFAULT 0,
  active_conversations INTEGER DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  error_rate NUMERIC(5,2) DEFAULT 0.00,
  average_response_time_ms INTEGER,
  deployed_by UUID REFERENCES auth.users(id),
  deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_genie_conv_analytics_brand ON public.genie_conversation_analytics(brand_config_id);
CREATE INDEX idx_genie_conv_analytics_session ON public.genie_conversation_analytics(session_id);
CREATE INDEX idx_genie_conv_analytics_ip ON public.genie_conversation_analytics(user_ip_address);
CREATE INDEX idx_genie_conv_analytics_started ON public.genie_conversation_analytics(started_at DESC);

CREATE INDEX idx_genie_rate_limits_identifier ON public.genie_rate_limits(identifier, identifier_type);
CREATE INDEX idx_genie_rate_limits_brand ON public.genie_rate_limits(brand_config_id);
CREATE INDEX idx_genie_rate_limits_window ON public.genie_rate_limits(window_start, window_end);

CREATE INDEX idx_genie_ip_tracking_ip ON public.genie_ip_tracking(ip_address);
CREATE INDEX idx_genie_ip_tracking_brand ON public.genie_ip_tracking(brand_config_id);
CREATE INDEX idx_genie_ip_tracking_reputation ON public.genie_ip_tracking(reputation_score);

CREATE INDEX idx_genie_deployments_brand ON public.genie_deployments(brand_config_id);
CREATE INDEX idx_genie_deployments_type ON public.genie_deployments(deployment_type);
CREATE INDEX idx_genie_deployments_active ON public.genie_deployments(is_active);

-- Enable Row Level Security
ALTER TABLE public.genie_conversation_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_ip_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for genie_conversation_analytics
CREATE POLICY "Users can view their own conversation analytics"
  ON public.genie_conversation_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_conversations ac
      WHERE ac.id = genie_conversation_analytics.conversation_id
      AND ac.user_id = auth.uid()
    )
    OR is_admin_user_safe(auth.uid())
  );

CREATE POLICY "System can insert conversation analytics"
  ON public.genie_conversation_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update conversation analytics"
  ON public.genie_conversation_analytics
  FOR UPDATE
  USING (true);

-- RLS Policies for genie_rate_limits
CREATE POLICY "Admins can view all rate limits"
  ON public.genie_rate_limits
  FOR SELECT
  USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "System can manage rate limits"
  ON public.genie_rate_limits
  FOR ALL
  USING (true);

-- RLS Policies for genie_ip_tracking
CREATE POLICY "Admins can view all IP tracking"
  ON public.genie_ip_tracking
  FOR SELECT
  USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "System can manage IP tracking"
  ON public.genie_ip_tracking
  FOR ALL
  USING (true);

-- RLS Policies for genie_deployments
CREATE POLICY "Users can view deployments for their brands"
  ON public.genie_deployments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.genie_brand_configs gbc
      WHERE gbc.id = genie_deployments.brand_config_id
      AND (gbc.created_by = auth.uid() OR is_admin_user_safe(auth.uid()))
    )
  );

CREATE POLICY "Admins can manage deployments"
  ON public.genie_deployments
  FOR ALL
  USING (is_admin_user_safe(auth.uid()))
  WITH CHECK (is_admin_user_safe(auth.uid()));

-- Function to update conversation analytics
CREATE OR REPLACE FUNCTION public.update_genie_conversation_analytics()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update rate limit tracking
CREATE OR REPLACE FUNCTION public.update_genie_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update IP tracking
CREATE OR REPLACE FUNCTION public.update_genie_ip_tracking()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_seen_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update deployment tracking
CREATE OR REPLACE FUNCTION public.update_genie_deployments()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers
CREATE TRIGGER update_genie_conversation_analytics_updated_at
  BEFORE UPDATE ON public.genie_conversation_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_genie_conversation_analytics();

CREATE TRIGGER update_genie_rate_limits_updated_at
  BEFORE UPDATE ON public.genie_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_genie_rate_limits();

CREATE TRIGGER update_genie_ip_tracking_updated_at
  BEFORE UPDATE ON public.genie_ip_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_genie_ip_tracking();

CREATE TRIGGER update_genie_deployments_updated_at
  BEFORE UPDATE ON public.genie_deployments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_genie_deployments();