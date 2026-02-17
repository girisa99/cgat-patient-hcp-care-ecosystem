-- Create universal save sessions table for cross-channel save/resume functionality
CREATE TABLE IF NOT EXISTS public.universal_save_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('patient_enrollment', 'agent_session', 'onboarding', 'npi_verification')),
  current_step TEXT NOT NULL,
  form_data JSONB NOT NULL DEFAULT '{}',
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  channel_type TEXT NOT NULL CHECK (channel_type IN ('online', 'ai_agent', 'fax', 'voice', 'chat', 'sms')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.universal_save_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own save sessions" 
ON public.universal_save_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own save sessions" 
ON public.universal_save_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own save sessions" 
ON public.universal_save_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own save sessions" 
ON public.universal_save_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_universal_save_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_universal_save_sessions_updated_at
BEFORE UPDATE ON public.universal_save_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_universal_save_sessions_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_universal_save_sessions_user_id ON public.universal_save_sessions(user_id);
CREATE INDEX idx_universal_save_sessions_session_type ON public.universal_save_sessions(session_type);
CREATE INDEX idx_universal_save_sessions_channel_type ON public.universal_save_sessions(channel_type);
CREATE INDEX idx_universal_save_sessions_updated_at ON public.universal_save_sessions(updated_at DESC);