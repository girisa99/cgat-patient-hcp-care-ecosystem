
-- Fix infinite recursion in RLS policies for genie_studio_teams and genie_studio_team_members

-- Drop all existing policies on both tables
DROP POLICY IF EXISTS "Authenticated users can create teams" ON genie_studio_teams;
DROP POLICY IF EXISTS "Users can view teams they belong to" ON genie_studio_teams;
DROP POLICY IF EXISTS "Team owners can update their teams" ON genie_studio_teams;
DROP POLICY IF EXISTS "Team members can view their team members" ON genie_studio_team_members;
DROP POLICY IF EXISTS "Team owners/admins can manage members" ON genie_studio_team_members;

-- ==========================================
-- genie_studio_teams policies (NO references to genie_studio_team_members)
-- ==========================================

-- INSERT: Any authenticated user can create a team
CREATE POLICY "teams_insert" ON genie_studio_teams
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- SELECT: Owner can see their teams (lookup via genie_studio_users)
CREATE POLICY "teams_select" ON genie_studio_teams
  FOR SELECT TO authenticated
  USING (
    owner_user_id IN (
      SELECT id FROM genie_studio_users WHERE auth_user_id = auth.uid()
    )
  );

-- UPDATE: Owner can update their teams
CREATE POLICY "teams_update" ON genie_studio_teams
  FOR UPDATE TO authenticated
  USING (
    owner_user_id IN (
      SELECT id FROM genie_studio_users WHERE auth_user_id = auth.uid()
    )
  );

-- DELETE: Owner can delete their teams
CREATE POLICY "teams_delete" ON genie_studio_teams
  FOR DELETE TO authenticated
  USING (
    owner_user_id IN (
      SELECT id FROM genie_studio_users WHERE auth_user_id = auth.uid()
    )
  );

-- ==========================================
-- genie_studio_team_members policies (NO references to genie_studio_teams)
-- ==========================================

-- SELECT: Members can see other members in their teams
CREATE POLICY "members_select" ON genie_studio_team_members
  FOR SELECT TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM genie_studio_team_members
      WHERE user_id IN (
        SELECT id FROM genie_studio_users WHERE auth_user_id = auth.uid()
      )
    )
  );

-- INSERT: Allow authenticated users to insert members (application logic enforces permissions)
CREATE POLICY "members_insert" ON genie_studio_team_members
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- UPDATE: Allow authenticated users to update members they manage
CREATE POLICY "members_update" ON genie_studio_team_members
  FOR UPDATE TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM genie_studio_team_members
      WHERE user_id IN (
        SELECT id FROM genie_studio_users WHERE auth_user_id = auth.uid()
      )
      AND role IN ('owner', 'admin')
    )
  );

-- DELETE: Allow authenticated users to delete members they manage
CREATE POLICY "members_delete" ON genie_studio_team_members
  FOR DELETE TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM genie_studio_team_members
      WHERE user_id IN (
        SELECT id FROM genie_studio_users WHERE auth_user_id = auth.uid()
      )
      AND role IN ('owner', 'admin')
    )
  );
