-- Create secure role assignment function with privilege escalation protection
CREATE OR REPLACE FUNCTION public.secure_assign_user_role(
  target_user_id uuid, 
  target_role_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  target_role_id uuid;
  current_user_is_admin boolean;
  target_user_current_roles text[];
  result jsonb;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Validate current user is authenticated
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;
  
  -- Check if current user has admin privileges (safe check without RLS recursion)
  current_user_is_admin := is_admin_user_safe(current_user_id);
  
  -- Only admins can assign roles
  IF NOT current_user_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient privileges - admin access required'
    );
  END IF;
  
  -- Validate target user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Target user not found'
    );
  END IF;
  
  -- Get target role ID
  SELECT id INTO target_role_id 
  FROM roles 
  WHERE name = target_role_name::user_role;
  
  IF target_role_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid role name: ' || target_role_name
    );
  END IF;
  
  -- Get current roles of target user
  SELECT array_agg(r.name::text) INTO target_user_current_roles
  FROM user_roles ur
  JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = target_user_id;
  
  -- Prevent privilege escalation: Non-superAdmin cannot assign superAdmin role
  IF target_role_name = 'superAdmin' THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = current_user_id 
      AND r.name = 'superAdmin'
    ) THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Cannot assign superAdmin role - requires superAdmin privileges'
      );
    END IF;
  END IF;
  
  -- Check if role is already assigned
  IF EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = target_user_id AND role_id = target_role_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Role already assigned to user'
    );
  END IF;
  
  -- Assign the role
  INSERT INTO user_roles (user_id, role_id)
  VALUES (target_user_id, target_role_id);
  
  -- Log the action
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, 
    old_values, new_values
  ) VALUES (
    current_user_id,
    'role_assignment',
    'user_roles',
    target_user_id,
    jsonb_build_object('previous_roles', target_user_current_roles),
    jsonb_build_object(
      'assigned_role', target_role_name,
      'target_user', target_user_id,
      'assigned_by', current_user_id
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role assigned successfully',
    'data', jsonb_build_object(
      'user_id', target_user_id,
      'role_name', target_role_name,
      'assigned_by', current_user_id,
      'assigned_at', now()
    )
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'Role assignment failed: ' || SQLERRM
  );
END;
$$;

-- Create secure role removal function with proper authorization
CREATE OR REPLACE FUNCTION public.secure_remove_user_role(
  target_user_id uuid, 
  target_role_name text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_user_id uuid;
  target_role_id uuid;
  current_user_is_admin boolean;
  result jsonb;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Validate current user is authenticated
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;
  
  -- Check if current user has admin privileges
  current_user_is_admin := is_admin_user_safe(current_user_id);
  
  -- Only admins can remove roles
  IF NOT current_user_is_admin THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient privileges - admin access required'
    );
  END IF;
  
  -- Prevent users from removing their own superAdmin role (system protection)
  IF target_user_id = current_user_id AND target_role_name = 'superAdmin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot remove your own superAdmin role'
    );
  END IF;
  
  -- Get target role ID
  SELECT id INTO target_role_id 
  FROM roles 
  WHERE name = target_role_name::user_role;
  
  IF target_role_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid role name: ' || target_role_name
    );
  END IF;
  
  -- Check if role assignment exists
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = target_user_id AND role_id = target_role_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Role not assigned to user'
    );
  END IF;
  
  -- Remove the role
  DELETE FROM user_roles 
  WHERE user_id = target_user_id AND role_id = target_role_id;
  
  -- Log the action
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, 
    old_values, new_values
  ) VALUES (
    current_user_id,
    'role_removal',
    'user_roles',
    target_user_id,
    jsonb_build_object('removed_role', target_role_name),
    jsonb_build_object(
      'target_user', target_user_id,
      'removed_by', current_user_id,
      'removed_at', now()
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Role removed successfully',
    'data', jsonb_build_object(
      'user_id', target_user_id,
      'role_name', target_role_name,
      'removed_by', current_user_id,
      'removed_at', now()
    )
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', 'Role removal failed: ' || SQLERRM
  );
END;
$$;