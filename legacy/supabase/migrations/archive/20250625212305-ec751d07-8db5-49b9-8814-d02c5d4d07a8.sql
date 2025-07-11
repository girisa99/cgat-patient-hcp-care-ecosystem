
-- First, let's drop ALL existing policies more comprehensively
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    -- Drop all policies on profiles table
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON profiles';
    END LOOP;
    
    -- Drop all policies on user_roles table
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON user_roles';
    END LOOP;
    
    -- Drop all policies on roles table
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'roles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON roles';
    END LOOP;
    
    -- Drop all policies on other tables too
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'facilities' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON facilities';
    END LOOP;
    
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'permissions' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON permissions';
    END LOOP;
    
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'role_permissions' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON role_permissions';
    END LOOP;
END $$;

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE facilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with the most basic policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create the simplest possible policies
CREATE POLICY "basic_profiles_select" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "basic_profiles_update" ON profiles  
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "basic_user_roles_select" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "basic_roles_select" ON roles
  FOR SELECT TO authenticated USING (true);

-- Keep other tables without RLS for now to avoid recursion issues
