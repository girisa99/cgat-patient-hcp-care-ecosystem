
-- Content Intents Registry - Dynamic, database-driven intent system

CREATE TABLE public.content_intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'marketing',
  default_styles TEXT[] DEFAULT '{}',
  icon TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_system_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  parent_intent_id UUID REFERENCES public.content_intents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system and own intents"
  ON public.content_intents FOR SELECT
  USING (is_system_default = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own intents"
  ON public.content_intents FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system_default = false);

CREATE POLICY "Users can update own intents"
  ON public.content_intents FOR UPDATE
  USING (auth.uid() = user_id AND is_system_default = false);

CREATE POLICY "Users can delete own intents"
  ON public.content_intents FOR DELETE
  USING (auth.uid() = user_id AND is_system_default = false);

CREATE POLICY "SuperAdmins can manage all intents"
  ON public.content_intents FOR ALL
  USING (public.has_role(auth.uid(), 'superAdmin'));

CREATE INDEX idx_content_intents_category ON public.content_intents(category);
CREATE INDEX idx_content_intents_user ON public.content_intents(user_id);
CREATE INDEX idx_content_intents_parent ON public.content_intents(parent_intent_id);
CREATE INDEX idx_content_intents_active ON public.content_intents(is_active) WHERE is_active = true;

CREATE TRIGGER update_content_intents_updated_at
  BEFORE UPDATE ON public.content_intents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed system defaults
INSERT INTO public.content_intents (intent_key, label, description, category, default_styles, is_system_default, sort_order) VALUES
  ('product-demo', 'Product Demo', 'Showcase product features', 'marketing', ARRAY['product_demo'], true, 1),
  ('hero-banner', 'Hero Banner', 'Landing page hero video', 'marketing', ARRAY['hook_videos'], true, 2),
  ('educational', 'Educational', 'Training & learning content', 'education', ARRAY['educational'], true, 3),
  ('testimonial', 'Testimonial', 'Customer success stories', 'marketing', ARRAY['ugc_avatar_photorealistic'], true, 4),
  ('case-study', 'Case Study', 'In-depth customer stories', 'enterprise', ARRAY['smart_storytelling'], true, 5),
  ('social-short', 'Social Short', 'Short-form social content', 'social', ARRAY['hook_videos'], true, 6),
  ('how-to', 'How-To Guide', 'Step-by-step tutorials', 'education', ARRAY['educational'], true, 7),
  ('thought-leadership', 'Thought Leadership', 'Industry expert content', 'enterprise', ARRAY['smart_storytelling'], true, 8),
  ('explainer', 'Explainer', 'Concept explainer video', 'education', ARRAY['educational', 'animation_3d_explainer'], true, 9),
  ('internal-comms', 'Internal Comms', 'Company announcements', 'enterprise', ARRAY['corporate_training'], true, 10),
  ('event-promo', 'Event Promo', 'Event promotion & recap', 'marketing', ARRAY['event_recap'], true, 11),
  ('investor-update', 'Investor Update', 'Stakeholder communications', 'enterprise', ARRAY['investor_pitch'], true, 12);
