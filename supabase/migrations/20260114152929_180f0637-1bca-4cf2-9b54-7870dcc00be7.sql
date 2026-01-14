-- Create vibe_recordings table for storing recording sessions and drafts
CREATE TABLE public.vibe_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Recording',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'archived')),
  recording_type TEXT NOT NULL DEFAULT 'video' CHECK (recording_type IN ('video', 'audio', 'photo', 'screen', 'pip')),
  
  -- File references (stored in genie-media bucket)
  file_url TEXT,
  thumbnail_url TEXT,
  
  -- Recording metadata
  duration_seconds NUMERIC(10, 2),
  file_size_bytes BIGINT,
  mime_type TEXT,
  
  -- Session data (clips, timeline, etc.)
  session_data JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vibe_timeline_clips table for individual clips in a session
CREATE TABLE public.vibe_timeline_clips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recording_id UUID NOT NULL REFERENCES public.vibe_recordings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Clip metadata
  clip_type TEXT NOT NULL DEFAULT 'video' CHECK (clip_type IN ('video', 'audio', 'image', 'text')),
  name TEXT NOT NULL DEFAULT 'Clip',
  source_url TEXT,
  thumbnail_url TEXT,
  
  -- Timeline positioning
  start_time NUMERIC(10, 3) NOT NULL DEFAULT 0,
  duration NUMERIC(10, 3) NOT NULL DEFAULT 5,
  in_point NUMERIC(10, 3) NOT NULL DEFAULT 0,
  out_point NUMERIC(10, 3) NOT NULL DEFAULT 5,
  track INTEGER NOT NULL DEFAULT 0,
  
  -- Clip properties
  volume NUMERIC(3, 2) DEFAULT 1.0,
  opacity NUMERIC(3, 2) DEFAULT 1.0,
  
  -- Effects and metadata
  effects JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  
  -- Order in timeline
  order_index INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vibe_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_timeline_clips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vibe_recordings
CREATE POLICY "Users can view their own recordings"
  ON public.vibe_recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recordings"
  ON public.vibe_recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings"
  ON public.vibe_recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings"
  ON public.vibe_recordings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for vibe_timeline_clips
CREATE POLICY "Users can view their own clips"
  ON public.vibe_timeline_clips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clips"
  ON public.vibe_timeline_clips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips"
  ON public.vibe_timeline_clips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips"
  ON public.vibe_timeline_clips FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_vibe_recordings_user_id ON public.vibe_recordings(user_id);
CREATE INDEX idx_vibe_recordings_status ON public.vibe_recordings(status);
CREATE INDEX idx_vibe_timeline_clips_recording_id ON public.vibe_timeline_clips(recording_id);
CREATE INDEX idx_vibe_timeline_clips_user_id ON public.vibe_timeline_clips(user_id);

-- Updated at trigger
CREATE TRIGGER update_vibe_recordings_updated_at
  BEFORE UPDATE ON public.vibe_recordings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vibe_timeline_clips_updated_at
  BEFORE UPDATE ON public.vibe_timeline_clips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();