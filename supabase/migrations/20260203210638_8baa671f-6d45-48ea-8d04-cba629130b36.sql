-- Fix RLS policies for brand-assets bucket to allow authenticated uploads

-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-assets', 'brand-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Brand assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update brand assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete brand assets" ON storage.objects;

-- Create policies for brand-assets bucket
CREATE POLICY "Brand assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-assets');

CREATE POLICY "Authenticated users can upload brand assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update brand assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'brand-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete brand assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'brand-assets' AND auth.role() = 'authenticated');