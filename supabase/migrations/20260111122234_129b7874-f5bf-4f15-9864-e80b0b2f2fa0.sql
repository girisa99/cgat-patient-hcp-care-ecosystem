-- Add script_content column to genie_sessions for storing script text for invite attachments
ALTER TABLE public.genie_sessions ADD COLUMN IF NOT EXISTS script_content TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.genie_sessions.script_content IS 'Script content to be included in participant invite emails as attachment/preview';