-- Seed subscription plans
INSERT INTO subscription_plans (name, price, duration_days, max_invitations, features, is_active)
VALUES
  ('Gratis', 0, 30, 1, '{"templates": ["basic"], "guests": 50, "custom_domain": false}', true),
  ('Basic', 99000, 30, 5, '{"templates": ["basic", "modern"], "guests": 200, "custom_domain": false, "music": true}', true),
  ('Premium', 199000, 60, 20, '{"templates": ["all"], "guests": 1000, "custom_domain": true, "music": true, "qr_code": true, "maps": true}', true),
  ('Pro', 499000, 90, 100, '{"templates": ["all", "premium"], "guests": 5000, "custom_domain": true, "music": true, "qr_code": true, "maps": true, "priority_support": true}', true)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  duration_days = EXCLUDED.duration_days,
  max_invitations = EXCLUDED.max_invitations,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;

-- Seed admin user (email: admin@undanganku.id)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
SELECT
  gen_random_uuid(),
  'admin@undanganku.id',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"full_name": "Admin UndanganKu"}'
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@undanganku.id');

-- Create profile for admin
INSERT INTO profiles (id, full_name, email, created_at)
SELECT id, raw_user_meta_data->>'full_name', email, created_at
FROM auth.users
WHERE email = 'admin@undanganku.id'
ON CONFLICT (id) DO NOTHING;

-- Grant admin role
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@undanganku.id'
ON CONFLICT (user_id, role) DO NOTHING;