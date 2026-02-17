-- Complete migration for session activity tracking and notifications

-- 1. Add script_attachment columns to genie_sessions
ALTER TABLE public.genie_sessions ADD COLUMN IF NOT EXISTS script_attachment_url TEXT;
ALTER TABLE public.genie_sessions ADD COLUMN IF NOT EXISTS script_filename TEXT;

-- 2. Create genie_session_activity table for tracking changes
CREATE TABLE public.genie_session_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.genie_sessions(id) ON DELETE CASCADE,
  user_id UUID,
  activity_type TEXT NOT NULL,
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  previous_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Create genie_session_notifications table
CREATE TABLE public.genie_session_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.genie_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.genie_session_participants(id) ON DELETE CASCADE,
  activity_id UUID,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.genie_session_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_session_notifications ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for genie_session_activity
CREATE POLICY "Users can view activity for their sessions" 
ON public.genie_session_activity FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.genie_sessions gs WHERE gs.id = session_id AND gs.user_id = auth.uid()));

CREATE POLICY "Users can insert activity for their sessions" 
ON public.genie_session_activity FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.genie_sessions gs WHERE gs.id = session_id AND gs.user_id = auth.uid()));

-- 6. Create RLS policies for genie_session_notifications
CREATE POLICY "Users can view session notifications" 
ON public.genie_session_notifications FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.genie_sessions gs WHERE gs.id = session_id AND gs.user_id = auth.uid()));

CREATE POLICY "Users can update session notifications" 
ON public.genie_session_notifications FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.genie_sessions gs WHERE gs.id = session_id AND gs.user_id = auth.uid()));

CREATE POLICY "System can insert notifications" 
ON public.genie_session_notifications FOR INSERT WITH CHECK (true);

-- 7. Create indexes
CREATE INDEX idx_session_activity_session ON public.genie_session_activity(session_id);
CREATE INDEX idx_session_activity_time ON public.genie_session_activity(created_at DESC);
CREATE INDEX idx_session_notifications_session ON public.genie_session_notifications(session_id);
CREATE INDEX idx_session_notifications_participant ON public.genie_session_notifications(participant_id);

-- 8. Enable realtime for notifications
ALTER TABLE public.genie_session_notifications REPLICA IDENTITY FULL;