-- Add show_id column to media_projects for linking to Production Hub shows
ALTER TABLE public.media_projects ADD COLUMN show_id uuid REFERENCES public.shows(id) ON DELETE SET NULL;

-- Create unique index to prevent duplicate projects per show
CREATE UNIQUE INDEX idx_media_projects_show_id ON public.media_projects(show_id) WHERE show_id IS NOT NULL;

-- Create index for faster lookups
CREATE INDEX idx_media_projects_show_lookup ON public.media_projects(show_id, user_id);