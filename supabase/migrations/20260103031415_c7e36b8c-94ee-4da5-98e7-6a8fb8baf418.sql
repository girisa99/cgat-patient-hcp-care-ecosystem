-- Add show_id column to genie_scripts to link scripts to productions
ALTER TABLE public.genie_scripts 
ADD COLUMN IF NOT EXISTS show_id UUID REFERENCES public.shows(id) ON DELETE SET NULL;

-- Add purpose column for script type (video, audio, podcast, webcast, etc.)
ALTER TABLE public.genie_scripts 
ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'video';

-- Create index for efficient queries by show
CREATE INDEX IF NOT EXISTS idx_genie_scripts_show_id ON public.genie_scripts(show_id);

-- Add host_name and guest_info columns to shows for participant details
ALTER TABLE public.shows 
ADD COLUMN IF NOT EXISTS host_name TEXT,
ADD COLUMN IF NOT EXISTS guest_info JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS linked_script_id UUID,
ADD COLUMN IF NOT EXISTS linked_music_id UUID;

-- Create index for linked assets
CREATE INDEX IF NOT EXISTS idx_shows_linked_script ON public.shows(linked_script_id);

-- Update RLS policy to allow users to link scripts to their shows
-- (Existing policies should already handle this since both tables use user_id)