-- Create Instagram OAuth tokens table (uses Facebook Graph API)
CREATE TABLE IF NOT EXISTS public.instagram_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  instagram_user_id TEXT,
  username TEXT,
  profile_picture_url TEXT,
  facebook_page_id TEXT,
  facebook_page_name TEXT,
  business_accounts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create TikTok OAuth tokens table
CREATE TABLE IF NOT EXISTS public.tiktok_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  open_id TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_business_account BOOLEAN DEFAULT false,
  business_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.instagram_oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for Instagram
CREATE POLICY "Users can view own Instagram tokens" ON public.instagram_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own Instagram tokens" ON public.instagram_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own Instagram tokens" ON public.instagram_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own Instagram tokens" ON public.instagram_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for TikTok
CREATE POLICY "Users can view own TikTok tokens" ON public.tiktok_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own TikTok tokens" ON public.tiktok_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own TikTok tokens" ON public.tiktok_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own TikTok tokens" ON public.tiktok_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_instagram_oauth_tokens_updated_at
  BEFORE UPDATE ON public.instagram_oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tiktok_oauth_tokens_updated_at
  BEFORE UPDATE ON public.tiktok_oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_instagram_oauth_user ON public.instagram_oauth_tokens(user_id);
CREATE INDEX idx_tiktok_oauth_user ON public.tiktok_oauth_tokens(user_id);