-- Fix the search path security issue in the function
CREATE OR REPLACE FUNCTION sync_agent_deployment_status()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- When an agent is deployed to a channel, update agent status
  IF NEW.deployment_status = 'deployed' THEN
    UPDATE agents 
    SET status = 'deployed', updated_at = now() 
    WHERE id = NEW.agent_id;
  ELSIF NEW.deployment_status = 'paused' THEN
    UPDATE agents 
    SET status = 'paused', updated_at = now() 
    WHERE id = NEW.agent_id;
  END IF;
  
  RETURN NEW;
END;
$$;