-- ⚠️ GANTI EMAIL & PASSWORD DI BAWAH INI SEBELUM RUN ⚠️
-- ====================================================

-- Seed subscription plans (sesuai skema tabel)
-- Hapus dulu yang ada agar aman di-run ulang
DELETE FROM subscription_plans;
INSERT INTO subscription_plans (name, price, weekly_quota, description, features, is_active)
VALUES
  ('Gratis', 0, 6, 'Coba undangan digital gratis', '["1 template", "50 tamu", "RSVP"]', true),
  ('Basic', 99000, 15, 'Untuk acara kecil hingga menengah', '["2 template", "200 tamu", "RSVP", "Musik latar"]', true),
  ('Premium', 199000, 50, 'Fitur lengkap untuk acara besar', '["Semua template", "1000 tamu", "RSVP", "Musik", "Google Maps"]', true),
  ('Pro', 499000, 999, 'Solusi profesional tanpa batas', '["Semua template", "5000 tamu", "RSVP", "Musik", "Maps", "Custom domain", "Prioritas"]', true);

-- Buat admin user (ganti email & password sesuai keinginanmu)
DO $$
DECLARE
  _email TEXT := 'admin@undanganku.id';      -- <<< GANTI EMAIL
  _password TEXT := 'CHANGE_ME_ADMIN_123!';  -- <<< GANTI PASSWORD
  _user_id UUID;
BEGIN
  -- Skip jika sudah ada
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = _email) THEN
    RAISE NOTICE 'User % sudah ada, skip', _email;
    RETURN;
  END IF;

  -- Insert ke auth.users
  INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, raw_user_meta_data)
  VALUES (
    _email,
    crypt(_password, gen_salt('bf')),
    now(),
    jsonb_build_object('full_name', 'Admin UndanganKu')
  )
  RETURNING id INTO _user_id;

  -- Profile
  INSERT INTO public.profiles (user_id, full_name, is_onboarded)
  VALUES (_user_id, 'Admin UndanganKu', true)
  ON CONFLICT (user_id) DO NOTHING;

  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RAISE NOTICE 'User admin berhasil dibuat: % / %', _email, _password;
END $$;
