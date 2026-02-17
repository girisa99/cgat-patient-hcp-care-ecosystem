-- Add LinkedIn company pages support
ALTER TABLE public.linkedin_oauth_tokens 
ADD COLUMN IF NOT EXISTS linkedin_id TEXT,
ADD COLUMN IF NOT EXISTS profile_name TEXT,
ADD COLUMN IF NOT EXISTS company_pages JSONB DEFAULT '[]'::jsonb;

-- Create social publishing analytics table
CREATE TABLE IF NOT EXISTS public.social_publish_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  post_id TEXT NOT NULL,
  post_url TEXT,
  content_type TEXT,
  target_type TEXT DEFAULT 'personal', -- 'personal' or 'company'
  target_id TEXT, -- company page ID if posting to company
  target_name TEXT, -- company name if posting to company
  title TEXT,
  caption TEXT,
  thumbnail_url TEXT,
  media_url TEXT,
  status TEXT DEFAULT 'published',
  visibility TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  scheduled_at TIMESTAMPTZ,
  
  -- Engagement metrics (updated via webhooks or polling)
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  last_metrics_update TIMESTAMPTZ,
  
  -- Feedback
  feedback_notes TEXT,
  feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_publish_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own social analytics" 
ON public.social_publish_analytics 
FOR ALL 
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_social_publish_analytics_user_platform 
ON public.social_publish_analytics(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_social_publish_analytics_published_at 
ON public.social_publish_analytics(published_at DESC);

-- Update trigger
CREATE TRIGGER update_social_publish_analytics_updated_at
BEFORE UPDATE ON public.social_publish_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();