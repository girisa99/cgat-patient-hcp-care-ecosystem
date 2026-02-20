
-- Sub-formats (Level 3 leaf nodes)
CREATE TABLE public.cast_content_sub_formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  format_id uuid NOT NULL REFERENCES public.cast_content_formats(id) ON DELETE CASCADE,
  name text NOT NULL,
  label text NOT NULL,
  icon text NOT NULL DEFAULT 'FileText',
  color text NOT NULL DEFAULT 'text-primary',
  description text,
  enrichment_preset jsonb NOT NULL DEFAULT '{}'::jsonb,
  blueprint_template_id uuid,
  compatible_platforms text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(format_id, name)
);

-- Enable RLS
ALTER TABLE public.cast_content_sub_formats ENABLE ROW LEVEL SECURITY;

-- Public read (registry data)
CREATE POLICY "Anyone can read active sub-formats"
  ON public.cast_content_sub_formats FOR SELECT
  USING (is_active = true);

-- Authenticated users can manage
CREATE POLICY "Authenticated users can manage sub-formats"
  ON public.cast_content_sub_formats FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add platform + language + sub-format columns to cast_projects
ALTER TABLE public.cast_projects
  ADD COLUMN IF NOT EXISTS sub_format_id uuid REFERENCES public.cast_content_sub_formats(id),
  ADD COLUMN IF NOT EXISTS primary_platform text,
  ADD COLUMN IF NOT EXISTS secondary_platforms text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS input_language text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS output_languages text[] NOT NULL DEFAULT '{en}',
  ADD COLUMN IF NOT EXISTS ai_scope_tags text[] NOT NULL DEFAULT '{}';

-- Updated_at trigger for sub_formats
CREATE TRIGGER update_cast_content_sub_formats_updated_at
  BEFORE UPDATE ON public.cast_content_sub_formats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
