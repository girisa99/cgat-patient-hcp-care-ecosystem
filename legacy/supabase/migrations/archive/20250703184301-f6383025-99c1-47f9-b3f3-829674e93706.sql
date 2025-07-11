-- Clean up circular dependency RLS policies on user_roles table
-- Remove problematic policies that create infinite recursion
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Clean up any duplicate policies on roles table that might cause issues  
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;

-- Create a simple policy for users to read their own roles (no circular dependency)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_roles' 
        AND policyname = 'user_roles_own_read_simple'
    ) THEN
        CREATE POLICY "user_roles_own_read_simple" 
        ON public.user_roles 
        FOR SELECT 
        TO authenticated
        USING (user_id = auth.uid());
    END IF;
END $$;