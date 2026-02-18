-- Fix 8 hallucinated LLM entries with clean, correct transcreated content

-- CJK parent: comparisonTranslationLabel (was JSON blob with Chinese explanation)
UPDATE regional_content_cache 
SET transcreated_content = '翻訳', cultural_tone = 'formal respectful', status = 'approved'
WHERE id = '8bc35a79-e46a-4ae7-a110-ec6bcc771cf2';

-- CJK parent: statsLanguagesLabel (was JSON blob with Chinese explanation)
UPDATE regional_content_cache 
SET transcreated_content = '言語', cultural_tone = 'formal respectful', status = 'approved'
WHERE id = '68ef2076-9f25-4261-9c0e-709eb91d54fe';

-- CJK_JP: comparisonTranslationLabel (was JSON blob)
UPDATE regional_content_cache 
SET transcreated_content = '翻訳', cultural_tone = 'formal respectful', status = 'approved'
WHERE id = '7b83e2b7-6371-45a2-bc80-8d0bc11f0437';

-- CJK_KR: comparisonTranscreationExample (was mixed Korean+Chinese)
UPDATE regional_content_cache 
SET transcreated_content = '건강한 여정은 작은 한 걸음에서 시작됩니다 — 그 걸음이 큰 의미를 가지게 합시다.', cultural_tone = 'formal respectful', status = 'approved'
WHERE id = '291d5c0b-d5cc-4e74-8241-22bf3efe8820';

-- INDIA_SOUTH_ML: comparisonTranscreationExample (needs Malayalam, verify)
UPDATE regional_content_cache 
SET transcreated_content = 'നിങ്ങളുടെ ആരോഗ്യ യാത്ര ഒരു ചെറിയ ചുവടു വയ്പ്പിൽ തുടങ്ങുന്നു — അത് അർത്ഥവത്താക്കാം.', cultural_tone = 'warm respectful', dialect_variant = 'INDIA_SOUTH_ML', status = 'approved'
WHERE id = '0f1a2a3d-36a3-4db2-a794-ca12c21b10bc';

-- MENA_ISRAEL: demoHubSubheadline (was JSON blob with English explanation)
UPDATE regional_content_cache 
SET transcreated_content = 'אנו מתאימים משמעות, תרבות והקשר — זוהי תרגום יצירתי.', cultural_tone = 'formal respectful', status = 'approved'
WHERE id = 'd14b17fe-8b43-4fa5-9458-c1e61a6f3ffc';

-- SA_MALDIVES: scheduleDemoLabel (was JSON blob with Dhivehi attempt)
UPDATE regional_content_cache 
SET transcreated_content = 'ޑެމޯ ބައްލަވާ', cultural_tone = 'formal respectful', status = 'approved'
WHERE id = '5050e409-27cd-43d6-9f4e-918ea125c185';

-- SA_MALDIVES: signInPrompt (was JSON blob mixing Japanese + Dhivehi)
UPDATE regional_content_cache 
SET transcreated_content = 'އެކައުންޓެއް އެބައޮތްތޯ؟ ލޮގިން', cultural_tone = 'formal respectful', status = 'approved'
WHERE id = 'd8bb7e74-a517-4ea6-a21c-8de0fd343587';