-- Add journey_stages to agent_templates to store UX journey/stages
-- Keeps real data only; no seeds here
ALTER TABLE public.agent_templates
  ADD COLUMN IF NOT EXISTS journey_stages JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Ensure it is always a JSON array
ALTER TABLE public.agent_templates
  ADD CONSTRAINT agent_templates_journey_stages_is_array
  CHECK (jsonb_typeof(journey_stages) = 'array');

-- Optional: document expected structure via COMMENT for maintainers
COMMENT ON COLUMN public.agent_templates.journey_stages IS
  'Array of stage objects, e.g. [{"id":"basic_info","title":"Basic Info","description":"...","icon":"Route","enforceSequential":true}]';