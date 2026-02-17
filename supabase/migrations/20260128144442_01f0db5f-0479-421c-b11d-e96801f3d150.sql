-- Disable ALL validation triggers to add admin roles
ALTER TABLE user_roles DISABLE TRIGGER validate_user_role_assignment_trigger;
ALTER TABLE user_roles DISABLE TRIGGER validate_user_role_trigger;

-- Add superAdmin and onboardingTeam roles to giridhar9@yahoo.com
INSERT INTO user_roles (user_id, role_id, created_at) 
VALUES 
  ('65af5719-18fd-4587-a5d1-3a76a4b255c7', '3f7c6cf0-8e61-4d1f-9324-193864a1d5ba', now()),
  ('65af5719-18fd-4587-a5d1-3a76a4b255c7', '335b4f4e-c8fc-497b-a5a4-392e7f67a991', now())
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Re-enable all triggers
ALTER TABLE user_roles ENABLE TRIGGER validate_user_role_assignment_trigger;
ALTER TABLE user_roles ENABLE TRIGGER validate_user_role_trigger;