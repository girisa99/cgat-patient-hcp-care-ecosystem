-- Genie Studio Team Subscription Infrastructure
-- Pro: 5 seats (invite only), Business: 15 seats (full collab), Enterprise: unlimited

-- Team roles enum
CREATE TYPE public.genie_team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Teams table
CREATE TABLE public.genie_studio_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL DEFAULT 'pro' CHECK (subscription_tier IN ('pro', 'business', 'enterprise')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  max_seats INTEGER NOT NULL DEFAULT 5,
  current_seat_count INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team members table
CREATE TABLE public.genie_studio_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.genie_studio_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role genie_team_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TABLE public.genie_studio_team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.genie_studio_teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role genie_team_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tier configuration table
CREATE TABLE public.genie_subscription_tier_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  max_seats INTEGER,
  price_monthly_usd DECIMAL(10,2),
  price_yearly_usd DECIMAL(10,2),
  has_workspace BOOLEAN NOT NULL DEFAULT false,
  has_team_invite BOOLEAN NOT NULL DEFAULT false,
  has_collaboration BOOLEAN NOT NULL DEFAULT false,
  has_role_permissions BOOLEAN NOT NULL DEFAULT false,
  has_team_analytics BOOLEAN NOT NULL DEFAULT false,
  has_shared_assets BOOLEAN NOT NULL DEFAULT false,
  credits_monthly INTEGER NOT NULL DEFAULT 0,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert tier configurations
INSERT INTO public.genie_subscription_tier_config 
  (tier_name, display_name, max_seats, price_monthly_usd, price_yearly_usd, has_workspace, has_team_invite, has_collaboration, has_role_permissions, has_team_analytics, has_shared_assets, credits_monthly, features) 
VALUES
  ('free', 'Free', NULL, 0, 0, false, false, false, false, false, false, 25, '{"basic_generation": true}'),
  ('starter', 'Starter', NULL, 12, 120, false, false, false, false, false, false, 100, '{"basic_generation": true, "templates": true}'),
  ('creator', 'Creator', NULL, 29, 290, false, false, false, false, false, false, 300, '{"basic_generation": true, "templates": true, "voice_clone": true}'),
  ('pro', 'Pro', 5, 59, 590, true, true, false, false, false, false, 600, '{"basic_generation": true, "templates": true, "voice_clone": true, "priority_render": true}'),
  ('business', 'Business', 15, 149, 1490, true, true, true, true, true, true, 1500, '{"basic_generation": true, "templates": true, "voice_clone": true, "priority_render": true, "api_access": true}'),
  ('enterprise', 'Enterprise', NULL, NULL, NULL, true, true, true, true, true, true, -1, '{"unlimited": true, "custom_integrations": true, "dedicated_support": true}');

-- Helper function: Check if team can add more members
CREATE OR REPLACE FUNCTION public.can_add_team_member(p_team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM genie_studio_teams t
    JOIN genie_subscription_tier_config c ON c.tier_name = t.subscription_tier
    WHERE t.id = p_team_id
    AND t.is_active = true
    AND (c.max_seats IS NULL OR t.current_seat_count < c.max_seats)
  );
$$;

-- Helper function: Get user's team role
CREATE OR REPLACE FUNCTION public.get_user_team_role(p_user_id UUID, p_team_id UUID)
RETURNS genie_team_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM genie_studio_team_members
  WHERE user_id = p_user_id AND team_id = p_team_id
  LIMIT 1;
$$;

-- Helper function: Check if user has team feature access
CREATE OR REPLACE FUNCTION public.has_team_feature(p_user_id UUID, p_feature TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM genie_studio_team_members tm
    JOIN genie_studio_teams t ON t.id = tm.team_id
    JOIN genie_subscription_tier_config c ON c.tier_name = t.subscription_tier
    WHERE tm.user_id = p_user_id
    AND t.is_active = true
    AND (
      (p_feature = 'workspace' AND c.has_workspace = true) OR
      (p_feature = 'team_invite' AND c.has_team_invite = true) OR
      (p_feature = 'collaboration' AND c.has_collaboration = true) OR
      (p_feature = 'role_permissions' AND c.has_role_permissions = true) OR
      (p_feature = 'team_analytics' AND c.has_team_analytics = true) OR
      (p_feature = 'shared_assets' AND c.has_shared_assets = true)
    )
  );
$$;

-- Trigger: Update seat count on member changes
CREATE OR REPLACE FUNCTION public.update_team_seat_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE genie_studio_teams SET current_seat_count = current_seat_count + 1, updated_at = now() WHERE id = NEW.team_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE genie_studio_teams SET current_seat_count = current_seat_count - 1, updated_at = now() WHERE id = OLD.team_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_team_seat_count
AFTER INSERT OR DELETE ON public.genie_studio_team_members
FOR EACH ROW EXECUTE FUNCTION public.update_team_seat_count();

-- Enable RLS
ALTER TABLE public.genie_studio_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_studio_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_studio_team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_subscription_tier_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Teams
CREATE POLICY "Users can view teams they belong to" ON public.genie_studio_teams
  FOR SELECT USING (
    owner_user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM genie_studio_team_members WHERE team_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Team owners can update their teams" ON public.genie_studio_teams
  FOR UPDATE USING (owner_user_id = auth.uid());

CREATE POLICY "Authenticated users can create teams" ON public.genie_studio_teams
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

-- RLS Policies: Team Members
CREATE POLICY "Team members can view their team members" ON public.genie_studio_team_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM genie_studio_team_members m WHERE m.team_id = team_id AND m.user_id = auth.uid())
  );

CREATE POLICY "Team owners/admins can manage members" ON public.genie_studio_team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM genie_studio_teams t 
      WHERE t.id = team_id AND (
        t.owner_user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM genie_studio_team_members m WHERE m.team_id = t.id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
      )
    )
  );

-- RLS Policies: Invitations
CREATE POLICY "Team admins can manage invitations" ON public.genie_studio_team_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM genie_studio_teams t 
      WHERE t.id = team_id AND (
        t.owner_user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM genie_studio_team_members m WHERE m.team_id = t.id AND m.user_id = auth.uid() AND m.role IN ('owner', 'admin'))
      )
    )
  );

CREATE POLICY "Invited users can view their invitations" ON public.genie_studio_team_invitations
  FOR SELECT USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- RLS Policies: Tier config (public read)
CREATE POLICY "Anyone can view tier config" ON public.genie_subscription_tier_config
  FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX idx_genie_team_members_user ON public.genie_studio_team_members(user_id);
CREATE INDEX idx_genie_team_members_team ON public.genie_studio_team_members(team_id);
CREATE INDEX idx_genie_team_invitations_email ON public.genie_studio_team_invitations(email);
CREATE INDEX idx_genie_team_invitations_token ON public.genie_studio_team_invitations(token);