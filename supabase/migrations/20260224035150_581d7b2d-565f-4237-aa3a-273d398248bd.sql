
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'expired', 'cancelled', 'pending');

-- Create payment status enum
CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed', 'expired', 'refunded');

-- Create RSVP status enum
CREATE TYPE public.rsvp_status AS ENUM ('pending', 'attending', 'not_attending', 'maybe');

-- ===================== TABLES =====================

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  weekly_quota INTEGER NOT NULL DEFAULT 6,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invitation templates table
CREATE TABLE public.invitation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'wedding',
  thumbnail_url TEXT,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invitations table
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.invitation_templates(id),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'wedding',
  event_name TEXT,
  host_names TEXT,
  event_date TIMESTAMPTZ,
  event_time TEXT,
  event_location TEXT,
  event_description TEXT,
  map_embed_url TEXT,
  cover_image_url TEXT,
  gallery_urls JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  music_url TEXT,
  custom_data JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guests table
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rsvp_status rsvp_status NOT NULL DEFAULT 'pending',
  rsvp_message TEXT,
  rsvp_guests_count INTEGER DEFAULT 1,
  unique_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Usage logs table
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  invitation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IDR',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  external_id TEXT,
  gateway_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Media files table
CREATE TABLE public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitation_id UUID REFERENCES public.invitations(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  size_bytes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment logs table
CREATE TABLE public.payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===================== INDEXES =====================

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_invitations_user_id ON public.invitations(user_id);
CREATE INDEX idx_invitations_slug ON public.invitations(slug);
CREATE INDEX idx_guests_invitation_id ON public.guests(invitation_id);
CREATE INDEX idx_guests_unique_token ON public.guests(unique_token);
CREATE INDEX idx_usage_logs_user_week ON public.usage_logs(user_id, week_start);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_media_files_invitation_id ON public.media_files(invitation_id);

-- ===================== HELPER FUNCTIONS =====================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get invitation owner
CREATE OR REPLACE FUNCTION public.get_invitation_owner(_invitation_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.invitations WHERE id = _invitation_id
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON public.invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_usage_logs_updated_at BEFORE UPDATE ON public.usage_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ===================== RLS =====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Subscription plans (public read)
CREATE POLICY "Anyone can view plans" ON public.subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage plans" ON public.subscription_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Invitation templates
CREATE POLICY "Public templates visible to all" ON public.invitation_templates FOR SELECT USING (is_public = true);
CREATE POLICY "Authenticated can view all templates" ON public.invitation_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage templates" ON public.invitation_templates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Invitations
CREATE POLICY "Users can view own invitations" ON public.invitations FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create invitations" ON public.invitations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own invitations" ON public.invitations FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own invitations" ON public.invitations FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage invitations" ON public.invitations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
-- Public access for viewing published invitations by slug
CREATE POLICY "Public can view published invitations" ON public.invitations FOR SELECT USING (is_published = true);

-- Guests
CREATE POLICY "Owners can manage guests" ON public.guests FOR ALL TO authenticated USING (public.get_invitation_owner(invitation_id) = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Guests can view own invitation guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Public can submit RSVP" ON public.guests FOR UPDATE USING (true) WITH CHECK (true);

-- Usage logs
CREATE POLICY "Users can view own usage" ON public.usage_logs FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can manage usage" ON public.usage_logs FOR ALL TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Media files
CREATE POLICY "Users can view own media" ON public.media_files FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can upload media" ON public.media_files FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own media" ON public.media_files FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage transactions" ON public.transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Payment logs
CREATE POLICY "Users can view own payment logs" ON public.payment_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.transactions t WHERE t.id = transaction_id AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Admins can manage payment logs" ON public.payment_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ===================== STORAGE =====================

INSERT INTO storage.buckets (id, name, public) VALUES ('invitations', 'invitations', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('music', 'music', true);

CREATE POLICY "Authenticated users can upload invitation files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('invitations', 'music'));
CREATE POLICY "Anyone can view invitation files" ON storage.objects FOR SELECT USING (bucket_id IN ('invitations', 'music'));
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id IN ('invitations', 'music') AND (storage.foldername(name))[1] = auth.uid()::text);
