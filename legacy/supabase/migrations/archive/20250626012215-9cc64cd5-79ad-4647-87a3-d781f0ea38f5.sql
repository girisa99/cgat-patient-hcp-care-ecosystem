
-- Check current state of roles table
SELECT * FROM roles ORDER BY name;

-- Check current state of user_roles table with user emails
SELECT 
    ur.id,
    ur.user_id,
    ur.role_id,
    ur.created_at,
    p.email,
    r.name as role_name
FROM user_roles ur
LEFT JOIN profiles p ON p.id = ur.user_id
LEFT JOIN roles r ON r.id = ur.role_id
ORDER BY ur.created_at DESC;

-- Check all users and their role status
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    COUNT(ur.id) as role_count,
    STRING_AGG(r.name::text, ', ') as roles
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.id
LEFT JOIN roles r ON r.id = ur.role_id
GROUP BY p.id, p.email, p.first_name, p.last_name
ORDER BY p.email;

-- Check for any constraint issues or failed insertions
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'user_roles'::regclass;

-- Check RLS policies on user_roles table
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
WHERE schemaname = 'public' AND tablename = 'user_roles'
ORDER BY policyname;
