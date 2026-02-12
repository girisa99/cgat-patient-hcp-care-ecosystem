UPDATE regional_narration_scripts 
SET tts_voice_id = 'ar-SA-FaridNeural', 
    tts_voice_name = 'Farid (Saudi Arabic - MENA Accent)',
    updated_at = now()
WHERE region_code = 'mena' AND language_code = 'en' AND is_english_base = true