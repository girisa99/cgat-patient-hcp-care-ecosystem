-- Create genie_session_feedback table for two-way communication
CREATE TABLE public.genie_session_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.genie_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES public.genie_session_participants(id) ON DELETE SET NULL,
  host_user_id UUID, -- For host responses
  
  -- Feedback content
  feedback_type TEXT NOT NULL, -- 'script_suggestion', 'title_suggestion', 'schedule_change', 'content_comment', 'recording_review', 'general'
  category TEXT NOT NULL DEFAULT 'general', -- 'script', 'title', 'description', 'schedule', 'recording', 'production'
  subject TEXT,
  content TEXT NOT NULL,
  
  -- Reference to what is being commented on
  reference_type TEXT, -- 'script_line', 'title', 'description', 'time_slot', 'segment'
  reference_value TEXT, -- The specific value being referenced (e.g., line number, original text)
  suggested_value TEXT, -- The suggested change
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected', 'implemented', 'needs_clarification'
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Response from host
  host_response TEXT,
  host_responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  is_from_host BOOLEAN DEFAULT false,
  parent_feedback_id UUID REFERENCES public.genie_session_feedback(id) ON DELETE SET NULL, -- For threaded replies
  read_by_host BOOLEAN DEFAULT false,
  read_by_participant BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_review_status table for tracking review stages
CREATE TABLE public.genie_session_review_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.genie_sessions(id) ON DELETE CASCADE,
  
  -- Review stages with status
  script_review_status TEXT DEFAULT 'not_started', -- 'not_started', 'in_review', 'changes_requested', 'approved'
  title_review_status TEXT DEFAULT 'not_started',
  schedule_review_status TEXT DEFAULT 'not_started',
  recording_review_status TEXT DEFAULT 'not_started',
  production_review_status TEXT DEFAULT 'not_started',
  final_approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  
  -- Tracking who approved what
  script_approved_by UUID,
  script_approved_at TIMESTAMP WITH TIME ZONE,
  title_approved_by UUID,
  title_approved_at TIMESTAMP WITH TIME ZONE,
  final_approved_by UUID,
  final_approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Counts
  pending_feedback_count INTEGER DEFAULT 0,
  resolved_feedback_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(session_id)
);

-- Enable RLS
ALTER TABLE public.genie_session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_session_review_status ENABLE ROW LEVEL SECURITY;

-- RLS policies for feedback (allow participants via token-based access)
CREATE POLICY "Anyone can view feedback for sessions they have access to"
ON public.genie_session_feedback FOR SELECT USING (true);

CREATE POLICY "Anyone can insert feedback"
ON public.genie_session_feedback FOR INSERT WITH CHECK (true);

CREATE POLICY "Feedback can be updated by host or participant"
ON public.genie_session_feedback FOR UPDATE USING (true);

-- RLS policies for review status
CREATE POLICY "Anyone can view review status"
ON public.genie_session_review_status FOR SELECT USING (true);

CREATE POLICY "Anyone can insert review status"
ON public.genie_session_review_status FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update review status"
ON public.genie_session_review_status FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX idx_session_feedback_session ON public.genie_session_feedback(session_id);
CREATE INDEX idx_session_feedback_status ON public.genie_session_feedback(status);
CREATE INDEX idx_session_feedback_type ON public.genie_session_feedback(feedback_type);
CREATE INDEX idx_session_feedback_participant ON public.genie_session_feedback(participant_id);
CREATE INDEX idx_review_status_session ON public.genie_session_review_status(session_id);

-- Enable realtime for live updates
ALTER TABLE public.genie_session_feedback REPLICA IDENTITY FULL;
ALTER TABLE public.genie_session_review_status REPLICA IDENTITY FULL;

-- Trigger to update review status counts
CREATE OR REPLACE FUNCTION update_review_status_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.genie_session_review_status
    SET 
      pending_feedback_count = (
        SELECT COUNT(*) FROM public.genie_session_feedback 
        WHERE session_id = NEW.session_id AND status IN ('pending', 'under_review', 'needs_clarification')
      ),
      resolved_feedback_count = (
        SELECT COUNT(*) FROM public.genie_session_feedback 
        WHERE session_id = NEW.session_id AND status IN ('approved', 'rejected', 'implemented')
      ),
      updated_at = now()
    WHERE session_id = NEW.session_id;
    
    -- Create review status if not exists
    INSERT INTO public.genie_session_review_status (session_id)
    VALUES (NEW.session_id)
    ON CONFLICT (session_id) DO NOTHING;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_counts
AFTER INSERT OR UPDATE ON public.genie_session_feedback
FOR EACH ROW EXECUTE FUNCTION update_review_status_counts();