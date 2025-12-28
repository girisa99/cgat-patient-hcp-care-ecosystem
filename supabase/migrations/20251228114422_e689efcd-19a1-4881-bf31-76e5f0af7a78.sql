-- Fix search_path for the timestamp update function
CREATE OR REPLACE FUNCTION update_document_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;