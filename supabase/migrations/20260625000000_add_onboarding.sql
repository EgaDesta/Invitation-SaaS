-- Add is_onboarded column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;

-- Update existing users as onboarded
UPDATE public.profiles SET is_onboarded = true WHERE is_onboarded IS NULL;
