-- =====================================================
-- SUBSCRIPTION INFRASTRUCTURE - P0 Implementation
-- =====================================================

-- 1. Subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'starter', 'business', 'pro', 'enterprise', 'beta');

-- 2. Subscription status enum  
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'past_due', 'suspended', 'churned', 'beta');

-- 3. Account type enum
CREATE TYPE public.account_type AS ENUM ('individual', 'team', 'organization', 'enterprise');

-- 4. Subscription role enum
CREATE TYPE public.subscription_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- 5. Subscription tiers definition table
CREATE TABLE public.subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  stripe_product_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  default_modules TEXT[] DEFAULT '{}',
  max_users INTEGER DEFAULT 1,
  feature_limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. User subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL REFERENCES public.subscription_tiers(id) DEFAULT 'free',
  status public.subscription_status DEFAULT 'trial',
  account_type public.account_type DEFAULT 'individual',
  subscription_role public.subscription_role DEFAULT 'owner',
  
  -- Module access
  modules_enabled TEXT[] DEFAULT '{}',
  modules_disabled TEXT[] DEFAULT '{}',
  module_limits JSONB DEFAULT '{}',
  
  -- Special flags
  is_beta_user BOOLEAN DEFAULT false,
  is_grandfathered BOOLEAN DEFAULT false,
  
  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Billing periods
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id)
);

-- 7. Subscription modules definition
CREATE TABLE public.subscription_modules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_core BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Usage tracking table
CREATE TABLE public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.user_subscriptions(id) ON DELETE CASCADE,
  module_id TEXT REFERENCES public.subscription_modules(id),
  usage_type TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for subscription_tiers (public read)
CREATE POLICY "Anyone can view subscription tiers"
ON public.subscription_tiers FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- 11. RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 12. RLS Policies for subscription_modules (public read)
CREATE POLICY "Anyone can view subscription modules"
ON public.subscription_modules FOR SELECT
TO authenticated
USING (is_active = true);

-- 13. RLS Policies for subscription_usage
CREATE POLICY "Users can view their own usage"
ON public.subscription_usage FOR SELECT
TO authenticated
USING (
  subscription_id IN (
    SELECT id FROM public.user_subscriptions WHERE user_id = auth.uid()
  )
);

-- 14. Insert subscription tier definitions with Stripe IDs
INSERT INTO public.subscription_tiers (id, name, display_name, description, price_monthly, price_yearly, stripe_product_id, stripe_price_id_monthly, default_modules, max_users, feature_limits, sort_order) VALUES
('free', 'free', 'Free', 'Limited trial with watermarked exports', 0, 0, NULL, NULL, 
  ARRAY['genie_studio'], 1, 
  '{"recordings_per_month": 3, "ai_scripts": 5, "tts_voices": 2, "templates": 3}'::jsonb, 1),
  
('starter', 'starter', 'Starter', 'Core features for creators and travelers', 9.99, 95.90, 
  'prod_TlkXDVA4NXZrx6', 'price_1SoD2hCEkh96ps4f9SU3pLVL',
  ARRAY['genie_studio', 'recording_studio', 'document_processing'], 1,
  '{"recordings_per_month": -1, "ai_scripts": 100, "tts_voices": 10, "templates": 20}'::jsonb, 2),
  
('business', 'business', 'Business', 'Team features for small businesses', 29.99, 287.90,
  'prod_TlkYpiRUnldeAk', 'price_1SoD35CEkh96ps4f5bUVwLVm',
  ARRAY['genie_studio', 'recording_studio', 'document_processing', 'product_demos', 'testimonials'], 3,
  '{"recordings_per_month": -1, "ai_scripts": 500, "tts_voices": 20, "templates": 50}'::jsonb, 3),
  
('pro', 'pro', 'Pro', 'Full studio for education and agencies', 79.99, 767.90,
  'prod_TlkYBT75Nu2vt5', 'price_1SoD3QCEkh96ps4fI0kTG9oo',
  ARRAY['genie_studio', 'recording_studio', 'document_processing', 'product_demos', 'testimonials', 'lesson_builder', 'training_modules', 'api_services'], 10,
  '{"recordings_per_month": -1, "ai_scripts": 2000, "tts_voices": -1, "templates": -1}'::jsonb, 4),
  
