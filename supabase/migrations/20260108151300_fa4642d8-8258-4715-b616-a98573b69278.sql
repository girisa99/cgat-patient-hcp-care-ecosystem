-- Create presentations table for managing multiple presentations
CREATE TABLE public.presentations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  thumbnail_url TEXT,
  og_image_url TEXT,
  
  -- Presentation metadata
  presentation_type VARCHAR(100) DEFAULT 'general',
  category VARCHAR(100),
  tags TEXT[],
  
  -- Content and config
  slides_data JSONB DEFAULT '[]'::jsonb,
  configuration JSONB DEFAULT '{}'::jsonb,
  branding JSONB DEFAULT '{}'::jsonb,
  
  -- Social sharing
  linkedin_post_template TEXT,
  twitter_post_template TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Status
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create presentation shares tracking
CREATE TABLE public.presentation_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  platform VARCHAR(50) NOT NULL,
  share_url TEXT,
  post_id TEXT,
  post_content TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  shared_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create LinkedIn OAuth tokens table
CREATE TABLE public.linkedin_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for presentations
CREATE POLICY "Users can view their own presentations" 
ON public.presentations 
FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create their own presentations" 
ON public.presentations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations" 
ON public.presentations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations" 
ON public.presentations 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS for presentation shares
CREATE POLICY "Users can view their own shares" 
ON public.presentation_shares 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create shares" 
ON public.presentation_shares 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS for LinkedIn tokens
CREATE POLICY "Users can manage their own tokens" 
ON public.linkedin_oauth_tokens 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_presentations_user_id ON public.presentations(user_id);
CREATE INDEX idx_presentations_slug ON public.presentations(slug);
CREATE INDEX idx_presentations_status ON public.presentations(status);
CREATE INDEX idx_presentations_is_public ON public.presentations(is_public);
CREATE INDEX idx_presentation_shares_presentation_id ON public.presentation_shares(presentation_id);

-- Update trigger
CREATE TRIGGER update_presentations_updated_at
BEFORE UPDATE ON public.presentations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linkedin_tokens_updated_at
BEFORE UPDATE ON public.linkedin_oauth_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();