-- Migrate target_persona, positioning_angle, emotional_tone from text to text[]
-- Step 1: Add new array columns
ALTER TABLE public.regional_narration_scripts 
  ADD COLUMN target_personas text[] DEFAULT '{}',
  ADD COLUMN positioning_angles text[] DEFAULT '{}',
  ADD COLUMN emotional_tones text[] DEFAULT '{}';

-- Step 2: Migrate existing data (single values → arrays)
UPDATE public.regional_narration_scripts 
SET target_personas = CASE WHEN target_persona IS NOT NULL AND target_persona != '' THEN ARRAY[target_persona] ELSE '{}' END,
    positioning_angles = CASE WHEN positioning_angle IS NOT NULL AND positioning_angle != '' THEN ARRAY[positioning_angle] ELSE '{}' END,
    emotional_tones = CASE WHEN emotional_tone IS NOT NULL AND emotional_tone != '' THEN ARRAY[emotional_tone] ELSE '{}' END;

-- Step 3: Drop old columns
ALTER TABLE public.regional_narration_scripts 
  DROP COLUMN target_persona,
  DROP COLUMN positioning_angle,
  DROP COLUMN emotional_tone;