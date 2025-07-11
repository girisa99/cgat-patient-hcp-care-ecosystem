
-- Create user preferences table for routing and general settings
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_route BOOLEAN DEFAULT true,
  preferred_dashboard TEXT DEFAULT 'unified' CHECK (preferred_dashboard IN ('unified', 'module-specific')),
  default_module TEXT,
  theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  security_alerts BOOLEAN DEFAULT true,
  system_updates BOOLEAN DEFAULT true,
  module_updates BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'immediate' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly', 'monthly')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create security settings table
CREATE TABLE public.security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  two_factor_enabled BOOLEAN DEFAULT false,
  session_timeout_minutes INTEGER DEFAULT 480, -- 8 hours
  password_last_changed TIMESTAMP WITH TIME ZONE,
  login_notifications BOOLEAN DEFAULT true,
  suspicious_activity_alerts BOOLEAN DEFAULT true,
  device_tracking BOOLEAN DEFAULT true,
  api_access_logging BOOLEAN DEFAULT true,
  ip_whitelist JSONB DEFAULT '[]'::jsonb,
  trusted_devices JSONB DEFAULT '[]'::jsonb,
  security_questions JSONB DEFAULT '{}'::jsonb,
  backup_codes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user activity log table
CREATE TABLE public.user_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  module_name TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create security events table
CREATE TABLE public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('login_success', 'login_failure', 'password_change', 'mfa_enabled', 'mfa_disabled', 'suspicious_activity', 'account_locked', 'device_added', 'device_removed')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  location JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
  ON public.user_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences" 
  ON public.notification_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" 
  ON public.notification_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" 
  ON public.notification_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for security_settings
CREATE POLICY "Users can view their own security settings" 
  ON public.security_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings" 
  ON public.security_settings FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings" 
  ON public.security_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_activity_logs
CREATE POLICY "Users can view their own activity logs" 
  ON public.user_activity_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs" 
  ON public.user_activity_logs FOR INSERT 
  WITH CHECK (true); -- Allow system to insert logs

-- Create RLS policies for security_events
CREATE POLICY "Users can view their own security events" 
  ON public.security_events FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert security events" 
  ON public.security_events FOR INSERT 
  WITH CHECK (true); -- Allow system to insert events

-- Admins can view all security events
CREATE POLICY "Admins can view all security events" 
  ON public.security_events FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.name = 'superAdmin'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER security_settings_updated_at
  BEFORE UPDATE ON public.security_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to initialize user settings
CREATE OR REPLACE FUNCTION public.initialize_user_settings(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert default user preferences if not exists
  INSERT INTO public.user_preferences (user_id)
  VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert default notification preferences if not exists
  INSERT INTO public.notification_preferences (user_id)
  VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert default security settings if not exists
  INSERT INTO public.security_settings (user_id)
  VALUES (user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_description TEXT,
  p_module_name TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    activity_description,
    module_name,
    metadata,
    ip_address,
    user_agent
  )
  VALUES (
    p_user_id,
    p_activity_type,
    p_activity_description,
    p_module_name,
    p_metadata,
    CASE 
      WHEN current_setting('request.headers', true) IS NOT NULL 
      THEN (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet
      ELSE NULL 
    END,
    CASE 
      WHEN current_setting('request.headers', true) IS NOT NULL 
      THEN current_setting('request.headers', true)::json->>'user-agent'
      ELSE NULL 
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_events (
    user_id,
    event_type,
    severity,
    description,
    metadata,
    ip_address,
    user_agent
  )
  VALUES (
    p_user_id,
    p_event_type,
    p_severity,
    p_description,
    p_metadata,
    CASE 
      WHEN current_setting('request.headers', true) IS NOT NULL 
      THEN (current_setting('request.headers', true)::json->>'x-forwarded-for')::inet
      ELSE NULL 
    END,
    CASE 
      WHEN current_setting('request.headers', true) IS NOT NULL 
      THEN current_setting('request.headers', true)::json->>'user-agent'
      ELSE NULL 
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX idx_security_settings_user_id ON public.security_settings(user_id);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at DESC);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
