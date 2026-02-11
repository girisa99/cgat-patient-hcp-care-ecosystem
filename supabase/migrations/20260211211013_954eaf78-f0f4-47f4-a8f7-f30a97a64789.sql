-- Fix section_target constraint to match actual TTS_ISSUE_AREAS IDs in code
ALTER TABLE public.script_improvement_notes 
DROP CONSTRAINT script_improvement_notes_section_target_check;

ALTER TABLE public.script_improvement_notes 
ADD CONSTRAINT script_improvement_notes_section_target_check 
CHECK (
  section_target = ANY (ARRAY[
    'hook', 'problem_statement', 'solution', 'cta', 'full_script', 'general',
    'voice_quality', 'pronunciation', 'pacing', 'emotional_tone', 'provider_issue', 'content_mismatch',
    'pacing_timing', 'voice_tone', 'tts_provider_issue'
  ]::text[])
  OR section_target ~ '^[a-z_]+(,[a-z_]+)*$'
);