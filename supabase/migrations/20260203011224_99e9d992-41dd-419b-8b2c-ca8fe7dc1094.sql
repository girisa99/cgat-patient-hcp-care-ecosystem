-- Create storage bucket for product screenshots used in landing videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-screenshots', 'product-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for assembled landing videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-videos', 'landing-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to product screenshots
CREATE POLICY "Public can view product screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-screenshots');

-- Allow public read access to landing videos
CREATE POLICY "Public can view landing videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'landing-videos');

-- Allow authenticated users to upload to product screenshots
CREATE POLICY "Authenticated users can upload product screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'product-screenshots' AND auth.role() = 'authenticated');

-- Allow authenticated users to upload to landing videos
CREATE POLICY "Authenticated users can upload landing videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'landing-videos' AND auth.role() = 'authenticated');

-- Clean up old individual chapter entries (keeping only full_demo entries)
-- This removes the 126 individual chapter placeholders
DELETE FROM landing_page_videos 
WHERE content_type != 'full_demo' 
  AND placement = 'hero_showcase'
  AND (video_url IS NULL OR video_url = '');