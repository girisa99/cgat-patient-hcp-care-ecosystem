
-- H-705: Complete cast-assets bucket provisioning (some policies already exist)
-- Drop and recreate to ensure consistency
DO $$
BEGIN
  -- Only create policies that don't exist yet
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload cast assets' AND tablename = 'objects') THEN
    CREATE POLICY "Users can upload cast assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'cast-assets'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for cast assets' AND tablename = 'objects') THEN
    CREATE POLICY "Public read access for cast assets"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'cast-assets');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own cast assets' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete own cast assets"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'cast-assets'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;
