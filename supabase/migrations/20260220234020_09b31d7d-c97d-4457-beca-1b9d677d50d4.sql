
-- Fix FK: owner_user_id should reference genie_studio_users, not auth.users
ALTER TABLE genie_studio_teams
  DROP CONSTRAINT genie_studio_teams_owner_user_id_fkey;

ALTER TABLE genie_studio_teams
  ADD CONSTRAINT genie_studio_teams_owner_user_id_fkey
  FOREIGN KEY (owner_user_id) REFERENCES genie_studio_users(id) ON DELETE CASCADE;
