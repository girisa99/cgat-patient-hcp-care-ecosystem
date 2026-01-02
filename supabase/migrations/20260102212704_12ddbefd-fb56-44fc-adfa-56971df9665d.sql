-- Create genie_scripts table for storing video and audio scripts
-- This consolidates script storage that was previously in localStorage

CREATE TABLE IF NOT EXISTS public.genie_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'audio')),
  enhanced_content TEXT,
  clean_content TEXT, -- Clean version for TTS (no pause markers)
  draft_content TEXT,
  draft_status TEXT CHECK (draft_status IN ('in_progress', 'completed')),
  draft_changes JSONB,
  stats JSONB, -- {wordCount, sentenceCount, characterCount, estimatedReadingMinutes, estimatedSpeakingMinutes, readabilityScore}
  has_voiceover BOOLEAN DEFAULT false,
  voiceover_id UUID REFERENCES public.generated_media(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genie_scripts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own scripts"
  ON public.genie_scripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scripts"
  ON public.genie_scripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scripts"
  ON public.genie_scripts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scripts"
  ON public.genie_scripts FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE TRIGGER update_genie_scripts_updated_at
  BEFORE UPDATE ON public.genie_scripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_genie_scripts_user_id ON public.genie_scripts(user_id);
CREATE INDEX idx_genie_scripts_type ON public.genie_scripts(type);

-- Add comments
COMMENT ON TABLE public.genie_scripts IS 'Stores video and audio scripts for Genie Studio with enhancement workflow support';
COMMENT ON COLUMN public.genie_scripts.type IS 'Script type: video or audio';
COMMENT ON COLUMN public.genie_scripts.enhanced_content IS 'AI-enhanced version of the script';
COMMENT ON COLUMN public.genie_scripts.clean_content IS 'Clean version for TTS (pause markers removed)';
COMMENT ON COLUMN public.genie_scripts.draft_status IS 'Status of enhancement review: in_progress or completed';