
-- Fix FK: user_id should reference genie_studio_users, not auth.users
ALTER TABLE genie_studio_team_members
  DROP CONSTRAINT genie_studio_team_members_user_id_fkey;

ALTER TABLE genie_studio_team_members
  ADD CONSTRAINT genie_studio_team_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES genie_studio_users(id) ON DELETE CASCADE;

-- Fix FK: invited_by should also reference genie_studio_users
ALTER TABLE genie_studio_team_members
  DROP CONSTRAINT genie_studio_team_members_invited_by_fkey;

ALTER TABLE genie_studio_team_members
  ADD CONSTRAINT genie_studio_team_members_invited_by_fkey
  FOREIGN KEY (invited_by) REFERENCES genie_studio_users(id);
