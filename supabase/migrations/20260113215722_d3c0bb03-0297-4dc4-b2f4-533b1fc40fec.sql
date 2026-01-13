-- Create meeting_minutes table to store transcripts, summaries, action items
CREATE TABLE public.meeting_minutes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.genie_sessions(id) ON DELETE CASCADE,
  show_id UUID REFERENCES public.shows(id) ON DELETE CASCADE,
  
  -- Meeting metadata
  meeting_title TEXT NOT NULL,
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER,
  host_id UUID,
  host_name TEXT,
  
  -- Transcript and content
  transcript JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  decisions JSONB DEFAULT '[]'::jsonb,
  
  -- Participants who attended
  participants JSONB DEFAULT '[]'::jsonb,
  
  -- Recording info
  recording_url TEXT,
  recording_consent_given BOOLEAN DEFAULT false,
  consent_given_at TIMESTAMP WITH TIME ZONE,
  
  -- AI-generated insights
  ai_summary TEXT,
  topics_discussed JSONB DEFAULT '[]'::jsonb,
  sentiment_analysis JSONB,
  
  -- Sharing and distribution
  shared_with JSONB DEFAULT '[]'::jsonb,
  last_shared_at TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN DEFAULT false,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'shared', 'archived')),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.meeting_minutes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view meeting minutes they created or were shared with"
ON public.meeting_minutes
FOR SELECT
USING (
  auth.uid() = created_by 
  OR auth.uid() = host_id 
  OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(participants) AS p 
    WHERE (p->>'user_id')::uuid = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(shared_with) AS s 
    WHERE (s->>'user_id')::uuid = auth.uid()
  )
);

CREATE POLICY "Users can create meeting minutes"
ON public.meeting_minutes
FOR INSERT
WITH CHECK (auth.uid() = created_by OR auth.uid() = host_id);

CREATE POLICY "Users can update meeting minutes they created or host"
ON public.meeting_minutes
FOR UPDATE
USING (auth.uid() = created_by OR auth.uid() = host_id);

CREATE POLICY "Users can delete meeting minutes they created"
ON public.meeting_minutes
FOR DELETE
USING (auth.uid() = created_by);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_meeting_minutes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_meeting_minutes_updated_at
BEFORE UPDATE ON public.meeting_minutes
FOR EACH ROW
EXECUTE FUNCTION public.update_meeting_minutes_updated_at();

-- Create indexes
CREATE INDEX idx_meeting_minutes_session_id ON public.meeting_minutes(session_id);
CREATE INDEX idx_meeting_minutes_show_id ON public.meeting_minutes(show_id);
CREATE INDEX idx_meeting_minutes_host_id ON public.meeting_minutes(host_id);
CREATE INDEX idx_meeting_minutes_created_by ON public.meeting_minutes(created_by);
CREATE INDEX idx_meeting_minutes_status ON public.meeting_minutes(status);

-- Add recording consent notification tracking to genie_sessions
ALTER TABLE public.genie_sessions 
ADD COLUMN IF NOT EXISTS recording_consent_shown BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recording_consent_acknowledged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS recording_consent_acknowledged_by JSONB DEFAULT '[]'::jsonb;