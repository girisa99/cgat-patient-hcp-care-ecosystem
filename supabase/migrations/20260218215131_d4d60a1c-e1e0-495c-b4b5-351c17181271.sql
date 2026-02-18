-- Add 'sprint-tracker' to the channel_type check constraint for universal_save_sessions
-- First drop the existing constraint, then recreate with the new value
ALTER TABLE public.universal_save_sessions 
  DROP CONSTRAINT IF EXISTS universal_save_sessions_channel_type_check;

ALTER TABLE public.universal_save_sessions 
  ADD CONSTRAINT universal_save_sessions_channel_type_check 
  CHECK (channel_type IN ('online', 'ai_agent', 'fax', 'voice', 'chat', 'sms', 'sprint-tracker'));