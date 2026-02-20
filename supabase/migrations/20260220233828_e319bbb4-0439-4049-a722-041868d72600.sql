
-- Create security definer function to get user's team IDs without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_team_ids(p_auth_uid uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.team_id 
  FROM genie_studio_team_members m
  JOIN genie_studio_users u ON u.id = m.user_id
  WHERE u.auth_user_id = p_auth_uid;
$$;

-- Create security definer function to check if user is admin/owner of a team
CREATE OR REPLACE FUNCTION public.is_team_admin(p_auth_uid uuid, p_team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM genie_studio_team_members m
    JOIN genie_studio_users u ON u.id = m.user_id
    WHERE u.auth_user_id = p_auth_uid
      AND m.team_id = p_team_id
      AND m.role IN ('owner', 'admin')
  );
$$;

-- Drop and recreate team_members policies using security definer functions
DROP POLICY IF EXISTS "members_select" ON genie_studio_team_members;
DROP POLICY IF EXISTS "members_update" ON genie_studio_team_members;
DROP POLICY IF EXISTS "members_delete" ON genie_studio_team_members;

CREATE POLICY "members_select" ON genie_studio_team_members
  FOR SELECT TO authenticated
  USING (team_id IN (SELECT public.get_user_team_ids(auth.uid())));

CREATE POLICY "members_update" ON genie_studio_team_members
  FOR UPDATE TO authenticated
  USING (public.is_team_admin(auth.uid(), team_id));

CREATE POLICY "members_delete" ON genie_studio_team_members
  FOR DELETE TO authenticated
  USING (public.is_team_admin(auth.uid(), team_id));
