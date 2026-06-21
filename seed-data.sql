-- ============================================
-- SEED DATA untuk Invitation SaaS
-- Paste ini ke: Supabase Dashboard > SQL Editor > New Query
-- ============================================

-- 1. Hapus data lama (jika ada)
DELETE FROM subscription_plans;

-- 2. Insert subscription plans
INSERT INTO subscription_plans (name, price, weekly_quota, description, features, is_active) VALUES
  (
    'Gratis',
    0,
    1,
    'Paket gratis untuk coba-coba',
    '{"basic_template": true, "guests": 50}'::jsonb,
    true
  ),
  (
    'Basic',
    99000,
    5,
    'Untuk acara kecil dan personal',
    '{"music": true, "countdown": true, "guests": 200, "templates": ["basic", "modern"]}'::jsonb,
    true
  ),
  (
    'Premium',
    199000,
    20,
    'Untuk acara besar dan mewah',
    '{"music": true, "countdown": true, "qr_code": true, "maps": true, "custom_domain": true, "guests": 1000, "templates": "all"}'::jsonb,
    true
  ),
  (
    'Pro',
    499000,
    100,
    'Unlimited untuk event organizer',
    '{"all_features": true, "priority_support": true, "guests": 5000, "templates": "all+premium"}'::jsonb,
    true
  );

-- 3. Verifikasi
SELECT name, price, weekly_quota, description, is_active FROM subscription_plans ORDER BY price;