-- Enable RLS on permissions and role_permissions tables and create policies

-- Enable RLS on permissions table
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on role_permissions table  
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for permissions table
-- All authenticated users need to read permissions for role-based access control
CREATE POLICY "Authenticated users can view permissions" 
ON public.permissions 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins can manage permissions
CREATE POLICY "Admins can manage permissions" 
ON public.permissions 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));

-- Create RLS policies for role_permissions table
-- All authenticated users need to read role_permissions for role-based access control
CREATE POLICY "Authenticated users can view role permissions" 
ON public.role_permissions 
FOR SELECT 
TO authenticated
USING (true);

-- Only admins can manage role_permissions
CREATE POLICY "Admins can manage role permissions" 
ON public.role_permissions 
FOR ALL 
TO authenticated
USING (is_admin_user_safe(auth.uid()))
WITH CHECK (is_admin_user_safe(auth.uid()));