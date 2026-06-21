import { Heart, Calendar, Clock, MapPin, Music, Send, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface PreviewProps {
  form: {
    title: string;
    event_type: string;
    event_name: string;
    host_names: string;
    event_date: string;
    event_time: string;
    event_location: string;
    event_description: string;
    map_embed_url: string;
    template_id: string;
  };
  templateData?: any;
}

export default function InvitationPreview({ form, templateData }: PreviewProps) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!form.event_date) return;
    const target = new Date(form.event_date);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [form.event_date]);

  const colors = templateData?.colors || { primary: "#B76E79", secondary: "#F5E6CC", text: "#2D2D2D", bg: "#FFFAF5" };
  const fonts = templateData?.fonts || { display: "Playfair Display", body: "Inter" };
  const eventDate = form.event_date ? new Date(form.event_date) : null;

  return (
    <div className="w-full h-full overflow-y-auto" style={{ backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.body }}>
      {/* Cover */}
      <div
        className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6"
        style={{ background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}30)` }}
      >
        <Heart className="w-8 h-8 mb-4" style={{ color: colors.primary }} />
        <p className="text-xs uppercase tracking-[3px] mb-2 opacity-60">Kepada Yth.</p>
        <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: fonts.display }}>Tamu Undangan</h2>
        <p className="text-xs opacity-60 mb-4">Anda diundang untuk hadir di</p>
        <h1 className="text-2xl font-bold" style={{ fontFamily: fonts.display, color: colors.primary }}>
          {form.title || "Judul Undangan"}
        </h1>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6">
        {/* Names */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[3px] opacity-60 mb-2">
            {form.event_type === "wedding" ? "The Wedding of" : form.event_type === "birthday" ? "Happy Birthday" : "You're Invited"}
          </p>
          <h2 className="text-xl font-bold" style={{ fontFamily: fonts.display }}>
            {form.host_names || form.event_name || form.title || "Nama"}
          </h2>
          {form.event_description && (
            <p className="text-xs mt-3 leading-relaxed opacity-70">{form.event_description}</p>
          )}
        </div>

        {/* Countdown */}
        {form.event_date && (
          <div className="text-center">
            <p className="text-xs uppercase tracking-[2px] opacity-60 mb-3">Hitung Mundur</p>
            <div className="flex justify-center gap-2">
              {[
                { val: countdown.days, label: "Hari" },
                { val: countdown.hours, label: "Jam" },
                { val: countdown.minutes, label: "Menit" },
                { val: countdown.seconds, label: "Detik" },
              ].map((c) => (
                <div key={c.label} className="rounded-lg p-2 min-w-[50px]" style={{ backgroundColor: `${colors.secondary}40` }}>
                  <p className="text-lg font-bold" style={{ color: colors.primary }}>{c.val}</p>
                  <p className="text-[10px] opacity-60">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[2px] opacity-60 text-center mb-3">Detail Acara</p>
          {eventDate && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: `${colors.secondary}25` }}>
              <Calendar className="w-4 h-4 shrink-0" style={{ color: colors.primary }} />
              <div>
                <p className="text-xs font-medium">
                  {eventDate.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
                {form.event_time && <p className="text-[10px] opacity-60">{form.event_time}</p>}
              </div>
            </div>
          )}
          {form.event_location && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: `${colors.secondary}25` }}>
              <MapPin className="w-4 h-4 shrink-0" style={{ color: colors.primary }} />
              <p className="text-xs font-medium">{form.event_location}</p>
            </div>
          )}
        </div>

        {/* Map placeholder */}
        {form.map_embed_url && (
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: `${colors.secondary}50` }}>
            <div className="w-full h-32 bg-muted flex items-center justify-center">
              <MapPin className="w-6 h-6 opacity-30" />
              <span className="text-xs opacity-40 ml-2">Google Maps</span>
            </div>
          </div>
        )}

        {/* RSVP Preview */}
        <div className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[2px] opacity-60">Konfirmasi Kehadiran</p>
          <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.secondary}20` }}>
            <div className="space-y-2">
              <div className="h-8 rounded border opacity-30" />
              <div className="h-8 rounded border opacity-30" />
              <div className="h-16 rounded border opacity-30" />
              <div className="h-8 rounded-lg flex items-center justify-center text-xs text-white" style={{ backgroundColor: colors.primary }}>
                <Send className="w-3 h-3 mr-1" /> Kirim RSVP
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t opacity-50" style={{ borderColor: `${colors.secondary}50` }}>
          <p className="text-[10px]">Dibuat dengan ❤️ menggunakan Undanganku</p>
        </div>
      </div>
    </div>
  );
}
