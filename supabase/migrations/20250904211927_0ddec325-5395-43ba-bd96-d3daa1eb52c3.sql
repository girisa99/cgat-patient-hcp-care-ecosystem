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
CREATE POLICY "Public can read default or own environments"
ON public.deployment_environments
FOR SELECT
USING (
  is_default = true OR created_by = auth.uid() OR is_admin_user_safe(auth.uid())
);

CREATE POLICY "Users manage their environments"
ON public.deployment_environments
FOR ALL
USING (created_by = auth.uid() OR is_admin_user_safe(auth.uid()))
WITH CHECK (created_by = auth.uid() OR is_admin_user_safe(auth.uid()));

-- Trigger to maintain updated_at
CREATE TRIGGER trg_update_deployment_env_updated_at
BEFORE UPDATE ON public.deployment_environments
FOR EACH ROW
EXECUTE FUNCTION public.update_framework_updated_at();

-- Seed default environments
INSERT INTO public.deployment_environments (name, description, is_default)
VALUES 
  ('development', 'Local development environment', true),
  ('staging', 'Pre-production staging environment', true),
  ('production', 'Live production environment', true)
ON CONFLICT (name) DO NOTHING;