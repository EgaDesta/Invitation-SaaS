import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Pause, Play, MapPin, Calendar, Clock, Heart, Send, MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";

export default function InvitationView() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const guestName = decodeURIComponent(searchParams.get("to") || "Tamu Undangan");

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opened, setOpened] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Real-time countdown
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // RSVP state
  const [rsvpName, setRsvpName] = useState(guestName);
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "not_attending" | "maybe" | "pending">("attending");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [wishes, setWishes] = useState<any[]>([]);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("invitations")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (data) {
        setInvitation(data);
        await supabase.from("invitations").update({ view_count: (data.view_count || 0) + 1 }).eq("id", data.id);
      }
      setLoading(false);
    };
    fetchInvitation();
  }, [slug]);

  // Real-time countdown timer
  useEffect(() => {
    if (!invitation?.event_date) return;
    const target = new Date(invitation.event_date);
    const update = () => {
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
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [invitation?.event_date]);

  useEffect(() => {
    if (!invitation) return;
    supabase.from("guests").select("name, rsvp_message, rsvp_status, created_at")
      .eq("invitation_id", invitation.id)
      .not("rsvp_message", "is", null)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setWishes(data); });
  }, [invitation]);

  const openInvitation = () => {
    setOpened(true);
    if (audioRef.current && invitation?.music_url) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  const handleRsvp = async () => {
    if (!invitation || !rsvpName.trim()) return;
    const { data: existingGuest } = await supabase.from("guests")
      .select("*").eq("invitation_id", invitation.id).eq("name", rsvpName.trim()).maybeSingle();

    if (existingGuest) {
      await supabase.from("guests").update({
        rsvp_status: rsvpStatus,
        rsvp_message: rsvpMessage || null,
        rsvp_guests_count: rsvpCount,
      }).eq("id", existingGuest.id);
    } else {
      await supabase.from("guests").insert([{
        invitation_id: invitation.id,
        name: rsvpName.trim(),
        rsvp_status: rsvpStatus,
        rsvp_message: rsvpMessage || null,
        rsvp_guests_count: rsvpCount,
      }]);
    }
    setRsvpSubmitted(true);
    const { data } = await supabase.from("guests").select("name, rsvp_message, rsvp_status, created_at")
      .eq("invitation_id", invitation.id).not("rsvp_message", "is", null).order("created_at", { ascending: false });
    if (data) setWishes(data);
  };

  const shareWhatsApp = () => {
    const url = window.location.href;
    const text = `Kamu diundang ke ${invitation?.title}! Buka undangan: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!invitation) return <div className="min-h-screen flex items-center justify-center bg-background"><p>Undangan tidak ditemukan</p></div>;

  const eventDate = invitation.event_date ? new Date(invitation.event_date) : null;
  const hasCountdown = eventDate && (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${invitation.title} - Undangan Digital | Undanganku`}
        description={invitation.event_description || `Anda diundang ke ${invitation.title}. Konfirmasi kehadiran Anda sekarang!`}
        canonical={`/invite/${slug}`}
        ogImage={invitation.cover_image_url || "/og-image.png"}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Event",
          "name": invitation.title,
          "description": invitation.event_description || `Undangan untuk ${invitation.title}`,
          "startDate": invitation.event_date || undefined,
          "location": invitation.event_location ? {
            "@type": "Place",
            "name": invitation.event_location
          } : undefined,
          "image": invitation.cover_image_url || undefined,
          "organizer": invitation.host_names ? {
            "@type": "Person",
            "name": invitation.host_names
          } : undefined,
        }}
      />
      {invitation.music_url && <audio ref={audioRef} src={invitation.music_url} loop />}

      {/* Cover / Opening */}
      <AnimatePresence>
        {!opened && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-accent/10 px-6"
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Heart className="w-12 h-12 text-accent mx-auto mb-6 animate-float" />
              <p className="text-lg text-muted-foreground mb-2">Kepada Yth.</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">{guestName}</h1>
              <p className="text-muted-foreground mb-8">Anda diundang untuk hadir di</p>
              <h2 className="font-display text-2xl font-semibold text-primary mb-8">{invitation.title}</h2>
              <Button size="lg" onClick={openInvitation} className="gap-2">
                Buka Undangan <Heart className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music floating button */}
      {opened && invitation.music_url && (
        <button
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center animate-float"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
      )}

      {opened && (
        <div className="max-w-lg mx-auto px-4 py-12 space-y-16">
          {/* Header */}
          <motion.section className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {invitation.cover_image_url && (
              <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8">
                <img src={invitation.cover_image_url} alt={invitation.title} className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-muted-foreground text-sm uppercase tracking-widest mb-4">
              {invitation.event_type === "wedding" ? "The Wedding of" : invitation.event_type === "birthday" ? "Happy Birthday" : "You're Invited"}
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {invitation.host_names || invitation.event_name || invitation.title}
            </h1>
            {invitation.event_description && (
              <p className="text-muted-foreground leading-relaxed mt-4">{invitation.event_description}</p>
            )}
          </motion.section>

          {/* Countdown - real-time */}
          {hasCountdown && (
            <motion.section className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3 className="font-display text-lg mb-4 text-muted-foreground">Hitung Mundur</h3>
              <div className="flex justify-center gap-4">
                {[
                  { val: countdown.days, label: "Hari" },
                  { val: countdown.hours, label: "Jam" },
                  { val: countdown.minutes, label: "Menit" },
                  { val: countdown.seconds, label: "Detik" },
                ].map((c) => (
                  <div key={c.label} className="bg-secondary/50 rounded-xl p-4 min-w-[70px]">
                    <motion.p
                      key={c.val}
                      className="text-2xl md:text-3xl font-bold text-primary"
                      initial={{ scale: 1.2, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {String(c.val).padStart(2, "0")}
                    </motion.p>
                    <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Gallery */}
          {invitation.gallery_urls && (invitation.gallery_urls as string[]).length > 0 && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              <h3 className="font-display text-xl text-center mb-6">Galeri</h3>
              <div className="grid grid-cols-2 gap-3">
                {(invitation.gallery_urls as string[]).map((url: string, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden aspect-square">
                    <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Event Details */}
          <motion.section className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <h3 className="font-display text-xl text-center mb-6">Detail Acara</h3>
            {eventDate && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <Calendar className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">{eventDate.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                  {invitation.event_time && <p className="text-sm text-muted-foreground">{invitation.event_time}</p>}
                </div>
              </div>
            )}
            {invitation.event_location && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <p className="font-medium">{invitation.event_location}</p>
              </div>
            )}
          </motion.section>

          {/* Google Maps */}
          {invitation.map_embed_url && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              <h3 className="font-display text-xl text-center mb-4">Lokasi</h3>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={invitation.map_embed_url}
                  width="100%"
                  height="350"
                  className="border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Acara"
                  style={{ minHeight: "300px" }}
                />
              </div>
              <div className="mt-3 text-center">
                <a
                  href={invitation.map_embed_url.replace("/embed?", "/search?").replace("pb=", "query=")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" /> Buka di Google Maps
                </a>
              </div>
            </motion.section>
          )}

          {/* RSVP */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <h3 className="font-display text-xl text-center mb-6">Konfirmasi Kehadiran</h3>
            {rsvpSubmitted ? (
              <div className="text-center p-6 bg-primary/5 rounded-xl">
                <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-medium">Terima kasih!</p>
                <p className="text-sm text-muted-foreground">Konfirmasimu sudah kami terima</p>
              </div>
            ) : (
              <div className="space-y-4 p-6 rounded-xl bg-secondary/30">
                <Input placeholder="Nama" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} maxLength={200} />
                <Select value={rsvpStatus} onValueChange={(v) => setRsvpStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attending">Hadir</SelectItem>
                    <SelectItem value="not_attending">Tidak Hadir</SelectItem>
                    <SelectItem value="maybe">Mungkin</SelectItem>
                  </SelectContent>
                </Select>
                {rsvpStatus === "attending" && (
                  <Input type="number" placeholder="Jumlah tamu" min={1} max={10} value={rsvpCount} onChange={(e) => setRsvpCount(Number(e.target.value))} />
                )}
                <Textarea placeholder="Ucapan & doa (opsional)" value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} maxLength={500} />
                <Button className="w-full gap-2" onClick={handleRsvp}>
                  <Send className="w-4 h-4" /> Kirim
                </Button>
              </div>
            )}
          </motion.section>

          {/* Wishes */}
          {wishes.length > 0 && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              <h3 className="font-display text-xl text-center mb-6">
                <MessageCircle className="w-5 h-5 inline mr-2" />
                Ucapan & Doa
              </h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {wishes.map((w, i) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary/30">
                    <p className="font-medium text-sm">{w.name}</p>
                    <p className="text-muted-foreground text-sm mt-1">{w.rsvp_message}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Share */}
          <motion.section className="text-center space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            <Button variant="outline" onClick={shareWhatsApp} className="gap-2">
              Bagikan via WhatsApp
            </Button>
          </motion.section>

          <footer className="text-center text-xs text-muted-foreground pt-8 border-t">
            <p>Dibuat dengan ❤️ menggunakan <span className="font-display font-bold text-primary">Undanganku</span></p>
          </footer>
        </div>
      )}
    </div>
  );
}
