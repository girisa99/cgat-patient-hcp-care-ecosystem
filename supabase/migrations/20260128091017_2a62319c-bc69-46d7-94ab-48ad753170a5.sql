
-- Create Genie Studio user with Enterprise tier (max) for testing
INSERT INTO public.genie_studio_users (
  auth_user_id,
  email,
  display_name,
  current_subscription_tier,
  subscription_status,
  is_internal,
  is_verified,
  credit_balance
) VALUES (
  '65af5719-18fd-4587-a5d1-3a76a4b255c7',
  'giridhar9@yahoo.com',
  'Giri Dasika',
  'enterprise',
  'active',
  true,
  true,
  999999
) ON CONFLICT (auth_user_id) DO UPDATE SET
  current_subscription_tier = 'enterprise',
  subscription_status = 'active',
  is_internal = true,
  credit_balance = 999999;

-- Assign super_admin role for full access
INSERT INTO public.genie_studio_user_roles (user_id, role)
SELECT id, 'super_admin'::genie_studio_role
FROM public.genie_studio_users
WHERE auth_user_id = '65af5719-18fd-4587-a5d1-3a76a4b255c7'
ON CONFLICT (user_id, role) DO NOTHING;
