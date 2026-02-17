-- Fix existing TTS file that was saved with wrong metadataType
UPDATE generated_media 
SET metadata = jsonb_set(metadata, '{type}', '"tts"')
WHERE id = 'ca7aea9f-0e24-4b93-bf19-2574d9db1609'
AND metadata->>'type' = 'voiceover'
AND name ILIKE '%TTS%';