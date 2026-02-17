-- Execute the role-based testing sync for demo users
SELECT public.sync_role_based_testing();

-- Generate role-based test cases specifically for demoUser
SELECT public.generate_role_based_test_cases('demoUser'::user_role);

-- Check if demo user role exists and create if needed
INSERT INTO public.roles (name, description, is_default) 
VALUES ('demoUser', 'Demonstration user with access to showcase features', false)
ON CONFLICT (name) DO NOTHING;