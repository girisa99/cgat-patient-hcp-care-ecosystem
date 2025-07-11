
-- First, let's see exactly what RLS policies currently exist in the database
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Let's also check what functions exist that might be referenced in policies
SELECT 
    routine_name, 
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (routine_name LIKE '%role%' OR routine_name LIKE '%permission%' OR routine_name LIKE '%user%')
ORDER BY routine_name;

-- Check for any policies that might reference the profiles table in their conditions
-- This is often the source of infinite recursion
SELECT 
    p.schemaname,
    p.tablename,
    p.policyname,
    p.qual,
    p.with_check
FROM pg_policies p
WHERE p.schemaname = 'public'
AND (
    p.qual LIKE '%profiles%' 
    OR p.with_check LIKE '%profiles%'
    OR p.qual LIKE '%user_roles%'
    OR p.with_check LIKE '%user_roles%'
)
ORDER BY p.tablename, p.policyname;
