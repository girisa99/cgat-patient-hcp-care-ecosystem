
-- Create modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create module permissions junction table
CREATE TABLE public.module_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(module_id, permission_id)
);

-- Create user module assignments
CREATE TABLE public.user_module_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, module_id)
);

-- Create role module assignments
CREATE TABLE public.role_module_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(role_id, module_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_module_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for modules (readable by all authenticated users)
CREATE POLICY "Authenticated users can view active modules"
  ON public.modules FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS Policies for module permissions (readable by authenticated users)
CREATE POLICY "Authenticated users can view module permissions"
  ON public.module_permissions FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user module assignments
CREATE POLICY "Users can view their own module assignments"
  ON public.user_module_assignments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage user module assignments"
  ON public.user_module_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- RLS Policies for role module assignments
CREATE POLICY "Admins can manage role module assignments"
  ON public.role_module_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superAdmin', 'onboardingTeam')
    )
  );

-- Function to get user's effective modules (from direct assignment + role assignment)
CREATE OR REPLACE FUNCTION public.get_user_effective_modules(check_user_id UUID)
RETURNS TABLE(
  module_id UUID,
  module_name VARCHAR,
  module_description TEXT,
  source TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Direct user module assignments
  SELECT 
    m.id,
    m.name,
    m.description,
    'direct'::TEXT as source,
    uma.expires_at
  FROM public.user_module_assignments uma
  JOIN public.modules m ON m.id = uma.module_id
  WHERE uma.user_id = check_user_id 
  AND uma.is_active = true
  AND m.is_active = true
  AND (uma.expires_at IS NULL OR uma.expires_at > NOW())
  
  UNION
  
  -- Role-based module assignments
  SELECT DISTINCT
    m.id,
    m.name,
    m.description,
    r.name::TEXT as source,
    NULL::TIMESTAMP WITH TIME ZONE as expires_at
  FROM public.user_roles ur
  JOIN public.roles r ON r.id = ur.role_id
  JOIN public.role_module_assignments rma ON rma.role_id = r.id
  JOIN public.modules m ON m.id = rma.module_id
  WHERE ur.user_id = check_user_id
  AND rma.is_active = true
  AND m.is_active = true
  -- Exclude modules that are directly assigned (to avoid duplicates)
  AND NOT EXISTS (
    SELECT 1 
    FROM public.user_module_assignments uma2
    WHERE uma2.user_id = check_user_id 
    AND uma2.module_id = m.id
    AND uma2.is_active = true
    AND (uma2.expires_at IS NULL OR uma2.expires_at > NOW())
  );
$$;

-- Insert some default modules for common healthcare functionality
INSERT INTO public.modules (name, description) VALUES
('patient_management', 'Patient records and management functionality'),
('facility_administration', 'Facility settings and administration'),
('user_management', 'User and role management capabilities'),
('reporting_analytics', 'Reports and analytics dashboard'),
('onboarding_workflow', 'User and facility onboarding processes');
