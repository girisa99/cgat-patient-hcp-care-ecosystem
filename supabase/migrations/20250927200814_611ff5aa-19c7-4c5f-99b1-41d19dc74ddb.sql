-- Create tables for public conversations (simplified approach)
CREATE TABLE public.public_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  title text,
  conversation_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  context_type text NOT NULL DEFAULT 'technology',
  metadata jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  ip_address inet,
  escalation_requested boolean DEFAULT false,
  privacy_accepted boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Rate limiting table
CREATE TABLE public.public_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address inet NOT NULL,
  requests_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  last_request timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.public_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_rate_limits ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for public access
CREATE POLICY "Public conversations accessible" ON public.public_conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Rate limits accessible" ON public.public_rate_limits FOR ALL USING (true) WITH CHECK (true);