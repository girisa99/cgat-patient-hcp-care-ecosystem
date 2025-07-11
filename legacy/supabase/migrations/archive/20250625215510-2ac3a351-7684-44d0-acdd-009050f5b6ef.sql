
-- Add NPI number field to facilities table
ALTER TABLE public.facilities 
ADD COLUMN npi_number character varying;

-- Fix the user_roles relationship by ensuring proper foreign key
-- The manage-user-profiles function is failing because it can't find the relationship
-- Let's check and fix the user_roles table structure
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also ensure the profiles table has proper relationship with user_roles
-- by adding an index that helps with the join
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
