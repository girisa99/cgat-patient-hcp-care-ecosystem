-- Landing Page Videos Table for Admin Management
-- Stores videos generated from admin panel for landing page display

CREATE TABLE IF NOT EXISTS public.landing_page_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Video metadata
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- Categorization
  region TEXT NOT NULL DEFAULT 'NAM',
  language_code TEXT NOT NULL DEFAULT 'en',
  language_name TEXT NOT NULL DEFAULT 'English',
  industry TEXT,
  content_type TEXT DEFAULT 'demo',
  
  -- Placement
  placement TEXT NOT NULL DEFAULT 'hero',
  display_order INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Analytics
  view_count INT DEFAULT 0,
  
  -- Metadata
  duration_seconds INT,
  ai_confidence DECIMAL(5,2) DEFAULT 95.00,
  generation_pipeline TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.landing_page_videos ENABLE ROW LEVEL SECURITY;

-- Public read access for landing page
CREATE POLICY "Anyone can view active landing videos"
  ON public.landing_page_videos
  FOR SELECT
  USING (is_active = true);

-- Admin write access (internal users)
CREATE POLICY "Internal users can manage landing videos"
  ON public.landing_page_videos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.genie_studio_users
      WHERE auth_user_id = auth.uid() AND is_internal = true
    )
  );

-- Indexes for performance
CREATE INDEX idx_landing_videos_region ON public.landing_page_videos(region);
CREATE INDEX idx_landing_videos_language ON public.landing_page_videos(language_code);
CREATE INDEX idx_landing_videos_placement ON public.landing_page_videos(placement);
CREATE INDEX idx_landing_videos_active ON public.landing_page_videos(is_active, is_featured);

-- Trigger for updated_at
CREATE TRIGGER update_landing_videos_updated_at
  BEFORE UPDATE ON public.landing_page_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample videos for demo
INSERT INTO public.landing_page_videos (title, description, video_url, thumbnail_url, region, language_code, language_name, industry, placement, is_featured, duration_seconds, generation_pipeline) VALUES
  ('AI Healthcare Training - English', 'AI-generated medical training video', 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop', 'NAM', 'en', 'English', 'Healthcare', 'hero', true, 180, 'text-to-video'),
  ('EdTech Demo - Hindi', 'AI course creator showcase in Hindi', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop', 'IND', 'hi', 'Hindi', 'EdTech', 'hero', true, 210, 'script-to-video'),
  ('Finance Demo - Arabic (Saudi)', 'Banking presentation in Saudi dialect', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=450&fit=crop', 'MENA', 'ar-SA', 'Arabic (Saudi)', 'Finance', 'hero', true, 195, 'presentation-to-video'),
  ('Marketing Campaign - French', 'Global marketing video in French', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop', 'EUR', 'fr', 'French', 'Marketing', 'hero', false, 165, 'brief-to-video'),
  ('Tech Demo - Japanese', 'Technology showcase in Japanese', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=450&fit=crop', 'APAC', 'ja', 'Japanese', 'Technology', 'hero', false, 180, 'text-to-video'),
  ('Fintech Onboarding - Swahili', 'African fintech training in Swahili', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4', 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=450&fit=crop', 'AFR', 'sw', 'Swahili', 'Finance', 'hero', false, 150, 'training-to-video'),
  ('Tourism Campaign - Spanish', 'Latin America tourism video in Spanish', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&h=450&fit=crop', 'LATAM', 'es', 'Spanish', 'Tourism', 'hero', false, 175, 'promo-video'),
  ('Healthcare Training - German', 'Medical compliance training in German', 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=450&fit=crop', 'EUR', 'de', 'German', 'Healthcare', 'hero', false, 200, 'compliance-to-video');