-- =====================================================
-- GENIE STUDIO CLEAN AUTH SYSTEM
-- Completely separate from patient/provider auth
-- Google OAuth as primary authentication
-- =====================================================

-- 1. Create Genie Studio specific role enum
CREATE TYPE public.genie_studio_role AS ENUM (
  'super_admin',           -- Full platform access + internal tools
  'content_manager',       -- Marketing engine + content management
  'marketing_lead',        -- Marketing orchestration lead
  'creator',               -- Content creators (internal dogfooding)
  'subscriber_free',       -- Free tier external users
  'subscriber_starter',    -- Starter tier ($9.99)
  'subscriber_creator',    -- Creator tier ($19.99)
  'subscriber_pro',        -- Pro tier ($29.99)
  'subscriber_business',   -- Business tier ($79.99)
  'subscriber_enterprise', -- Enterprise tier (custom)
  'freelancer'             -- Future: Marketing engine users
);

-- 2. Genie Studio Users table (clean, separate from profiles)
CREATE TABLE public.genie_studio_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  
  -- Subscription info (synced from Stripe)
  stripe_customer_id TEXT,
  current_subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  subscription_start_at TIMESTAMPTZ,
  subscription_end_at TIMESTAMPTZ,
  
  -- Credits
  credit_balance INTEGER DEFAULT 0,
  
  -- Flags
  is_internal BOOLEAN DEFAULT false,  -- Internal team member
  is_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT genie_studio_users_email_unique UNIQUE (email),
  CONSTRAINT genie_studio_users_auth_unique UNIQUE (auth_user_id)
);

-- 3. Genie Studio User Roles (many-to-many)
CREATE TABLE public.genie_studio_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.genie_studio_users(id) ON DELETE CASCADE NOT NULL,
  role genie_studio_role NOT NULL,
  granted_by UUID REFERENCES public.genie_studio_users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  
  CONSTRAINT genie_studio_user_roles_unique UNIQUE (user_id, role)
);

-- 4. Marketing Engine Access (for dogfooding and future freelancers)
CREATE TABLE public.genie_marketing_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.genie_studio_users(id) ON DELETE CASCADE NOT NULL,
  access_level TEXT DEFAULT 'viewer' CHECK (access_level IN ('viewer', 'creator', 'manager', 'admin')),
  can_generate BOOLEAN DEFAULT false,
  can_publish BOOLEAN DEFAULT false,
  can_schedule BOOLEAN DEFAULT false,
  can_manage_templates BOOLEAN DEFAULT false,
  monthly_generation_limit INTEGER DEFAULT 10,
  generations_used_this_month INTEGER DEFAULT 0,
  limit_reset_at TIMESTAMPTZ DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  CONSTRAINT genie_marketing_access_user_unique UNIQUE (user_id)
);

-- 5. Enable RLS
ALTER TABLE public.genie_studio_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_studio_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_marketing_access ENABLE ROW LEVEL SECURITY;

-- 6. Security Definer function to check Genie Studio roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_genie_studio_role(_auth_user_id UUID, _role genie_studio_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.genie_studio_users gsu
    JOIN public.genie_studio_user_roles gsur ON gsu.id = gsur.user_id
    WHERE gsu.auth_user_id = _auth_user_id
      AND gsur.role = _role
      AND (gsur.expires_at IS NULL OR gsur.expires_at > NOW())
  )
$$;

-- 7. Function to check if user is internal team
CREATE OR REPLACE FUNCTION public.is_genie_internal_user(_auth_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.genie_studio_users
    WHERE auth_user_id = _auth_user_id
      AND is_internal = true
  )
$$;

-- 8. Function to check marketing engine access
CREATE OR REPLACE FUNCTION public.has_marketing_engine_access(_auth_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.genie_studio_users gsu
    JOIN public.genie_marketing_access gma ON gsu.id = gma.user_id
    WHERE gsu.auth_user_id = _auth_user_id
      AND gma.is_active = true
  )
$$;

-- 9. RLS Policies for genie_studio_users

-- Users can view their own profile
CREATE POLICY "Users can view own Genie Studio profile"
ON public.genie_studio_users
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own Genie Studio profile"
ON public.genie_studio_users
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Super admins can view all users
CREATE POLICY "Super admins can view all Genie Studio users"
ON public.genie_studio_users
FOR SELECT
TO authenticated
USING (public.has_genie_studio_role(auth.uid(), 'super_admin'));

