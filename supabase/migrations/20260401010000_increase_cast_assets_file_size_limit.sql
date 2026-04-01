-- Production bucket for final rendered videos (stitched from 12+ parts)
-- Separate from cast-assets (100MB per-file, for individual parts/clips)
-- to keep storage clean and enforce appropriate limits per use case.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cast-renders',
  'cast-renders',
  true,
  2147483648, -- 2GB max per file (full-length rendered videos)
  ARRAY['video/mp4', 'video/webm', 'image/jpeg']
)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 2147483648;

-- Public read access (rendered videos are shared/downloaded)
CREATE POLICY "Public read access for cast renders"
ON storage.objects FOR SELECT
USING (bucket_id = 'cast-renders');

-- Service role upload (only RunPod worker uploads via service key)
CREATE POLICY "Service role upload for cast renders"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cast-renders'
  AND (auth.role() = 'service_role' OR auth.uid() IS NOT NULL)
);

-- Allow updates (upsert for re-renders)
CREATE POLICY "Service role update for cast renders"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cast-renders'
  AND (auth.role() = 'service_role' OR auth.uid() IS NOT NULL)
);

-- Allow deletes (cleanup old renders)
CREATE POLICY "Service role delete for cast renders"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cast-renders'
  AND (auth.role() = 'service_role' OR auth.uid() IS NOT NULL)
);
