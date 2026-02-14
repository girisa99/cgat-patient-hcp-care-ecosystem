
-- Remove provider partners from competitors (they are our integrations, not competitors)
DELETE FROM competitor_profiles WHERE name IN ('DeepL', 'ElevenLabs');

-- Update categories to remove tts/translation since those are our provider categories
-- Add replacement competitors in those categories
INSERT INTO competitor_profiles (name, website_url, category, subcategories, description, tagline, pricing_model, pricing_range, key_features, weaknesses, strengths, target_market, regions_active, languages_supported, is_active)
VALUES 
  ('Murf AI', 'https://murf.ai', 'tts', '{voice_generation,dubbing}'::TEXT[], 'AI voice generator for voiceovers', 'AI Voices that Sound Real', 'subscription', '$26-$199/mo', '{"Voice cloning","120+ voices","Studio editor","API access"}'::TEXT[], '{"Limited language depth","No video pipeline","Basic dubbing"}'::TEXT[], '{"Quality voices","Easy UI","Enterprise options"}'::TEXT[], '{"Content creators","Enterprises","E-learning"}'::TEXT[], '{"global"}'::TEXT[], 20, true),
  ('Lokalise', 'https://lokalise.com', 'translation', '{localization,i18n}'::TEXT[], 'Translation management platform for teams', 'Ship Translations Fast', 'subscription', '$120-$800/mo', '{"TMS platform","50+ integrations","AI translation","QA checks"}'::TEXT[], '{"No content creation","No video/audio","Developer-focused"}'::TEXT[], '{"Strong integrations","Team workflows","API-first"}'::TEXT[], '{"Dev teams","Product companies","Enterprises"}'::TEXT[], '{"global"}'::TEXT[], 60, true),
  ('Speechify', 'https://speechify.com', 'tts', '{text_to_speech,reading}'::TEXT[], 'Text to speech reader and voice generator', 'Turn Text Into Natural Speech', 'freemium', 'Free-$139/yr', '{"Natural voices","Browser extension","Mobile apps","Audiobook creation"}'::TEXT[], '{"Consumer-focused","No B2B pipeline","Limited API"}'::TEXT[], '{"Consumer UX","Cross-platform","Large user base"}'::TEXT[], '{"Students","Professionals","Accessibility"}'::TEXT[], '{"us","eu"}'::TEXT[], 30, true),
  ('Beautiful.ai', 'https://beautiful.ai', 'ppt', '{presentations,design}'::TEXT[], 'AI-powered presentation software with smart templates', 'Beautiful Presentations Made Simple', 'subscription', '$12-$50/mo', '{"Smart templates","AI design rules","Team collaboration","Brand controls"}'::TEXT[], '{"No video export","No multilingual","Limited AI generation","No voice/TTS"}'::TEXT[], '{"Design automation","Easy to use","Clean output"}'::TEXT[], '{"Business professionals","Marketing teams","Startups"}'::TEXT[], '{"us","eu"}'::TEXT[], 5, true)
ON CONFLICT DO NOTHING;
