-- Add whitelabel configuration table for teams
CREATE TABLE IF NOT EXISTS public.genie_studio_whitelabel_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.genie_studio_teams(id) ON DELETE CASCADE UNIQUE,
  app_name TEXT DEFAULT 'Genie Studio',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1F2937',
  accent_color TEXT DEFAULT '#10B981',
  custom_domain TEXT,
  custom_css TEXT,
  header_text TEXT,
  footer_text TEXT,
  login_message TEXT,
  hide_powered_by BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.genie_studio_whitelabel_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Team admins can manage whitelabel
CREATE POLICY "wl_team_admin" ON public.genie_studio_whitelabel_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.genie_studio_team_members tm
      JOIN public.genie_studio_users gsu ON gsu.id = tm.user_id
      WHERE tm.team_id = genie_studio_whitelabel_configs.team_id 
        AND gsu.auth_user_id = auth.uid() 
        AND tm.role IN ('owner', 'admin')
    )
  );

-- Add status column to team invitations if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'genie_studio_team_invitations' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.genie_studio_team_invitations ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'));
  END IF;
END $$;

-- Create index on whitelabel config team_id
CREATE INDEX IF NOT EXISTS idx_whitelabel_team ON public.genie_studio_whitelabel_configs(team_id);

-- Create trigger for updated_at
CREATE TRIGGER update_whitelabel_updated_at
  BEFORE UPDATE ON public.genie_studio_whitelabel_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();