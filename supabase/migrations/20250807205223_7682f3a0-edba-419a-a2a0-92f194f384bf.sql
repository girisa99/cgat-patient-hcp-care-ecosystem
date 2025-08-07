-- Add missing core modules to demoUser role
DO $$
DECLARE
    demo_role_id uuid;
    onboarding_module_id uuid;
    facility_module_id uuid;
    user_mgmt_module_id uuid;
    patient_mgmt_module_id uuid;
    reporting_module_id uuid;
BEGIN
    -- Get role ID
    SELECT id INTO demo_role_id FROM public.roles WHERE name = 'demoUser';
    
    -- Get core module IDs
    SELECT id INTO onboarding_module_id FROM public.modules WHERE name = 'onboarding_workflow';
    SELECT id INTO facility_module_id FROM public.modules WHERE name = 'facility_administration';
    SELECT id INTO user_mgmt_module_id FROM public.modules WHERE name = 'user_management';
    SELECT id INTO patient_mgmt_module_id FROM public.modules WHERE name = 'patient_management';
    SELECT id INTO reporting_module_id FROM public.modules WHERE name = 'reporting_analytics';
    
    -- Add treatment centers module
    INSERT INTO public.modules (name, description, is_active) VALUES
    ('treatment_centers', 'Treatment center management and facility operations', true)
    ON CONFLICT (name) DO NOTHING;
    
    -- Get treatment centers module ID
    SELECT id INTO demo_role_id FROM public.modules WHERE name = 'treatment_centers';
    
    -- Assign all missing modules to demo role
    INSERT INTO public.role_module_assignments (role_id, module_id, is_active, assigned_at)
    VALUES 
        (demo_role_id, onboarding_module_id, true, now()),
        (demo_role_id, facility_module_id, true, now()),
        (demo_role_id, user_mgmt_module_id, true, now()),
        (demo_role_id, patient_mgmt_module_id, true, now()),
        (demo_role_id, reporting_module_id, true, now())
    ON CONFLICT (role_id, module_id) DO NOTHING;
    
    -- Also assign treatment centers module
    INSERT INTO public.role_module_assignments (role_id, module_id, is_active, assigned_at)
    SELECT demo_role_id, id, true, now()
    FROM public.modules 
    WHERE name = 'treatment_centers'
    ON CONFLICT DO NOTHING;
END $$;