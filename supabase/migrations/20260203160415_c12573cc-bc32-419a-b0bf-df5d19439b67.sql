-- Add generation_status column to track video generation state
ALTER TABLE public.landing_page_videos 
ADD COLUMN IF NOT EXISTS generation_status TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'processing', 'completed', 'failed'));

-- Add generation_error for storing failure details
ALTER TABLE public.landing_page_videos 
ADD COLUMN IF NOT EXISTS generation_error TEXT;

-- Add generation_task_id for polling async jobs
ALTER TABLE public.landing_page_videos 
ADD COLUMN IF NOT EXISTS generation_task_id TEXT;

-- Add generation_started_at for tracking duration
ALTER TABLE public.landing_page_videos 
ADD COLUMN IF NOT EXISTS generation_started_at TIMESTAMPTZ;

-- Update existing entries to mark as pending if they have placeholder URLs
UPDATE public.landing_page_videos 
SET generation_status = 'pending'
WHERE video_url LIKE '%genie-studio-full-%' 
  AND generation_status IS NULL;

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_landing_videos_generation_status 
ON public.landing_page_videos(generation_status);

COMMENT ON COLUMN public.landing_page_videos.generation_status IS 'Tracks video generation state: pending, processing, completed, failed';