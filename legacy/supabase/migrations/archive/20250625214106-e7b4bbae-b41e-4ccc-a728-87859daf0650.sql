
-- Check all current RLS policies across all tables
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

-- Check specifically for any policies that might reference user_roles table in their conditions
-- (these are the ones that could cause recursion)
SELECT 
    schemaname,
    tablename,
    policyname,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND (
    qual LIKE '%user_roles%' 
    OR with_check LIKE '%user_roles%'
    OR qual LIKE '%EXISTS%SELECT%user_roles%'
    OR with_check LIKE '%EXISTS%SELECT%user_roles%'
)
ORDER BY tablename, policyname;

-- Verify our security definer functions exist and are properly configured
SELECT 
    routine_name,
    routine_type,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('user_has_role', 'check_user_has_role')
ORDER BY routine_name;

-- Check for any policies that might still cause recursion issues
-- Look for policies that query the same table they're protecting
SELECT 
    p.schemaname,
    p.tablename,
    p.policyname,
    p.cmd,
    p.qual,
    p.with_check,
    CASE 
        WHEN p.qual LIKE '%' || p.tablename || '%' OR p.with_check LIKE '%' || p.tablename || '%' 
        THEN 'POTENTIAL_RECURSION_RISK'
        ELSE 'SAFE'
    END as recursion_risk
FROM pg_policies p
WHERE p.schemaname = 'public'
ORDER BY recursion_risk DESC, p.tablename, p.policyname;
