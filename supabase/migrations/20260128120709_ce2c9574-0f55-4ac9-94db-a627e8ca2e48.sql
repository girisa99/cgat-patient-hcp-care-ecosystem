-- Idea Marketplace & Regional Success Stories Tables
-- Community collaboration for sharing concepts, templates, and regional learnings

-- Shared ideas/concepts that can be remixed
CREATE TABLE public.community_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'template', -- template, concept, campaign, story
  category TEXT NOT NULL DEFAULT 'general',
  region TEXT, -- original region
  industry TEXT,
  content_data JSONB DEFAULT '{}'::jsonb, -- the actual content/template data
  thumbnail_url TEXT,
  remix_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  credit_reward INTEGER DEFAULT 5, -- credits earned per remix
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track remixes/forks of ideas
CREATE TABLE public.idea_remixes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_idea_id UUID REFERENCES public.community_ideas(id) ON DELETE CASCADE,
  remixer_user_id UUID NOT NULL,
  remix_content JSONB DEFAULT '{}'::jsonb,
  credits_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Regional success stories - what's working where
CREATE TABLE public.regional_success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  story_content TEXT NOT NULL,
  region TEXT NOT NULL,
  industry TEXT,
  metrics JSONB DEFAULT '{}'::jsonb, -- engagement, reach, conversion stats
  learnings TEXT[], -- key takeaways
  applicable_regions TEXT[] DEFAULT '{}', -- regions this could help
  platform TEXT, -- which platform the success was on
  content_type TEXT, -- video, avatar, 3d, etc.
  upvotes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Offline publish queue for mobile
CREATE TABLE public.offline_publish_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_data JSONB NOT NULL, -- full publishing payload
  target_platforms TEXT[] NOT NULL,
  status TEXT DEFAULT 'queued', -- queued, syncing, completed, failed
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  queued_at TIMESTAMPTZ DEFAULT now(),
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_remixes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_publish_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_ideas
CREATE POLICY "Public ideas viewable by all" ON public.community_ideas
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create ideas" ON public.community_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON public.community_ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON public.community_ideas
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for idea_remixes
CREATE POLICY "Anyone can view remixes" ON public.idea_remixes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can remix" ON public.idea_remixes
  FOR INSERT WITH CHECK (auth.uid() = remixer_user_id);

-- RLS Policies for regional_success_stories  
CREATE POLICY "Stories viewable by all" ON public.regional_success_stories
  FOR SELECT USING (true);

CREATE POLICY "Users can create stories" ON public.regional_success_stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON public.regional_success_stories
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for offline_publish_queue
CREATE POLICY "Users manage own queue" ON public.offline_publish_queue
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_community_ideas_region ON public.community_ideas(region);
CREATE INDEX idx_community_ideas_category ON public.community_ideas(category);
CREATE INDEX idx_community_ideas_featured ON public.community_ideas(is_featured) WHERE is_featured = true;
CREATE INDEX idx_regional_stories_region ON public.regional_success_stories(region);
CREATE INDEX idx_regional_stories_featured ON public.regional_success_stories(is_featured) WHERE is_featured = true;
CREATE INDEX idx_offline_queue_status ON public.offline_publish_queue(status, user_id);

-- Triggers for updated_at
CREATE TRIGGER update_community_ideas_updated_at
  BEFORE UPDATE ON public.community_ideas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_regional_stories_updated_at
  BEFORE UPDATE ON public.regional_success_stories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to increment remix count and award credits
CREATE OR REPLACE FUNCTION public.handle_idea_remix()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increment remix count on original idea
  UPDATE public.community_ideas 
  SET remix_count = remix_count + 1 
  WHERE id = NEW.original_idea_id;
  
  -- Set credits awarded based on original idea's reward
  NEW.credits_awarded := (
    SELECT credit_reward FROM public.community_ideas WHERE id = NEW.original_idea_id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_idea_remix
  BEFORE INSERT ON public.idea_remixes
  FOR EACH ROW EXECUTE FUNCTION public.handle_idea_remix();