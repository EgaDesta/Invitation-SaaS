import { supabase } from "@/integrations/supabase/client";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL || ""}/functions/v1/send-invite-email`;

export async function notifyEmail(payload: {
  invitationId: string;
  guestId?: string;
  type: "guest_added" | "rsvp_updated" | "invitation_created";
}) {
  try {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return;

    await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent fail — email notifications are non-critical
  }
}
