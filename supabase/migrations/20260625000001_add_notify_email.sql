-- Add notify_email toggle to invitations
ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT false;
