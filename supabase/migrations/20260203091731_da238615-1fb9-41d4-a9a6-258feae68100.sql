-- Add unique constraint for upsert operations on landing_page_videos
-- This allows "one video per content_type + language_code" pattern

ALTER TABLE public.landing_page_videos
ADD CONSTRAINT landing_page_videos_content_language_unique 
UNIQUE (content_type, language_code);

-- Also add an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_landing_page_videos_content_language 
ON public.landing_page_videos(content_type, language_code);