-- Super admins can manage all users
CREATE POLICY "Super admins can manage all Genie Studio users"
ON public.genie_studio_users
FOR ALL
TO authenticated
USING (public.has_genie_studio_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_genie_studio_role(auth.uid(), 'super_admin'));

-- 10. RLS Policies for genie_studio_user_roles

-- Users can view their own roles
CREATE POLICY "Users can view own Genie Studio roles"
ON public.genie_studio_user_roles
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.genie_studio_users WHERE auth_user_id = auth.uid()
  )
);

-- Super admins can manage all roles
CREATE POLICY "Super admins can manage Genie Studio roles"
ON public.genie_studio_user_roles
FOR ALL
TO authenticated
USING (public.has_genie_studio_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_genie_studio_role(auth.uid(), 'super_admin'));

-- 11. RLS Policies for genie_marketing_access

-- Users can view their own marketing access
CREATE POLICY "Users can view own marketing access"
ON public.genie_marketing_access
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM public.genie_studio_users WHERE auth_user_id = auth.uid()
  )
);

-- Internal team can view all marketing access
CREATE POLICY "Internal team can view all marketing access"
ON public.genie_marketing_access
FOR SELECT
TO authenticated
USING (public.is_genie_internal_user(auth.uid()));

-- Super admins and marketing leads can manage marketing access
CREATE POLICY "Admins can manage marketing access"
ON public.genie_marketing_access
FOR ALL
TO authenticated
USING (
  public.has_genie_studio_role(auth.uid(), 'super_admin') OR
  public.has_genie_studio_role(auth.uid(), 'marketing_lead')
)
WITH CHECK (
  public.has_genie_studio_role(auth.uid(), 'super_admin') OR
  public.has_genie_studio_role(auth.uid(), 'marketing_lead')
);

-- 12. Auto-create Genie Studio user on signup trigger
CREATE OR REPLACE FUNCTION public.handle_genie_studio_user_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create if user signed up via Genie Studio (check metadata)
  IF NEW.raw_user_meta_data->>'signup_source' = 'genie_studio' OR
     NEW.raw_app_meta_data->>'provider' = 'google' THEN
    
    INSERT INTO public.genie_studio_users (
      auth_user_id,
      email,
      display_name,
      avatar_url,
      is_verified,
      email_verified_at
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.email_confirmed_at IS NOT NULL,
      NEW.email_confirmed_at
    )
    ON CONFLICT (auth_user_id) DO UPDATE SET
      email = EXCLUDED.email,
      display_name = COALESCE(EXCLUDED.display_name, genie_studio_users.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, genie_studio_users.avatar_url),
      updated_at = NOW();
      
    -- Auto-assign free subscriber role
    INSERT INTO public.genie_studio_user_roles (user_id, role)
    SELECT gsu.id, 'subscriber_free'::genie_studio_role
    FROM public.genie_studio_users gsu
    WHERE gsu.auth_user_id = NEW.id
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Note: Trigger on auth.users would need to be created via Supabase dashboard
-- or the user creation can be handled in the edge function

-- 13. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_genie_studio_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER genie_studio_users_updated_at
  BEFORE UPDATE ON public.genie_studio_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_genie_studio_updated_at();

CREATE TRIGGER genie_marketing_access_updated_at
  BEFORE UPDATE ON public.genie_marketing_access
  FOR EACH ROW
  EXECUTE FUNCTION public.update_genie_studio_updated_at();

-- 14. Indexes for performance
CREATE INDEX idx_genie_studio_users_auth ON public.genie_studio_users(auth_user_id);
CREATE INDEX idx_genie_studio_users_email ON public.genie_studio_users(email);
CREATE INDEX idx_genie_studio_users_internal ON public.genie_studio_users(is_internal) WHERE is_internal = true;
CREATE INDEX idx_genie_studio_user_roles_user ON public.genie_studio_user_roles(user_id);
CREATE INDEX idx_genie_studio_user_roles_role ON public.genie_studio_user_roles(role);
CREATE INDEX idx_genie_marketing_access_user ON public.genie_marketing_access(user_id);
CREATE INDEX idx_genie_marketing_access_active ON public.genie_marketing_access(is_active) WHERE is_active = true;