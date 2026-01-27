-- Insert Genie Studio internal users for existing geniecellgene.com accounts
INSERT INTO genie_studio_users (auth_user_id, email, display_name, is_internal, is_verified, current_subscription_tier, subscription_status)
VALUES 
  ('9a1c59db-8edc-4723-b5a7-8a3b16db2b48', 'hcptest@geniecellgene.com', 'HCP Test User', true, true, 'enterprise', 'active'),
  ('48c5ebe7-a92e-4c6b-86ea-3a239a4dca6d', 'superadmintest@geniecellgene.com', 'Super Admin Test', true, true, 'enterprise', 'active'),
  ('ba3df4be-876e-4a31-92fc-1f5c7937f335', 'superadmin@geniecellgene.com', 'Super Admin', true, true, 'enterprise', 'active')
ON CONFLICT (auth_user_id) DO UPDATE SET is_internal = true;

-- Grant super_admin role to all internal users
INSERT INTO genie_studio_user_roles (user_id, role)
SELECT gsu.id, 'super_admin'::genie_studio_role
FROM genie_studio_users gsu
WHERE gsu.is_internal = true
ON CONFLICT (user_id, role) DO NOTHING;