-- Fix search_path for newly created functions
CREATE OR REPLACE FUNCTION public.generate_show_slug()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.track_show_stage_change()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.current_stage IS DISTINCT FROM NEW.current_stage THEN
    -- Complete the previous stage
    UPDATE public.show_stage_history 
    SET completed_at = now() 
    WHERE show_id = NEW.id AND stage = OLD.current_stage AND completed_at IS NULL;
    
    -- Start the new stage
    INSERT INTO public.show_stage_history (show_id, stage)
    VALUES (NEW.id, NEW.current_stage);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.init_show_stage()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.show_stage_history (show_id, stage)
  VALUES (NEW.id, NEW.current_stage);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;