import { Heart, Calendar, MapPin, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { isCustomDesign, CustomDesignData } from "@/lib/customDesignTypes";
import { loadGoogleFonts } from "@/lib/utils";

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
    cover_image_url: string;
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

  // Load Google Fonts for custom design
  useEffect(() => {
    if (!templateData || !isCustomDesign(templateData)) return;
    const cd = templateData as CustomDesignData;
    return loadGoogleFonts([cd.fonts.heading, cd.fonts.body]);
  }, [templateData]);

  const custom = isCustomDesign(templateData) ? templateData as CustomDesignData : null;

  const colors = custom
    ? { primary: custom.colors.primary, secondary: custom.colors.secondary, text: custom.colors.text, bg: custom.colors.background }
    : templateData?.colors || { primary: "#B76E79", secondary: "#F5E6CC", text: "#2D2D2D", bg: "#FFFAF5" };

  const fonts = custom
    ? { display: `"${custom.fonts.heading}", serif`, body: `"${custom.fonts.body}", sans-serif` }
    : templateData?.fonts || { display: "Playfair Display", body: "Inter" };

  const headingFont = custom ? fonts.display : (templateData?.fonts?.display ? `"${templateData.fonts.display}", serif` : "Playfair Display, serif");

  const eventDate = form.event_date ? new Date(form.event_date) : null;

  // Background style for custom
  const bgStyle: React.CSSProperties = {};
  if (custom) {
    const bg = custom.background;
    if (bg.type === "gradient") {
      const dir = bg.gradientDirection === "to-r" ? "to right" : bg.gradientDirection === "to-b" ? "to bottom" : bg.gradientDirection === "to-br" ? "to bottom right" : "to top left";
      bgStyle.background = `linear-gradient(${dir}, ${bg.gradientFrom}, ${bg.gradientVia}, ${bg.gradientTo})`;
    } else if (bg.type === "solid") {
      bgStyle.background = bg.gradientFrom;
    }
  }

  const radiusClass = custom ? ({ none: "rounded-none", sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", xl: "rounded-xl", full: "rounded-full" }[custom.layout.borderRadius] || "rounded-lg") : "rounded-lg";

  const showSection = (key: string) => custom ? (custom.sections as any)[key] !== false : true;

  return (
    <div className="w-full h-full overflow-y-auto" style={{
      backgroundColor: custom ? undefined : colors.bg,
      color: colors.text,
      fontFamily: custom ? fonts.body : (templateData?.fonts?.body ? `"${templateData.fonts.body}", sans-serif` : "Inter, sans-serif"),
      ...bgStyle,
    }}>
      {/* Cover */}
      <div
        className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}30)` }}
      >
        {form.cover_image_url && (
          <div className="absolute inset-0">
            <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-white/20" />
          </div>
        )}
        <div className="relative z-10">
          <Heart className="w-8 h-8 mb-4 mx-auto" style={{ color: colors.primary }} fill="currentColor" />
          <p className="text-xs uppercase tracking-[3px] mb-2 opacity-60">Kepada Yth.</p>
          <h2 className="text-xl font-semibold mb-4" style={{ fontFamily: headingFont }}>Tamu Undangan</h2>
          <p className="text-xs opacity-60 mb-4">Anda diundang untuk hadir di</p>
          <h1 className="text-2xl font-bold" style={{
            fontFamily: headingFont,
            background: `linear-gradient(to right, ${colors.primary}, ${custom?.colors.accent || colors.secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            {form.title || "Judul Undangan"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-6">
        {/* Names */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[3px] opacity-60 mb-2">
            {form.event_type === "wedding" ? "The Wedding of" : form.event_type === "birthday" ? "Happy Birthday" : "You're Invited"}
          </p>
          <h2 className="text-xl font-bold" style={{ fontFamily: headingFont }}>
            {form.host_names || form.event_name || form.title || "Nama"}
          </h2>
          {form.event_description && (
            <p className="text-xs mt-3 leading-relaxed opacity-70">{form.event_description}</p>
          )}
        </div>

        {/* Couple Story (custom only) */}
        {custom && showSection("showCoupleStory") && custom.sections.coupleStory && (
          <div className={`${radiusClass} p-4 border`} style={{ backgroundColor: `${colors.primary}08`, borderColor: `${colors.primary}20` }}>
            <p className="text-xs text-center font-semibold mb-2" style={{ color: colors.primary, fontFamily: headingFont }}>Cerita Kami</p>
            {(custom.sections.brideName || custom.sections.groomName) && (
              <div className="flex justify-around mb-2">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${custom.colors.accent})` }}>
                    {custom.sections.brideName?.charAt(0) || "♀"}
                  </div>
                  <p className="text-[10px] font-medium mt-1">{custom.sections.brideName}</p>
                </div>
                <div className="flex items-center"><Heart className="w-4 h-4" style={{ color: colors.primary }} fill="currentColor" /></div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold mx-auto" style={{ background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})` }}>
                    {custom.sections.groomName?.charAt(0) || "♂"}
                  </div>
                  <p className="text-[10px] font-medium mt-1">{custom.sections.groomName}</p>
                </div>
              </div>
            )}
            <p className="text-[10px] text-center italic opacity-70">"{custom.sections.coupleStory}"</p>
          </div>
        )}

        {/* Countdown */}
        {form.event_date && showSection("showCountdown") && (
          <div className="text-center">
            <p className="text-xs uppercase tracking-[2px] opacity-60 mb-3">Hitung Mundur</p>
            <div className="flex justify-center gap-2">
              {[
                { val: countdown.days, label: "Hari" },
                { val: countdown.hours, label: "Jam" },
                { val: countdown.minutes, label: "Menit" },
                { val: countdown.seconds, label: "Detik" },
              ].map((c) => (
                <div key={c.label} className={`${radiusClass} p-2 min-w-[50px]`} style={{ backgroundColor: `${colors.primary}15` }}>
                  <p className="text-lg font-bold" style={{ color: colors.primary }}>{String(c.val).padStart(2, "0")}</p>
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
            <div className={`flex items-center gap-2 p-3 ${radiusClass}`} style={{ backgroundColor: `${colors.primary}10` }}>
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
            <div className={`flex items-center gap-2 p-3 ${radiusClass}`} style={{ backgroundColor: `${colors.secondary}20` }}>
              <MapPin className="w-4 h-4 shrink-0" style={{ color: colors.secondary }} />
              <p className="text-xs font-medium">{form.event_location}</p>
            </div>
          )}
        </div>

        {/* Map placeholder */}
        {form.map_embed_url && showSection("showMaps") && (
          <div className={`${radiusClass} overflow-hidden border`} style={{ borderColor: `${colors.secondary}50` }}>
            <div className="w-full h-32 bg-muted flex items-center justify-center">
              <MapPin className="w-6 h-6 opacity-30" />
              <span className="text-xs opacity-40 ml-2">Google Maps</span>
            </div>
          </div>
        )}

        {/* RSVP Preview */}
        {showSection("showRsvp") && (
          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-[2px] opacity-60">Konfirmasi Kehadiran</p>
            <div className={`p-4 ${radiusClass}`} style={{ backgroundColor: `${colors.primary}08` }}>
              <div className="space-y-2">
                <div className="h-8 rounded border opacity-30" />
                <div className="h-8 rounded border opacity-30" />
                <div className="h-16 rounded border opacity-30" />
                <div className={`h-8 ${radiusClass} flex items-center justify-center text-xs text-white`} style={{ backgroundColor: colors.primary }}>
                  <Send className="w-3 h-3 mr-1" /> Kirim RSVP
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t opacity-50" style={{ borderColor: `${colors.secondary}50` }}>
          <p className="text-[10px]">Dibuat dengan ❤️ menggunakan Undanganku</p>
        </div>
      </div>
    </div>
  );
}
