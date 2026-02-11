
-- Backfill NULL created_by with the current authenticated user (for existing scripts)
UPDATE public.regional_narration_scripts 
SET created_by = '65af5719-18fd-4587-a5d1-3a76a4b255c7'
WHERE created_by IS NULL;

-- Set default for created_by on future inserts
ALTER TABLE public.regional_narration_scripts 
ALTER COLUMN created_by SET DEFAULT auth.uid();

-- Drop and recreate a more permissive UPDATE policy for authenticated users
DROP POLICY IF EXISTS "Users can update own scripts" ON public.regional_narration_scripts;
CREATE POLICY "Authenticated users can update scripts"
ON public.regional_narration_scripts
FOR UPDATE
USING (auth.uid() IS NOT NULL);

-- Also fix: backfill created_by on tts_audio_versions if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tts_audio_versions' AND column_name = 'created_by'
  ) THEN
    UPDATE public.tts_audio_versions SET created_by = '65af5719-18fd-4587-a5d1-3a76a4b255c7' WHERE created_by IS NULL;
  END IF;
END $$;
