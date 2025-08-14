-- Create normalized journey stages table for agent templates
CREATE TABLE IF NOT EXISTS public.agent_template_journey_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.agent_templates(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT,
  owner_role TEXT,
  entry_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  tasks_checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_duration_minutes INTEGER,
  sla JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs_success_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  dependencies JSONB NOT NULL DEFAULT '[]'::jsonb,
  validation_checkpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_template_journey_stages_template_id
  ON public.agent_template_journey_stages(template_id);
CREATE INDEX IF NOT EXISTS idx_agent_template_journey_stages_order
  ON public.agent_template_journey_stages(template_id, order_index);

-- Enable RLS
ALTER TABLE public.agent_template_journey_stages ENABLE ROW LEVEL SECURITY;

-- Policies: owners (agent_templates.created_by) and admins can manage
CREATE POLICY IF NOT EXISTS "stages_manage_own_templates"
ON public.agent_template_journey_stages
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agent_templates t
    WHERE t.id = agent_template_journey_stages.template_id
      AND (t.created_by = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.agent_templates t
    WHERE t.id = agent_template_journey_stages.template_id
      AND (t.created_by = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
);

-- Optional read for everyone authenticated if needed; keep restricted to owners/admins for now
CREATE POLICY IF NOT EXISTS "stages_select_own_templates"
ON public.agent_template_journey_stages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.agent_templates t
    WHERE t.id = agent_template_journey_stages.template_id
      AND (t.created_by = auth.uid() OR is_admin_user_safe(auth.uid()))
  )
);

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_agent_template_journey_stages_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_agent_template_journey_stages_updated_at
    BEFORE UPDATE ON public.agent_template_journey_stages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;