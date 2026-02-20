
-- Dynamic content registry: categories + formats, no hardcoding
CREATE TABLE public.cast_content_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text DEFAULT 'Folder',
  color text DEFAULT 'text-primary',
  description text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.cast_content_formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text DEFAULT 'FileText',
  color text DEFAULT 'text-primary',
  description text,
  requires_messaging boolean DEFAULT false,
  requires_tts boolean DEFAULT false,
  requires_video boolean DEFAULT false,
  enrichment_config jsonb DEFAULT '{}',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Which formats are available per category (if empty = all formats allowed)
CREATE TABLE public.cast_category_formats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.cast_content_categories(id) ON DELETE CASCADE,
  format_id uuid REFERENCES public.cast_content_formats(id) ON DELETE CASCADE,
  enrichment_overrides jsonb DEFAULT '{}',
  blueprint_template_id text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_id, format_id)
);

-- Update cast_projects to use category + format instead of single content_type
ALTER TABLE public.cast_projects 
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.cast_content_categories(id),
  ADD COLUMN IF NOT EXISTS format_id uuid REFERENCES public.cast_content_formats(id),
  ADD COLUMN IF NOT EXISTS enrichment_snapshot jsonb DEFAULT '{}';

-- Enable RLS
ALTER TABLE public.cast_content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_content_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cast_category_formats ENABLE ROW LEVEL SECURITY;

-- Categories and formats are readable by all authenticated users
CREATE POLICY "Authenticated users can read categories" ON public.cast_content_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read formats" ON public.cast_content_formats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read category_formats" ON public.cast_category_formats FOR SELECT TO authenticated USING (true);

-- Admins can manage (using simple auth check for now)
CREATE POLICY "Authenticated users can insert categories" ON public.cast_content_categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.cast_content_categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert formats" ON public.cast_content_formats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update formats" ON public.cast_content_formats FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert category_formats" ON public.cast_category_formats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update category_formats" ON public.cast_category_formats FOR UPDATE TO authenticated USING (true);

-- Seed initial categories
INSERT INTO public.cast_content_categories (name, label, icon, color, description, sort_order) VALUES
  ('media', 'Media & Entertainment', 'Film', 'text-blue-600', 'General media production', 1),
  ('healthcare', 'Healthcare', 'HeartPulse', 'text-red-600', 'Healthcare industry content', 2),
  ('education', 'Education', 'GraduationCap', 'text-green-600', 'Educational and training content', 3),
  ('government', 'Government', 'Landmark', 'text-slate-600', 'Government and public sector', 4),
  ('oil_gas', 'Oil & Gas', 'Fuel', 'text-amber-600', 'Energy sector content', 5),
  ('travel', 'Travel & Hospitality', 'Plane', 'text-cyan-600', 'Travel and tourism content', 6),
  ('commercial', 'Commercial & Marketing', 'Megaphone', 'text-purple-600', 'Commercial and brand content', 7),
  ('technology', 'Technology', 'Cpu', 'text-indigo-600', 'Tech industry content', 8);

-- Seed initial formats
INSERT INTO public.cast_content_formats (name, label, icon, color, description, requires_messaging, requires_tts, requires_video, sort_order) VALUES
  ('podcast', 'Podcast', 'Mic', 'text-purple-600', 'Audio podcast episodes', false, true, false, 1),
  ('webcast', 'Webcast', 'Radio', 'text-blue-600', 'Live or recorded webcast', true, true, true, 2),
  ('video', 'Video', 'Video', 'text-red-600', 'Video production', true, true, true, 3),
  ('presentation', 'Presentation / PPT', 'Presentation', 'text-orange-600', 'Slide presentations', true, false, false, 4),
  ('script', 'Script / Narration', 'FileText', 'text-green-600', 'Written scripts and narration', false, false, false, 5),
  ('tts', 'Text-to-Speech', 'Volume2', 'text-teal-600', 'TTS audio generation', false, true, false, 6),
  ('voice', 'Voice / Voiceover', 'AudioLines', 'text-pink-600', 'Professional voiceover', false, true, false, 7),
  ('ugc', 'User Generated Content', 'Users', 'text-yellow-600', 'UGC-style content', false, false, true, 8);

-- Trigger for updated_at
CREATE TRIGGER update_cast_content_categories_updated_at BEFORE UPDATE ON public.cast_content_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cast_content_formats_updated_at BEFORE UPDATE ON public.cast_content_formats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
