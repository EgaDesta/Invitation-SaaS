import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Music, Pause, Play, MapPin, Calendar, Clock, Heart, Send, MessageCircle, Sparkles, Gift, Star } from "lucide-react";
import SEO from "@/components/SEO";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const shimmer = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
  }
};

export default function InvitationView() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const guestName = decodeURIComponent(searchParams.get("to") || "Tamu Undangan");

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opened, setOpened] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-based animations
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-rose-500" />
          <Heart className="w-6 h-6 text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="currentColor" />
        </motion.div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md"
        >
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Undangan Tidak Ditemukan</h2>
          <p className="text-gray-600">Maaf, undangan yang Anda cari tidak ada atau sudah tidak tersedia.</p>
        </motion.div>
      </div>
    );
  }

  const eventDate = invitation.event_date ? new Date(invitation.event_date) : null;
  const hasCountdown = eventDate && (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 text-gray-900 overflow-x-hidden">
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
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #fdf2f8 0%, #fef3c7 50%, #fce7f3 100%)"
            }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Animated background elements */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-20 left-10 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-20 right-10 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl"
            />

            {/* Floating hearts */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-20, -100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeOut",
                }}
                className="absolute text-rose-300"
                style={{
                  left: `${15 + i * 15}%`,
                  bottom: "10%",
                }}
              >
                <Heart className="w-6 h-6" fill="currentColor" />
              </motion.div>
            ))}

            <motion.div
              className="text-center relative z-10"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-8 inline-block"
              >
                <div className="relative">
                  <Heart className="w-20 h-20 text-rose-500 mx-auto" fill="currentColor" />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-rose-400 rounded-full blur-xl"
                  />
                </div>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-lg text-gray-600 mb-3 font-light tracking-wide"
              >
                Kepada Yth.
              </motion.p>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="font-display text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent"
              >
                {guestName}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-600 mb-4 text-lg"
              >
                Anda diundang untuk hadir di
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="font-display text-3xl md:text-4xl font-semibold mb-10 text-gray-900"
              >
                {invitation.title}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                <Button 
                  size="lg" 
                  onClick={openInvitation} 
                  className="gap-3 px-8 py-6 text-lg bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full shadow-2xl shadow-rose-500/50 border-0"
                >
                  <Sparkles className="w-5 h-5" />
                  Buka Undangan
                  <Heart className="w-5 h-5" fill="currentColor" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music floating button */}
      {opened && invitation.music_url && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-2xl shadow-rose-500/50 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </motion.div>
        </motion.button>
      )}

      {opened && (
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-20">
          {/* Hero Section with Parallax */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center relative"
          >
            <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="relative">
              {invitation.cover_image_url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1 }}
                  className="w-full h-64 md:h-80 rounded-3xl overflow-hidden mb-10 shadow-2xl"
                >
                  <img 
                    src={invitation.cover_image_url} 
                    alt={invitation.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>
              )}
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-block"
              >
                <span className="text-sm uppercase tracking-[0.3em] text-rose-600 font-medium bg-rose-100 px-4 py-2 rounded-full">
                  {invitation.event_type === "wedding" ? "The Wedding of" : invitation.event_type === "birthday" ? "Happy Birthday" : "You're Invited"}
                </span>
              </motion.div>

              <motion.h1 
                variants={fadeInUp}
                className="font-display text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent"
              >
                {invitation.host_names || invitation.event_name || invitation.title}
              </motion.h1>

              {invitation.event_description && (
                <motion.p 
                  variants={fadeInUp}
                  className="text-gray-600 leading-relaxed text-lg max-w-xl mx-auto"
                >
                  {invitation.event_description}
                </motion.p>
              )}
            </motion.div>
          </motion.section>

          {/* Countdown - Elegant Cards */}
          {hasCountdown && (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInScale}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 rounded-3xl blur-2xl opacity-50" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-6"
                >
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    Hitung Mundur
                  </div>
                </motion.div>

                <div className="grid grid-cols-4 gap-3">
                  {[
                    { val: countdown.days, label: "Hari", color: "from-rose-500 to-rose-600" },
                    { val: countdown.hours, label: "Jam", color: "from-pink-500 to-pink-600" },
                    { val: countdown.minutes, label: "Menit", color: "from-fuchsia-500 to-fuchsia-600" },
                    { val: countdown.seconds, label: "Detik", color: "from-amber-500 to-amber-600" },
                  ].map((c, i) => (
                    <motion.div
                      key={c.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative group"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${c.color} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                      <div className="relative bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                        <motion.p
                          key={c.val}
                          initial={{ scale: 1.2, opacity: 0.7 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className={`text-3xl md:text-4xl font-bold bg-gradient-to-br ${c.color} bg-clip-text text-transparent`}
                        >
                          {String(c.val).padStart(2, "0")}
                        </motion.p>
                        <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{c.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* Gallery */}
          {invitation.gallery_urls && (invitation.gallery_urls as string[]).length > 0 && (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h3 
                variants={fadeInUp}
                className="font-display text-3xl text-center mb-8 bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent"
              >
                Galeri Momen
              </motion.h3>
              <div className="grid grid-cols-2 gap-4">
                {(invitation.gallery_urls as string[]).map((url: string, i: number) => (
                  <motion.div
                    key={i}
                    variants={fadeInScale}
                    whileHover={{ scale: 1.05 }}
                    className="rounded-2xl overflow-hidden shadow-lg aspect-square"
                  >
                    <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Event Details - Premium Cards */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <motion.h3 
              variants={fadeInUp}
              className="font-display text-3xl text-center mb-8 bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent"
            >
              Detail Acara
            </motion.h3>

            {eventDate && (
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {eventDate.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    {invitation.event_time && (
                      <p className="text-gray-600 text-sm mt-1">{invitation.event_time}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {invitation.event_location && (
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-bold text-lg text-gray-900">{invitation.event_location}</p>
                </div>
              </motion.div>
            )}
          </motion.section>

          {/* Google Maps */}
          {invitation.map_embed_url && (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInScale}
            >
              <h3 className="font-display text-3xl text-center mb-6 bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                Lokasi Acara
              </h3>
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <iframe
                  src={invitation.map_embed_url}
                  width="100%"
                  height="400"
                  className="border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Acara"
                />
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-4 text-center"
              >
                <a
                  href={invitation.map_embed_url.replace("/embed?", "/search?").replace("pb=", "query=")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
                >
                  <MapPin className="w-4 h-4" /> Buka di Google Maps
                </a>
              </motion.div>
            </motion.section>
          )}

          {/* RSVP - Elegant Form */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-100 to-amber-100 rounded-3xl blur-2xl opacity-50" />
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-full text-sm font-medium mb-4">
                  <Gift className="w-5 h-5" />
                  Konfirmasi Kehadiran
                </div>
                <h3 className="font-display text-3xl bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                  RSVP
                </h3>
              </motion.div>

              {rsvpSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center p-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Heart className="w-10 h-10 text-white" fill="currentColor" />
                  </motion.div>
                  <p className="text-xl font-bold text-gray-900 mb-2">Terima kasih!</p>
                  <p className="text-gray-600">Konfirmasimu sudah kami terima</p>
                </motion.div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <motion.div variants={fadeInUp}>
                    <Input 
                      placeholder="Nama Anda" 
                      value={rsvpName} 
                      onChange={(e) => setRsvpName(e.target.value)} 
                      maxLength={200}
                      className="rounded-xl border-2 border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <Select value={rsvpStatus} onValueChange={(v) => setRsvpStatus(v as any)}>
                      <SelectTrigger className="rounded-xl border-2 border-gray-200 focus:border-rose-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attending">✓ Hadir</SelectItem>
                        <SelectItem value="not_attending">✗ Tidak Hadir</SelectItem>
                        <SelectItem value="maybe">? Mungkin</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                  {rsvpStatus === "attending" && (
                    <motion.div variants={fadeInUp}>
                      <Input 
                        type="number" 
                        placeholder="Jumlah tamu" 
                        min={1} 
                        max={10} 
                        value={rsvpCount} 
                        onChange={(e) => setRsvpCount(Number(e.target.value))}
                        className="rounded-xl border-2 border-gray-200 focus:border-rose-500"
                      />
                    </motion.div>
                  )}
                  <motion.div variants={fadeInUp}>
                    <Textarea 
                      placeholder="Ucapan & doa (opsional)" 
                      value={rsvpMessage} 
                      onChange={(e) => setRsvpMessage(e.target.value)} 
                      maxLength={500}
                      className="rounded-xl border-2 border-gray-200 focus:border-rose-500 min-h-[120px]"
                    />
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <Button 
                      className="w-full gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl py-6 text-lg shadow-xl shadow-rose-500/30 border-0"
                      onClick={handleRsvp}
                    >
                      <Send className="w-5 h-5" /> Kirim Konfirmasi
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* Wishes - Beautiful Cards */}
          {wishes.length > 0 && (
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h3 
                variants={fadeInUp}
                className="font-display text-3xl text-center mb-8 bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent flex items-center justify-center gap-3"
              >
                <MessageCircle className="w-8 h-8" />
                Ucapan & Doa
              </motion.h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {wishes.map((w, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl blur-lg opacity-10 group-hover:opacity-30 transition-opacity" />
                    <div className="relative bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {w.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{w.name}</p>
                          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{w.rsvp_message}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Share */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center space-y-4"
          >
            <Button 
              variant="outline" 
              onClick={shareWhatsApp} 
              className="gap-2 px-8 py-6 text-lg rounded-full border-2 border-rose-500 text-rose-600 hover:bg-rose-50"
            >
              <Send className="w-5 h-5" /> Bagikan via WhatsApp
            </Button>
          </motion.section>

          <motion.footer
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200"
          >
            <p className="flex items-center justify-center gap-2">
              Dibuat dengan <Heart className="w-4 h-4 text-rose-500" fill="currentColor" /> menggunakan
              <span className="font-display font-bold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                Undanganku
              </span>
            </p>
          </motion.footer>
        </div>
      )}
    </div>
  );
}
