-- Security Migration: Fix function search_path and tighten RLS policies
-- This migration addresses security warnings from the Supabase linter

-- First drop the existing get_or_create_user_credits function to change return type
DROP FUNCTION IF EXISTS public.get_or_create_user_credits(UUID);

-- Fix function search_path for deduct_ai_credits
CREATE OR REPLACE FUNCTION public.deduct_ai_credits(
  p_user_id UUID,
  p_feature_id TEXT,
  p_units INTEGER DEFAULT 1,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE(success BOOLEAN, credits_deducted INTEGER, balance_after INTEGER, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_feature ai_feature_costs;
  v_credits user_ai_credits;
  v_cost INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get feature cost
  SELECT * INTO v_feature FROM public.ai_feature_costs WHERE id = p_feature_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 'Feature not found or inactive'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate total cost
  v_cost := v_feature.credits_per_unit * p_units;
  
  -- Get or create user credits
  SELECT * INTO v_credits FROM public.user_ai_credits WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.user_ai_credits (user_id, credits_balance)
    VALUES (p_user_id, 10)
    RETURNING * INTO v_credits;
  END IF;
  
  -- Check if user has enough credits
  IF v_credits.credits_balance < v_cost THEN
    RETURN QUERY SELECT false, 0, v_credits.credits_balance, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;
  
  -- Deduct credits
  v_new_balance := v_credits.credits_balance - v_cost;
  
  UPDATE public.user_ai_credits
  SET credits_balance = v_new_balance,
      credits_used_total = credits_used_total + v_cost,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.ai_credit_transactions (
    user_id, transaction_type, credits_amount, balance_after,
    feature_used, feature_metadata, description
  ) VALUES (
    p_user_id, 'usage', -v_cost, v_new_balance,
    p_feature_id, p_metadata, 
    format('Used %s credits for %s', v_cost, v_feature.display_name)
  );
  
  RETURN QUERY SELECT true, v_cost, v_new_balance, NULL::TEXT;
END;
$$;

-- Recreate get_or_create_user_credits with proper search_path
CREATE OR REPLACE FUNCTION public.get_or_create_user_credits(p_user_id UUID)
RETURNS TABLE(
  user_id UUID,
  credits_balance INTEGER,
  credits_used_total INTEGER,
  credits_purchased_total INTEGER,
  subscription_credits_monthly INTEGER,
  subscription_credits_used INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Try to get existing credits
  RETURN QUERY
  SELECT 
    uc.user_id,
    uc.credits_balance,
    uc.credits_used_total,
    uc.credits_purchased_total,
    uc.subscription_credits_monthly,
    uc.subscription_credits_used,
    uc.created_at,
    uc.updated_at
  FROM public.user_ai_credits uc
  WHERE uc.user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Create new credits record with 10 free credits
    INSERT INTO public.user_ai_credits (
      user_id, 
      credits_balance, 
      credits_used_total, 
      credits_purchased_total,
      subscription_credits_monthly,
      subscription_credits_used
    )
    VALUES (p_user_id, 10, 0, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN QUERY
    SELECT 
      uc.user_id,
      uc.credits_balance,
      uc.credits_used_total,
      uc.credits_purchased_total,
      uc.subscription_credits_monthly,
      uc.subscription_credits_used,
      uc.created_at,
      uc.updated_at
    FROM public.user_ai_credits uc
    WHERE uc.user_id = p_user_id;
  END IF;
END;
$$;

-- Fix function search_path for log_security_event
DROP FUNCTION IF EXISTS public.log_security_event(UUID, TEXT, TEXT, TEXT, JSONB);

CREATE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    user_id, event_type, severity, description, metadata, created_at
  ) VALUES (
    p_user_id, p_event_type, p_severity, p_description, p_metadata, now()
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Add RLS policies for ai_credit_transactions to be user-scoped
ALTER TABLE public.ai_credit_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.ai_credit_transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.ai_credit_transactions;
DROP POLICY IF EXISTS "Users can view their own credit transactions" ON public.ai_credit_transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON public.ai_credit_transactions;

-- Create proper user-scoped RLS policies
CREATE POLICY "Users can view their own credit transactions"
ON public.ai_credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Add RLS policies for user_ai_credits
ALTER TABLE public.user_ai_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_ai_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_ai_credits;
DROP POLICY IF EXISTS "Service role can manage user credits" ON public.user_ai_credits;

CREATE POLICY "Users can view their own credits"
ON public.user_ai_credits
FOR SELECT
USING (auth.uid() = user_id);

-- Add RLS for ai_feature_costs (public read)
ALTER TABLE public.ai_feature_costs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view feature costs" ON public.ai_feature_costs;
DROP POLICY IF EXISTS "Service role can manage feature costs" ON public.ai_feature_costs;

CREATE POLICY "Anyone can view feature costs"
ON public.ai_feature_costs
FOR SELECT
USING (true);

-- Add RLS for ai_credit_packages (public read)
ALTER TABLE public.ai_credit_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view credit packages" ON public.ai_credit_packages;
DROP POLICY IF EXISTS "Service role can manage credit packages" ON public.ai_credit_packages;

CREATE POLICY "Anyone can view credit packages"
ON public.ai_credit_packages
FOR SELECT
USING (true);