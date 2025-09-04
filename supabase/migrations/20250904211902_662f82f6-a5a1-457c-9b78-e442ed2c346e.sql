-- Create deployment environments table for channel deployments
CREATE TABLE IF NOT EXISTS public.deployment_environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deployment_environments ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'deployment_environments' AND policyname = 'Public can read default or own environments'
  ) THEN
    CREATE POLICY "Public can read default or own environments"
    ON public.deployment_environments
    FOR SELECT
    USING (
      is_default = true OR created_by = auth.uid() OR is_admin_user_safe(auth.uid())
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'deployment_environments' AND policyname = 'Users manage their environments'
  ) THEN
    CREATE POLICY "Users manage their environments"
    ON public.deployment_environments
    FOR ALL
    USING (created_by = auth.uid() OR is_admin_user_safe(auth.uid()))
    WITH CHECK (created_by = auth.uid() OR is_admin_user_safe(auth.uid()));
  END IF;
END $$;

-- Trigger to maintain updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_deployment_env_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_deployment_env_updated_at
    BEFORE UPDATE ON public.deployment_environments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_framework_updated_at();
  END IF;
END $$;

-- Seed default environments if none exist
INSERT INTO public.deployment_environments (name, description, is_default)
SELECT v.name, v.description, v.is_default
FROM (
  VALUES 
    ('development', 'Local development environment', true),
    ('staging', 'Pre-production staging environment', true),
    ('production', 'Live production environment', true)
) AS v(name, description, is_default)
WHERE NOT EXISTS (SELECT 1 FROM public.deployment_environments);
