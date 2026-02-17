-- Fix security issues by dropping trigger, function, then recreating with proper security definer
DROP TRIGGER IF EXISTS update_observability_configs_updated_at ON public.observability_configs;
DROP FUNCTION IF EXISTS update_observability_configs_updated_at();

-- Create updated_at trigger function with proper security definer and search path
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

-- Recreate trigger
CREATE TRIGGER update_observability_configs_updated_at
  BEFORE UPDATE ON public.observability_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_observability_configs_updated_at();