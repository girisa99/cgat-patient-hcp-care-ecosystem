-- Create simplified auto-sync function without activity logs
CREATE OR REPLACE FUNCTION public.auto_sync_demo_user_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Now run the sync
SELECT public.auto_sync_demo_user_access();