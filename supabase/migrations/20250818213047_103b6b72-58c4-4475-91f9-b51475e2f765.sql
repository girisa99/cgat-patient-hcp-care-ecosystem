-- Create security_alerts table for monitoring suspicious activities
CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type TEXT NOT NULL CHECK (alert_type IN ('suspicious_access', 'failed_auth', 'data_breach', 'unusual_pattern')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    resource_accessed TEXT,
    alert_details JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_security_alerts_alert_type ON public.security_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_user_id ON public.security_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON public.security_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_security_alerts_status ON public.security_alerts(status);

-- Enable RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can view all security alerts" 
ON public.security_alerts FOR SELECT 
USING (is_admin_user_safe(auth.uid()));

CREATE POLICY "Admins can manage security alerts" 
ON public.security_alerts FOR ALL 
USING (is_admin_user_safe(auth.uid())) 
WITH CHECK (is_admin_user_safe(auth.uid()));

-- System can insert alerts (for the edge function)
CREATE POLICY "System can insert security alerts" 
ON public.security_alerts FOR INSERT 
WITH CHECK (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_security_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_security_alerts_updated_at
    BEFORE UPDATE ON public.security_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_security_alerts_updated_at();