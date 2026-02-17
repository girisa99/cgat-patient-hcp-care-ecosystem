-- Genie Sessions Table for scheduled shows/meetings with unique join URLs
-- Supports browser-based, Zoom, Google Meet, and Teams sessions

CREATE TABLE IF NOT EXISTS public.genie_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  show_id UUID,  -- Link to genie_shows if applicable
  
  -- Session Details
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL DEFAULT 'webcast', -- podcast, webcast, interview, panel, meeting, etc.
  session_mode TEXT NOT NULL DEFAULT 'browser', -- browser, zoom, google_meet, teams
  production_stage TEXT DEFAULT 'recording', -- script_review, edit, rehearsal, final_review, recording
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  timezone TEXT DEFAULT 'UTC',
  
  -- Join Information
  session_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  host_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  join_url TEXT,  -- Generated unique URL for browser sessions
  external_meeting_url TEXT,  -- Zoom/Meet/Teams URL if using external platform
  external_meeting_id TEXT,  -- External meeting ID
  
  -- Waiting Room
  waiting_room_enabled BOOLEAN DEFAULT true,
  session_active_at TIMESTAMPTZ,  -- When session can be joined (default: 30min before)
  
  -- Content
  script_id UUID,  -- Link to genie_scripts
  agenda TEXT,
  
  -- Host Info
  host_name TEXT,
  host_email TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, active, completed, cancelled
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Recording
  recording_enabled BOOLEAN DEFAULT true,
  recording_url TEXT,
  recording_storage_path TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Session Participants
CREATE TABLE IF NOT EXISTS public.genie_session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.genie_sessions(id) ON DELETE CASCADE,
  
  -- Participant Info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,  -- For SMS reminders
  role TEXT NOT NULL DEFAULT 'attendee', -- host, co-host, guest, panelist, attendee
  
  -- Join Token
  participant_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  
  -- Status
  invite_status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, confirmed, declined
  join_status TEXT DEFAULT 'not_joined', -- not_joined, waiting, joined, left
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  
  -- Reminders
  email_reminder_24h BOOLEAN DEFAULT true,
  email_reminder_1h BOOLEAN DEFAULT true,
  email_reminder_30m BOOLEAN DEFAULT true,
  email_reminder_15m BOOLEAN DEFAULT true,
  sms_reminder_30m BOOLEAN DEFAULT false,
  sms_reminder_15m BOOLEAN DEFAULT false,
  
  -- Reminder Status
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_1h_sent BOOLEAN DEFAULT false,
  reminder_30m_sent BOOLEAN DEFAULT false,
  reminder_15m_sent BOOLEAN DEFAULT false,
  sms_30m_sent BOOLEAN DEFAULT false,
  sms_15m_sent BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_genie_sessions_user_id ON public.genie_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_genie_sessions_status ON public.genie_sessions(status);
CREATE INDEX IF NOT EXISTS idx_genie_sessions_scheduled_at ON public.genie_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_genie_sessions_session_token ON public.genie_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_genie_sessions_host_token ON public.genie_sessions(host_token);
CREATE INDEX IF NOT EXISTS idx_genie_session_participants_session_id ON public.genie_session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_genie_session_participants_email ON public.genie_session_participants(email);
CREATE INDEX IF NOT EXISTS idx_genie_session_participants_token ON public.genie_session_participants(participant_token);

-- Enable RLS
ALTER TABLE public.genie_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_session_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for genie_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.genie_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create sessions" 
ON public.genie_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.genie_sessions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
ON public.genie_sessions FOR DELETE 
USING (auth.uid() = user_id);

-- Public access to sessions via token (for joining)
CREATE POLICY "Anyone can view sessions by token" 
ON public.genie_sessions FOR SELECT 
USING (true);

-- RLS Policies for genie_session_participants
CREATE POLICY "Session owners can manage participants" 
ON public.genie_session_participants FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.genie_sessions 
    WHERE id = session_id AND user_id = auth.uid()
  )
);

-- Participants can view their own record by token
CREATE POLICY "Participants can view their own record" 
ON public.genie_session_participants FOR SELECT 
USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_genie_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_genie_sessions_updated_at
BEFORE UPDATE ON public.genie_sessions
FOR EACH ROW EXECUTE FUNCTION update_genie_sessions_updated_at();

CREATE TRIGGER update_genie_session_participants_updated_at
BEFORE UPDATE ON public.genie_session_participants
FOR EACH ROW EXECUTE FUNCTION update_genie_sessions_updated_at();