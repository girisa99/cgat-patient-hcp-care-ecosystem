
-- Step 1: Fix the incorrectly flagged Arabic script - it's not an English base
UPDATE regional_narration_scripts
SET is_english_base = false
WHERE id = 'e688e72d-6bad-4cb7-bfae-103e36ee83aa';

-- Step 2: Insert a proper English base script for MENA (without full_script - it's generated)
INSERT INTO regional_narration_scripts (
  region_code, region_display_name, language_code, language_display_name,
  hook, problem_statement, solution, cta,
  tts_provider, tts_voice_id, tts_voice_name, tts_speed, tts_pitch,
  status, is_english_base, is_default, version, variant_label,
  llm_provider, llm_model, routing_zone, routing_decision,
  positioning_angles, emotional_tones, target_personas
) VALUES (
  'mena', 'MENA (English Base)', 'en', 'English',
  'Every day, millions of marketers across the Middle East and North Africa face a painful reality — the digital tools they rely on were never built for their world.',
  'Arabic text breaks apart. Right-to-left layouts collapse. Cultural nuances get lost in translation. From Gulf boardrooms in Dubai to creative agencies in Cairo, from tech startups in Amman to enterprises in Casablanca — professionals are forced to work with platforms that treat Arabic as an afterthought. The result? Campaigns that feel foreign to your own audience.',
  'Genie AI changes everything. Purpose-built for the MENA region, our platform speaks your language — literally. Seven Arabic dialects. Native RTL support from the ground up. Gulf business Arabic for Saudi and UAE. Egyptian colloquial for the region''s most-watched content. Levantine for media. Maghrebi with seamless French-Arabic code-switching. Every script is transcreated — not just translated — to resonate authentically with your specific market.',
  'Join the MENA marketers already creating content that feels local, sounds local, and converts locally. Start your free trial today and experience AI that truly understands your region.',
  'azure', 'en-US-JennyNeural', 'Jenny (US English)', 1.0, 1.0,
  'active', true, true, 1, 'MENA English Base',
  'manual', 'manual', 'mena', 'Manually created English base for MENA region transcreation pipeline',
  ARRAY['regional-first', 'arabic-native', 'cultural-authenticity'],
  ARRAY['inspiring', 'authoritative', 'empathetic'],
  ARRAY['MENA Marketing Director', 'Gulf Enterprise CMO', 'Arabic Content Creator']
);
