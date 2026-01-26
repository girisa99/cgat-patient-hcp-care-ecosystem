-- Fix Function Search Path Warnings (6 custom functions)
-- These functions need SET search_path = public for security

-- 1. handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 2. increment_template_installs
CREATE OR REPLACE FUNCTION public.increment_template_installs(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.agent_templates 
  SET configuration = jsonb_set(
    COALESCE(configuration, '{}'::jsonb),
    '{install_count}',
    to_jsonb(COALESCE((configuration->>'install_count')::int, 0) + 1)
  )
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- 3. update_genie_sessions_updated_at
CREATE OR REPLACE FUNCTION public.update_genie_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 4. update_genie_studio_updated_at
CREATE OR REPLACE FUNCTION public.update_genie_studio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- 5. update_review_status_counts
CREATE OR REPLACE FUNCTION public.update_review_status_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update agent template review counts when reviews change
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.agent_templates
    SET configuration = jsonb_set(
      COALESCE(configuration, '{}'::jsonb),
      '{review_count}',
      to_jsonb(
        (SELECT COUNT(*) FROM public.agent_template_versions WHERE template_id = NEW.template_id)
      )
    )
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- 6. update_template_avg_rating
CREATE OR REPLACE FUNCTION public.update_template_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Placeholder for rating calculation when rating system is implemented
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;