-- Create enums for production system
CREATE TYPE public.show_type AS ENUM ('podcast', 'webcast', 'interview', 'panel', 'tutorial', 'other');
CREATE TYPE public.production_stage AS ENUM ('outreach', 'script', 'rehearsal', 'recording', 'post_production', 'published');
CREATE TYPE public.participant_role AS ENUM ('host', 'co_host', 'guest', 'panelist', 'interviewer', 'interviewee', 'narrator', 'other');
CREATE TYPE public.participant_status AS ENUM ('invited', 'confirmed', 'declined', 'tentative', 'cancelled');

-- Main shows table
CREATE TABLE public.shows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  show_type public.show_type NOT NULL DEFAULT 'podcast',
  current_stage public.production_stage NOT NULL DEFAULT 'outreach',
  thumbnail_url TEXT,
  scheduled_date TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  landing_page_enabled BOOLEAN DEFAULT false,
  embed_enabled BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Show participants table
CREATE TABLE public.show_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role public.participant_role NOT NULL DEFAULT 'guest',
  status public.participant_status NOT NULL DEFAULT 'invited',
  bio TEXT,
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  invited_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Show stage history for tracking progression
CREATE TABLE public.show_stage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  stage public.production_stage NOT NULL,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  completed_by UUID
);

-- Show assets linking recordings/media to shows
CREATE TABLE public.show_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL, -- 'script', 'voiceover', 'music', 'recording', 'thumbnail', 'video', 'audio'
  name TEXT NOT NULL,
  file_url TEXT,
  file_size BIGINT,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  stage public.production_stage, -- which stage this asset belongs to
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION public.generate_show_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(regexp_replace(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_show_slug
  BEFORE INSERT ON public.shows
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_show_slug();

-- Auto-update updated_at
CREATE TRIGGER update_shows_updated_at
  BEFORE UPDATE ON public.shows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_show_participants_updated_at
  BEFORE UPDATE ON public.show_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_show_assets_updated_at
  BEFORE UPDATE ON public.show_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Track stage changes automatically
CREATE OR REPLACE FUNCTION public.track_show_stage_change()
RETURNS TRIGGER AS $$
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

CREATE TRIGGER trigger_track_show_stage_change
  AFTER UPDATE ON public.shows
  FOR EACH ROW
  EXECUTE FUNCTION public.track_show_stage_change();

-- Insert initial stage on show creation
CREATE OR REPLACE FUNCTION public.init_show_stage()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.show_stage_history (show_id, stage)
  VALUES (NEW.id, NEW.current_stage);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_init_show_stage
  AFTER INSERT ON public.shows
  FOR EACH ROW
  EXECUTE FUNCTION public.init_show_stage();

-- Enable RLS
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shows
CREATE POLICY "Users can view their own shows"
  ON public.shows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shows"
  ON public.shows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shows"
  ON public.shows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shows"
  ON public.shows FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for show_participants (through show ownership)
CREATE POLICY "Users can view participants of their shows"
  ON public.show_participants FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.shows WHERE id = show_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage participants of their shows"
  ON public.show_participants FOR ALL
  USING (EXISTS (SELECT 1 FROM public.shows WHERE id = show_id AND user_id = auth.uid()));

-- RLS Policies for show_stage_history
CREATE POLICY "Users can view stage history of their shows"
  ON public.show_stage_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.shows WHERE id = show_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage stage history of their shows"
  ON public.show_stage_history FOR ALL
  USING (EXISTS (SELECT 1 FROM public.shows WHERE id = show_id AND user_id = auth.uid()));

-- RLS Policies for show_assets
CREATE POLICY "Users can view assets of their shows"
  ON public.show_assets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.shows WHERE id = show_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage assets of their shows"
  ON public.show_assets FOR ALL
  USING (EXISTS (SELECT 1 FROM public.shows WHERE id = show_id AND user_id = auth.uid()));

-- Public access for published shows with landing pages
CREATE POLICY "Public can view published shows with landing pages"
  ON public.shows FOR SELECT
  USING (current_stage = 'published' AND landing_page_enabled = true);

-- Indexes for performance
CREATE INDEX idx_shows_user_id ON public.shows(user_id);
CREATE INDEX idx_shows_current_stage ON public.shows(current_stage);
CREATE INDEX idx_shows_slug ON public.shows(slug);
CREATE INDEX idx_show_participants_show_id ON public.show_participants(show_id);
CREATE INDEX idx_show_assets_show_id ON public.show_assets(show_id);
CREATE INDEX idx_show_stage_history_show_id ON public.show_stage_history(show_id);