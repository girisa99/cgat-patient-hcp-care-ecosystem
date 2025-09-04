-- Fix security issues by updating the function to be security definer with proper search path
DROP FUNCTION IF EXISTS update_observability_configs_updated_at();

CREATE OR REPLACE FUNCTION update_observability_configs_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;