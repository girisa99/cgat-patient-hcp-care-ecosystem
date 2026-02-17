-- Create event category enum
CREATE TYPE public.event_category AS ENUM ('media_production', 'business_meeting', 'event');

-- Expand show_type to include new types
ALTER TYPE public.show_type ADD VALUE IF NOT EXISTS 'broadcast';
ALTER TYPE public.show_type ADD VALUE IF NOT EXISTS 'discovery_call';
ALTER TYPE public.show_type ADD VALUE IF NOT EXISTS 'sales_meeting';
ALTER TYPE public.show_type ADD VALUE IF NOT EXISTS 'project_kickoff';
ALTER TYPE public.show_type ADD VALUE IF NOT EXISTS 'status_update';
ALTER TYPE public.show_type ADD VALUE IF NOT EXISTS 'consultation';
ALTER TYPE public.show_type ADD VALUE IF NOT EXISTS 'workshop';
ALTER TYPE public.show_type ADD VALUE IF NOT EXISTS 'webinar';
ALTER TYPE public.show_type ADD VALUE IF NOT EXISTS 'conference';
ALTER TYPE public.show_type ADD VALUE IF NOT EXISTS 'training_session';

-- Create meeting-specific stages enum
CREATE TYPE public.meeting_stage AS ENUM ('scheduled', 'confirmed', 'agenda_prep', 'in_progress', 'follow_up', 'completed', 'cancelled');

-- Create event-specific stages enum  
CREATE TYPE public.event_stage AS ENUM ('planning', 'promotion', 'registration', 'live', 'wrap_up', 'archived', 'cancelled');

-- Add event_category column to shows table
ALTER TABLE public.shows 
ADD COLUMN IF NOT EXISTS event_category public.event_category DEFAULT 'media_production';

-- Add meeting_stage column for meeting types
ALTER TABLE public.shows 
ADD COLUMN IF NOT EXISTS meeting_stage public.meeting_stage;

-- Add event_stage column for event types
ALTER TABLE public.shows 
ADD COLUMN IF NOT EXISTS event_stage public.event_stage;

-- Add additional fields for meetings/events
ALTER TABLE public.shows 
ADD COLUMN IF NOT EXISTS agenda TEXT,
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS attendees_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Create index for faster queries by category
CREATE INDEX IF NOT EXISTS idx_shows_event_category ON public.shows(event_category);
CREATE INDEX IF NOT EXISTS idx_shows_meeting_stage ON public.shows(meeting_stage);
CREATE INDEX IF NOT EXISTS idx_shows_event_stage ON public.shows(event_stage);

-- Update existing records to have correct category based on show_type
UPDATE public.shows 
SET event_category = 'media_production' 
WHERE event_category IS NULL;