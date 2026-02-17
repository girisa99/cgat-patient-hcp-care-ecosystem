
-- Backfill missing audio_url in tts_audio_versions from completed tts_jobs
UPDATE tts_audio_versions tv
SET audio_url = tj.audio_url
FROM tts_jobs tj
WHERE tv.audio_url IS NULL
  AND tj.audio_url IS NOT NULL
  AND tj.status = 'complete'
  AND tv.tts_provider = tj.provider
  AND tv.characters_processed = tj.char_count
  AND ABS(EXTRACT(EPOCH FROM (tv.generated_at - tj.created_at))) < 5;

-- Also backfill the regional_narration_scripts generated_audio_url
UPDATE regional_narration_scripts rns
SET generated_audio_url = tv.audio_url,
    updated_at = now()
FROM tts_audio_versions tv
WHERE rns.id = tv.script_id
  AND rns.generated_audio_url IS NULL
  AND tv.audio_url IS NOT NULL
  AND tv.status = 'completed';
