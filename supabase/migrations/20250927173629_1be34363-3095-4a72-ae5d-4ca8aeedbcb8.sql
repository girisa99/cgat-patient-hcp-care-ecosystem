-- FINAL SECURITY FIX: Complete remaining function search_path security updates
-- This addresses the last "Function Search Path Mutable" warnings for critical functions

-- Update _table_exists function with secure search_path
CREATE OR REPLACE FUNCTION public._table_exists(p_table text)
RETURNS boolean
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name = p_table
  );
END;
$$;

-- Update assign_user_role function with secure search_path
CREATE OR REPLACE FUNCTION public.assign_user_role(p_user_id uuid, p_role_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_uuid uuid;
BEGIN
  -- Get the role ID for the role name
  SELECT id INTO role_uuid 
  FROM public.roles 
  WHERE name = p_role_name::user_role;
  
  IF role_uuid IS NULL THEN
    RAISE EXCEPTION 'Role % not found', p_role_name;
  END IF;
  
  -- Insert the user role assignment
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (p_user_id, role_uuid)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$;

-- Update auto_sync_demo_user_access function with secure search_path
CREATE OR REPLACE FUNCTION public.auto_sync_demo_user_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  demo_role_id uuid;
  module_rec RECORD;
  modules_synced integer := 0;
BEGIN
  -- Get demo user role ID
  SELECT id INTO demo_role_id FROM roles WHERE name = 'demoUser';
  
  IF demo_role_id IS NULL THEN
    -- Create demo user role if it doesn't exist
    INSERT INTO roles (name, description, is_default)
    VALUES ('demoUser', 'Demonstration user with access to showcase features', false)
    RETURNING id INTO demo_role_id;
  END IF;

  -- Auto-assign demo user to all active modules for demonstration purposes
  FOR module_rec IN 
    SELECT id, name FROM modules WHERE is_active = true
  LOOP
    -- Insert role-module assignment if it doesn't exist
    INSERT INTO role_module_assignments (role_id, module_id, is_active)
    VALUES (demo_role_id, module_rec.id, true)
    ON CONFLICT (role_id, module_id) DO UPDATE SET is_active = true;
    
    modules_synced := modules_synced + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'demo_role_id', demo_role_id,
    'modules_synced', modules_synced,
    'sync_timestamp', now()
  );
END;
$$;

-- Update cleanup_user_agent_work function with secure search_path  
CREATE OR REPLACE FUNCTION public.cleanup_user_agent_work(p_user_id uuid DEFAULT auth.uid(), p_statuses text[] DEFAULT ARRAY['draft'::text, 'in_progress'::text])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_agent_sessions integer := 0;
  deleted_agents integer := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  -- Only allow self clean-up or admins
  IF p_user_id <> auth.uid() AND NOT is_admin_user_safe(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to clean up for this user';
  END IF;

  -- Delete matching agent sessions
  DELETE FROM agent_sessions
  WHERE user_id = p_user_id
    AND status = ANY(p_statuses);
  GET DIAGNOSTICS deleted_agent_sessions = ROW_COUNT;

  -- Delete matching agents
  DELETE FROM agents
  WHERE created_by = p_user_id
    AND status = ANY(p_statuses);
  GET DIAGNOSTICS deleted_agents = ROW_COUNT;

  RETURN jsonb_build_object(
    'deleted_agent_sessions', deleted_agent_sessions,
    'deleted_agents', deleted_agents,
    'total_deleted', deleted_agent_sessions + deleted_agents,
    'statuses', p_statuses,
    'target_user_id', p_user_id,
    'timestamp', now()
  );
END;
$$;