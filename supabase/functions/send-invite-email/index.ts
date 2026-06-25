import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "undangan@undanganku.my.id";

interface Payload {
  invitationId: string;
  guestId?: string;
  type: "guest_added" | "rsvp_updated" | "invitation_created";
}

serve(async (req) => {
  try {
    const payload: Payload = await req.json();
    const { invitationId, guestId, type } = payload;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: invitation, error: invErr } = await supabase
      .from("invitations")
      .select("id, title, slug, event_date, event_time, location, notify_email, profiles!inner(email, full_name)")
      .eq("id", invitationId)
      .single();

    if (invErr || !invitation) {
      return new Response(JSON.stringify({ error: "Invitation not found" }), { status: 404 });
    }

    if (!invitation.notify_email) {
      return new Response(JSON.stringify({ message: "Email notifications disabled" }), { status: 200 });
    }

    const ownerEmail = (invitation.profiles as unknown as { email: string }).email;
    const ownerName = (invitation.profiles as unknown as { full_name: string }).full_name || "Pemilik Undangan";

    if (type === "guest_added" && guestId) {
      const { data: guest } = await supabase.from("guests").select("name, phone").eq("id", guestId).single();
      if (!guest) return new Response(JSON.stringify({ error: "Guest not found" }), { status: 404 });

      await sendEmail({
        to: [ownerEmail],
        subject: `Tamu Baru: ${guest.name}`,
        html: `
          <h2>Halo ${ownerName}!</h2>
          <p>Tamu baru telah ditambahkan ke undangan <strong>${invitation.title}</strong>:</p>
          <ul>
            <li><strong>Nama:</strong> ${guest.name}</li>
            ${guest.phone ? `<li><strong>Telepon:</strong> ${guest.phone}</li>` : ""}
          </ul>
          <p>
            <a href="${Deno.env.get("PUBLIC_URL") || "http://localhost:5173"}/invite/${invitation.slug}" 
               style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px">
              Lihat Undangan
            </a>
          </p>
        `,
      });
    }

    if (type === "rsvp_updated" && guestId) {
      const { data: guest } = await supabase.from("guests").select("name, rsvp_status").eq("id", guestId).single();
      if (!guest) return new Response(JSON.stringify({ error: "Guest not found" }), { status: 404 });

      const statusLabels: Record<string, string> = {
        attending: "Akan Hadir",
        not_attending: "Tidak Hadir",
        maybe: "Mungkin",
        pending: "Belum Respon",
      };

      await sendEmail({
        to: [ownerEmail],
        subject: `${guest.name} ${guest.rsvp_status === "attending" ? "Akan Hadir" : "Update RSVP"}`,
        html: `
          <h2>Update RSVP</h2>
          <p><strong>${guest.name}</strong> telah mengupdate RSVP untuk <strong>${invitation.title}</strong>:</p>
          <p style="font-size:18px;font-weight:bold;color:#7c3aed">
            ${statusLabels[guest.rsvp_status] || guest.rsvp_status}
          </p>
          <p>
            <a href="${Deno.env.get("PUBLIC_URL") || "http://localhost:5173"}/invite/${invitation.slug}"
               style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px">
              Lihat Undangan
            </a>
          </p>
        `,
      });
    }

    if (type === "invitation_created") {
      const { data: guests } = await supabase.from("guests").select("name, phone").eq("invitation_id", invitationId);

      await sendEmail({
        to: [ownerEmail],
        subject: `Undangan "${invitation.title}" Telah Dibuat`,
        html: `
          <h2>Selamat ${ownerName}!</h2>
          <p>Undangan digital <strong>${invitation.title}</strong> telah berhasil dibuat.</p>
          <ul>
            <li><strong>Tanggal:</strong> ${invitation.event_date || "-"}</li>
            <li><strong>Waktu:</strong> ${invitation.event_time || "-"}</li>
            <li><strong>Lokasi:</strong> ${invitation.location || "-"}</li>
            ${guests && guests.length > 0 ? `<li><strong>Tamu:</strong> ${guests.length} orang</li>` : ""}
          </ul>
          <p>
            <a href="${Deno.env.get("PUBLIC_URL") || "http://localhost:5173"}/invite/${invitation.slug}"
               style="display:inline-block;padding:12px 24px;background:#7c3aed;color:white;text-decoration:none;border-radius:8px">
              Lihat Undangan
            </a>
          </p>
        `,
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
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    throw new Error(`Failed to send email: ${err}`);
  }
  return res.json();
}
