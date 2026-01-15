-- Create YouTube OAuth tokens table (similar to LinkedIn)
CREATE TABLE IF NOT EXISTS public.youtube_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  channel_id TEXT,
  channel_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for YouTube tokens
ALTER TABLE public.youtube_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- RLS for YouTube tokens
CREATE POLICY "Users can manage their own YouTube tokens" 
ON public.youtube_oauth_tokens 
FOR ALL 
USING (auth.uid() = user_id);

-- Create update trigger for YouTube tokens
CREATE TRIGGER update_youtube_tokens_updated_at
BEFORE UPDATE ON public.youtube_oauth_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();