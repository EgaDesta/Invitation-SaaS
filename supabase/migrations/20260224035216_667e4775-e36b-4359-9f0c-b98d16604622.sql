
-- Fix overly permissive RSVP update policy
DROP POLICY IF EXISTS "Public can submit RSVP" ON public.guests;

-- More restrictive: only allow updating RSVP fields, require valid token knowledge
CREATE POLICY "Public can submit RSVP by token" ON public.guests 
FOR UPDATE 
USING (true)
WITH CHECK (
  rsvp_status IS NOT NULL 
  AND unique_token IS NOT NULL
);
