-- Assign superAdmin role to superadmin@geniecellgene.com user
INSERT INTO user_roles (user_id, role_id)
VALUES ('ba3df4be-876e-4a31-92fc-1f5c7937f335', '3f7c6cf0-8e61-4d1f-9324-193864a1d5ba')
ON CONFLICT (user_id, role_id) DO NOTHING;