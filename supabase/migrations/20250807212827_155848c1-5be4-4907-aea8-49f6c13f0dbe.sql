-- Run the initial sync for demo user
SELECT public.auto_sync_demo_user_access();

-- Now run the role-based testing sync
SELECT public.sync_role_based_testing();