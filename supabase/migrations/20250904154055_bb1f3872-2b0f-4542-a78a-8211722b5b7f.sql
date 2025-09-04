-- Fix security definer function search path issues
CREATE OR REPLACE FUNCTION update_agent_node_deployments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';