-- Add demoUser to the user_role enum
ALTER TYPE user_role ADD VALUE 'demoUser';

-- Create demo user role
INSERT INTO public.roles (name, description, is_default)
VALUES ('demoUser', 'Demo User with read-only access to showcase application functionality', false)
ON CONFLICT (name) DO NOTHING;

-- Create demo modules
INSERT INTO public.modules (name, description, is_active) VALUES
('demo_dashboard', 'Comprehensive dashboard showcasing onboarding and admin capabilities', true),
('demo_agents', 'AI agent management and configuration showcase', true),
('demo_patients', 'Patient management and clinical workflow demonstration', true),
('demo_management', 'User, module, facility, and role management showcase', true),
('demo_technical', 'API services, data import, and testing suite demonstration', true)
ON CONFLICT (name) DO NOTHING;

-- Get the demo user role ID and assign modules
DO $$
DECLARE
    demo_role_id uuid;
    dashboard_module_id uuid;
    agents_module_id uuid;
    patients_module_id uuid;
    management_module_id uuid;
    technical_module_id uuid;
BEGIN
    -- Get role ID
    SELECT id INTO demo_role_id FROM public.roles WHERE name = 'demoUser';
    
    -- Get module IDs
    SELECT id INTO dashboard_module_id FROM public.modules WHERE name = 'demo_dashboard';
    SELECT id INTO agents_module_id FROM public.modules WHERE name = 'demo_agents';
    SELECT id INTO patients_module_id FROM public.modules WHERE name = 'demo_patients';
    SELECT id INTO management_module_id FROM public.modules WHERE name = 'demo_management';
    SELECT id INTO technical_module_id FROM public.modules WHERE name = 'demo_technical';
    
    -- Assign all demo modules to demo role with read access level
    INSERT INTO public.role_module_assignments (role_id, module_id, access_level, is_active, assigned_at)
    VALUES 
        (demo_role_id, dashboard_module_id, 'read', true, now()),
        (demo_role_id, agents_module_id, 'read', true, now()),
        (demo_role_id, patients_module_id, 'read', true, now()),
        (demo_role_id, management_module_id, 'read', true, now()),
        (demo_role_id, technical_module_id, 'read', true, now())
    ON CONFLICT (role_id, module_id) DO NOTHING;
END $$;

-- Create function to check if user is demo user
CREATE OR REPLACE FUNCTION public.is_demo_user(check_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = check_user_id
    AND r.name = 'demoUser'
  );
$$;