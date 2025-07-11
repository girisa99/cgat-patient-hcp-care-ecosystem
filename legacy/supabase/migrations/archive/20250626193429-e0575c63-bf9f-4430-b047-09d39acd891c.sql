
-- Drop the feature_flags table as it's not actively used
DROP TABLE IF EXISTS public.feature_flags CASCADE;

-- Add real-time functionality for user role assignments
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;

-- Also enable real-time for roles table to sync role changes
ALTER TABLE public.roles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.roles;
