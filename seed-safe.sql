-- Seed subscription plans (safe data only)
INSERT INTO subscription_plans (name, price, duration_days, max_invitations, features, is_active)
VALUES
  ('Gratis', 0, 30, 1, '{"templates": ["basic"], "guests": 50, "custom_domain": false}'::jsonb, true),
  ('Basic', 99000, 30, 5, '{"templates": ["basic", "modern"], "guests": 200, "custom_domain": false, "music": true}'::jsonb, true),
  ('Premium', 199000, 60, 20, '{"templates": ["all"], "guests": 1000, "custom_domain": true, "music": true, "qr_code": true, "maps": true}'::jsonb, true),
  ('Pro', 499000, 90, 100, '{"templates": ["all", "premium"], "guests": 5000, "custom_domain": true, "music": true, "qr_code": true, "maps": true, "priority_support": true}'::jsonb, true)
ON CONFLICT (name) DO UPDATE SET
  price = EXCLUDED.price,
  duration_days = EXCLUDED.duration_days,
  max_invitations = EXCLUDED.max_invitations,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active;