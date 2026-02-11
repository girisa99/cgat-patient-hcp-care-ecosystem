-- Add DELETE policy for tts_audio_versions
CREATE POLICY "Authenticated users can delete TTS versions"
ON public.tts_audio_versions
FOR DELETE
USING (auth.uid() IS NOT NULL);