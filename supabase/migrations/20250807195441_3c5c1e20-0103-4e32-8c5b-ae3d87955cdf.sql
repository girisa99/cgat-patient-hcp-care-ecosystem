-- Add demo user roles to the existing role system
-- This extends the current role system to support demo accounts

-- First, add demo roles to the existing app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'demo_user';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'demo_admin';  
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'demo_superadmin';

-- Create demo_accounts table for managing demo user sessions
CREATE TABLE IF NOT EXISTS public.demo_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  demo_role public.app_role NOT NULL CHECK (demo_role IN ('demo_user', 'demo_admin', 'demo_superadmin')),
  demo_session_id TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  demo_config JSONB DEFAULT '{
    "mode": "full",
    "allowDataEntry": false,
    "showDemoIndicators": true,
    "mockDataEnabled": true,
    "guidedTourEnabled": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, demo_role)
);

-- Enable RLS on demo_accounts
ALTER TABLE public.demo_accounts ENABLE ROW LEVEL SECURITY;

-- Demo users can only see their own demo account info
CREATE POLICY "Demo users can view their own demo account"
ON public.demo_accounts
FOR SELECT
USING (auth.uid() = user_id);

-- Only authenticated users can create demo accounts (for self-registration)
CREATE POLICY "Users can create their own demo accounts"
ON public.demo_accounts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Demo users can update their own demo config
CREATE POLICY "Demo users can update their own demo config"
ON public.demo_accounts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins and superadmins can manage all demo accounts
CREATE POLICY "Admins can manage demo accounts"
ON public.demo_accounts
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'superadmin')
);

-- Create function to check if user has demo role
CREATE OR REPLACE FUNCTION public.has_demo_role(_user_id uuid, _demo_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.demo_accounts da
    WHERE da.user_id = _user_id
      AND da.demo_role = _demo_role
      AND da.expires_at > now()
  )
$$;

-- Create function to get user's demo config
CREATE OR REPLACE FUNCTION public.get_demo_config(_user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(da.demo_config, '{}'::jsonb)
  FROM public.demo_accounts da
  WHERE da.user_id = _user_id
    AND da.expires_at > now()
  LIMIT 1
$$;

-- Create function to extend demo account expiration
CREATE OR REPLACE FUNCTION public.extend_demo_account(_user_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.demo_accounts 
  SET expires_at = now() + interval '7 days',
      last_accessed = now()
  WHERE user_id = _user_id;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_demo_accounts_user_id ON public.demo_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_accounts_session_id ON public.demo_accounts(demo_session_id);
CREATE INDEX IF NOT EXISTS idx_demo_accounts_expires_at ON public.demo_accounts(expires_at);

-- Add trigger to automatically clean up expired demo accounts
CREATE OR REPLACE FUNCTION public.cleanup_expired_demo_accounts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.demo_accounts 
  WHERE expires_at < now() - interval '1 day';
  RETURN NULL;
END;
$$;

-- Create trigger that runs periodically (when demo accounts are accessed)
CREATE OR REPLACE TRIGGER trigger_cleanup_expired_demo_accounts
  AFTER INSERT OR UPDATE ON public.demo_accounts
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_expired_demo_accounts();