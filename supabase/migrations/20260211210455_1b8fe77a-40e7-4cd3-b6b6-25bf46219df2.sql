-- Add 'tts_feedback' to the allowed note_type values
ALTER TABLE public.script_improvement_notes 
DROP CONSTRAINT script_improvement_notes_note_type_check;

ALTER TABLE public.script_improvement_notes 
ADD CONSTRAINT script_improvement_notes_note_type_check 
CHECK (note_type = ANY (ARRAY['reviewer_comment', 'ab_learning', 'ai_suggestion', 'performance_insight', 'tts_feedback']::text[]));