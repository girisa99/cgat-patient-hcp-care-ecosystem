-- Relax section_target constraint to allow TTS multi-select values (comma-separated)
ALTER TABLE public.script_improvement_notes 
DROP CONSTRAINT script_improvement_notes_section_target_check;

ALTER TABLE public.script_improvement_notes 
ADD CONSTRAINT script_improvement_notes_section_target_check 
CHECK (
  section_target = ANY (ARRAY[
    'hook', 'problem_statement', 'solution', 'cta', 'full_script', 'general',
    'voice_quality', 'pronunciation', 'pacing', 'emotional_tone', 'provider_issue', 'content_mismatch'
  ]::text[])
  OR section_target ~ '^(voice_quality|pronunciation|pacing|emotional_tone|provider_issue|content_mismatch)(,(voice_quality|pronunciation|pacing|emotional_tone|provider_issue|content_mismatch))*$'
);