('enterprise', 'enterprise', 'Enterprise', 'Compliance, white-label, and SLA for large organizations', 0, 0, NULL, NULL,
  ARRAY['genie_studio', 'recording_studio', 'document_processing', 'product_demos', 'testimonials', 'lesson_builder', 'training_modules', 'api_services', 'agent_builder', 'white_label', 'hipaa_compliance'], -1,
  '{"recordings_per_month": -1, "ai_scripts": -1, "tts_voices": -1, "templates": -1}'::jsonb, 5),
  
('beta', 'beta', 'Beta', 'Full access for beta testers during development', 0, 0, NULL, NULL,
  ARRAY['genie_studio', 'recording_studio', 'document_processing', 'product_demos', 'testimonials', 'lesson_builder', 'training_modules', 'api_services', 'agent_builder', 'white_label', 'hipaa_compliance', 'mcp_tools', 'analytics'], -1,
  '{"recordings_per_month": -1, "ai_scripts": -1, "tts_voices": -1, "templates": -1}'::jsonb, 0);

-- 15. Insert module definitions
INSERT INTO public.subscription_modules (id, name, description, category, is_core, sort_order) VALUES
('genie_studio', 'Genie Studio', 'AI-powered video creation studio', 'core', true, 1),
('recording_studio', 'Recording Studio', 'Multi-clip timeline and recording', 'media', true, 2),
('document_processing', 'Document Processing', 'AI document analysis and extraction', 'documents', true, 3),
('product_demos', 'Product Demos', 'Create product demonstration videos', 'business', false, 4),
('testimonials', 'Testimonial Collector', 'Collect and manage customer testimonials', 'business', false, 5),
('lesson_builder', 'Lesson Builder', 'Create educational content and lessons', 'education', false, 6),
('training_modules', 'Training Modules', 'Enterprise training content creation', 'education', false, 7),
('api_services', 'API Services', 'External API integrations', 'integration', false, 8),
('agent_builder', 'Agent Builder', 'Build custom AI agents', 'development', false, 9),
('mcp_tools', 'MCP Tools', 'Model Context Protocol tools', 'integration', false, 10),
('white_label', 'White Label', 'Custom branding and white-label config', 'enterprise', false, 11),
('hipaa_compliance', 'HIPAA Compliance', 'Healthcare compliance features', 'enterprise', false, 12),
('analytics', 'Analytics Dashboard', 'Usage analytics and reporting', 'reporting', false, 13);

-- 16. Create beta subscriptions for ALL existing users
INSERT INTO public.user_subscriptions (user_id, tier, status, is_beta_user, modules_enabled, module_limits)
SELECT 
  id as user_id,
  'beta' as tier,
  'beta' as status,
  true as is_beta_user,
  ARRAY['genie_studio', 'recording_studio', 'document_processing', 'product_demos', 'testimonials', 'lesson_builder', 'training_modules', 'api_services', 'agent_builder', 'white_label', 'hipaa_compliance', 'mcp_tools', 'analytics'] as modules_enabled,
  '{"recordings_per_month": -1, "ai_scripts": -1, "tts_voices": -1, "templates": -1}'::jsonb as module_limits
FROM auth.users;

-- 17. Create trigger to auto-create beta subscription for new users during dev
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier, status, is_beta_user, modules_enabled, module_limits)
  VALUES (
    NEW.id,
    'beta',
    'beta',
    true,
    ARRAY['genie_studio', 'recording_studio', 'document_processing', 'product_demos', 'testimonials', 'lesson_builder', 'training_modules', 'api_services', 'agent_builder', 'white_label', 'hipaa_compliance', 'mcp_tools', 'analytics'],
    '{"recordings_per_month": -1, "ai_scripts": -1, "tts_voices": -1, "templates": -1}'::jsonb
  );
  RETURN NEW;
END;
$$;

-- 18. Create trigger on auth.users for new signups
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- 19. Helper function to check subscription tier access
CREATE OR REPLACE FUNCTION public.has_module_access(_user_id uuid, _module_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_subscriptions
    WHERE user_id = _user_id
      AND (
        is_beta_user = true
        OR _module_id = ANY(modules_enabled)
      )
      AND status IN ('active', 'trial', 'beta')
      AND NOT (_module_id = ANY(COALESCE(modules_disabled, '{}')))
  )
$$;

-- 20. Helper function to get user subscription tier
CREATE OR REPLACE FUNCTION public.get_user_subscription_tier(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tier
  FROM public.user_subscriptions
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- 21. Updated_at trigger for user_subscriptions
CREATE TRIGGER set_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();