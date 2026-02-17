-- Fix the constraint issue and create automation for demoUser sync
-- First, let's fix the constraint by allowing 'role_based_covered' status
ALTER TABLE system_functionality_registry DROP CONSTRAINT IF EXISTS system_functionality_registry_test_coverage_status_check;

-- Add new constraint with proper values
ALTER TABLE system_functionality_registry ADD CONSTRAINT system_functionality_registry_test_coverage_status_check 
CHECK (test_coverage_status IN ('uncovered', 'partial', 'covered', 'role_based_covered'));

-- Create a function to automatically sync demoUser access to new functionality
CREATE OR REPLACE FUNCTION public.auto_sync_demo_user_access()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  demo_role_id uuid;
  module_rec RECORD;
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
  END LOOP;

  -- Log the sync activity
  INSERT INTO system_activity_logs (activity_type, description, metadata)
  VALUES (
    'demo_user_sync',
    'Automatically synchronized demoUser access to all active modules',
    jsonb_build_object(
      'sync_timestamp', now(),
      'modules_synced', (SELECT COUNT(*) FROM modules WHERE is_active = true),
      'role_id', demo_role_id
    )
  );
END;
$$;

-- Create a trigger function to auto-sync when new modules are added
CREATE OR REPLACE FUNCTION public.trigger_demo_user_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only trigger for new active modules
  IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
    PERFORM public.auto_sync_demo_user_access();
  ELSIF TG_OP = 'UPDATE' AND OLD.is_active = false AND NEW.is_active = true THEN
    PERFORM public.auto_sync_demo_user_access();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on modules table
DROP TRIGGER IF EXISTS auto_sync_demo_user_trigger ON modules;
CREATE TRIGGER auto_sync_demo_user_trigger
  AFTER INSERT OR UPDATE ON modules
  FOR EACH ROW
  EXECUTE FUNCTION trigger_demo_user_sync();