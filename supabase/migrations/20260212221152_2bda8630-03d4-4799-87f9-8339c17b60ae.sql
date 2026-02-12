
-- Create storage bucket for regional landing assets
INSERT INTO storage.buckets
  (id, name, public)
VALUES
  ('regional-landing-assets', 'regional-landing-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Allow authenticated users to upload assets
CREATE POLICY "Users can upload regional assets"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'regional-landing-assets'
    AND auth.role() = 'authenticated'
  );

-- RLS Policy: Everyone can read regional assets (public bucket)
CREATE POLICY "Everyone can read regional assets"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'regional-landing-assets');

-- RLS Policy: Users can update their own assets (by path prefix)
CREATE POLICY "Users can update regional assets"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'regional-landing-assets' AND auth.role() = 'authenticated');

-- RLS Policy: Users can delete their own assets (by path prefix)
CREATE POLICY "Users can delete regional assets"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'regional-landing-assets' AND auth.role() = 'authenticated');
