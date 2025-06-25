
-- Create audit_logs table for tracking all system activities
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature_flags table for managing system features
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  target_roles user_role[],
  target_facilities UUID[],
  configuration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_facility_access table for staff cross-facility access
CREATE TABLE public.user_facility_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  access_level VARCHAR(50) NOT NULL, -- 'read', 'write', 'admin'
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, facility_id)
);

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_user_facility_access_user ON user_facility_access(user_id);
CREATE INDEX idx_user_facility_access_facility ON user_facility_access(facility_id);

-- Enable RLS on all new tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_facility_access ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_logs
CREATE POLICY "Super admins can view all audit logs" ON audit_logs
  FOR SELECT USING (has_role(auth.uid(), 'superAdmin'));

CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- Create RLS policies for feature_flags
CREATE POLICY "Authenticated users can view feature flags" ON feature_flags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can manage feature flags" ON feature_flags
  FOR ALL USING (has_role(auth.uid(), 'superAdmin'));

-- Create RLS policies for user_facility_access
CREATE POLICY "Users can view their facility access" ON user_facility_access
  FOR SELECT USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'superAdmin')
    OR has_role(auth.uid(), 'onboardingTeam')
  );

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address
  )
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW) 
         WHEN TG_OP = 'UPDATE' THEN to_jsonb(NEW) 
         ELSE NULL END,
    current_setting('request.headers', true)::json->>'x-forwarded-for'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create audit triggers for key tables
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create function for user accessible facilities
CREATE OR REPLACE FUNCTION public.get_user_accessible_facilities(user_id UUID)
RETURNS TABLE (
  facility_id UUID,
  facility_name VARCHAR(255),
  access_level VARCHAR(50)
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 
    f.id,
    f.name,
    COALESCE(ufa.access_level, 'read') as access_level
  FROM public.facilities f
  LEFT JOIN public.user_facility_access ufa ON f.id = ufa.facility_id AND ufa.user_id = user_id AND ufa.is_active = true
  LEFT JOIN public.profiles p ON p.id = user_id
  WHERE f.is_active = true
  AND (
    p.facility_id = f.id
    OR ufa.facility_id IS NOT NULL
    OR EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON r.id = ur.role_id WHERE ur.user_id = user_id AND r.name = 'superAdmin')
  );
$$;
