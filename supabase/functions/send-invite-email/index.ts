import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const payload = await req.json();
    const { invitationId, guestId, type } = payload;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: invitation } = await supabase
      .from("invitations")
      .select("id, title, slug, user_id, notify_email")
      .eq("id", invitationId)
      .single();

    if (!invitation || !invitation.notify_email) {
      return new Response(JSON.stringify({ message: "Skipped" }), { status: 200 });
    }

    // Get owner email from auth.users
    const { data: userData } = await supabase.auth.admin.getUserById(invitation.user_id);
    const ownerEmail = userData?.user?.email;
    if (!ownerEmail) {
      return new Response(JSON.stringify({ error: "Owner email not found" }), { status: 404 });
    }

    const ownerName = userData.user.user_metadata?.full_name || "Pemilik Undangan";

    if (type === "invitation_created") {
      await sendEmail({
        to: [ownerEmail],
        subject: `Undangan "${invitation.title}" Dibuat`,
        html: `<h2>Halo ${ownerName}!</h2><p>Undangan <strong>${invitation.title}</strong> berhasil dibuat.</p><p><a href="${Deno.env.get("PUBLIC_URL") || ""}/invite/${invitation.slug}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px">Lihat Undangan</a></p>`,
      });
    }

    if ((type === "guest_added" || type === "rsvp_updated") && guestId) {
      const { data: guest } = await supabase.from("guests").select("name, rsvp_status").eq("id", guestId).single();
      if (!guest) return new Response(JSON.stringify({ error: "Guest not found" }), { status: 404 });

      const labels: Record<string, string> = { attending: "Akan Hadir", not_attending: "Tidak Hadir", maybe: "Mungkin", pending: "Belum Respon" };

      const subject = type === "guest_added"
        ? `Tamu Baru: ${guest.name}`
        : `${guest.name} ${labels[guest.rsvp_status] || "Update RSVP"}`;

      const body = type === "guest_added"
        ? `<p><strong>${guest.name}</strong> telah ditambahkan sebagai tamu.</p>`
        : `<p><strong>${guest.name}</strong> mengupdate RSVP: <strong style="color:#7c3aed">${labels[guest.rsvp_status] || guest.rsvp_status}</strong></p>`;

      await sendEmail({
        to: [ownerEmail],
        subject,
        html: `<h2>${type === "guest_added" ? "Tamu Baru" : "Update RSVP"}</h2>${body}<p><a href="${Deno.env.get("PUBLIC_URL") || ""}/invite/${invitation.slug}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px">Lihat Undangan</a></p>`,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

async function sendEmail({ to, subject, html }: { to: string[]; subject: string; html: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: Deno.env.get("FROM_EMAIL") || "undangan@undanganku.my.id",
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
