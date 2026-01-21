-- Create table to store Google Slides OAuth tokens
CREATE TABLE IF NOT EXISTS public.google_slides_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_slides_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tokens
CREATE POLICY "Users can view their own Google Slides tokens"
ON public.google_slides_tokens
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google Slides tokens"
ON public.google_slides_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Slides tokens"
ON public.google_slides_tokens
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Slides tokens"
ON public.google_slides_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Service role needs access for edge functions
CREATE POLICY "Service role can manage all tokens"
ON public.google_slides_tokens
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Add updated_at trigger
CREATE TRIGGER update_google_slides_tokens_updated_at
BEFORE UPDATE ON public.google_slides_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();