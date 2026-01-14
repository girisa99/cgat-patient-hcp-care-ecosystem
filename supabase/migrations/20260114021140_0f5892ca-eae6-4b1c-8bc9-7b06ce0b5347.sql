-- Add 'rescheduled' value to the meeting_stage enum type
ALTER TYPE meeting_stage ADD VALUE IF NOT EXISTS 'rescheduled';