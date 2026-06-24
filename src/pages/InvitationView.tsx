import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pause, Play, MapPin, Calendar, Clock, Heart, Send, MessageCircle, Sparkles, Gift, Star } from "lucide-react";
import SEO from "@/components/SEO";
import { CustomDesignData, isCustomDesign, getEntranceVariants, getAnimationDuration, getRadiusClass, getSpacingClass } from "@/lib/customDesignTypes";
import { sanitizeInput, loadGoogleFonts } from "@/lib/utils";
import { toast } from "sonner";

export default function InvitationView() {
  const { slug, token } = useParams<{ slug: string; token?: string }>();
  const [searchParams] = useSearchParams();
  const guestName = decodeURIComponent(searchParams.get("to") || "Tamu Undangan");

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [opened, setOpened] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvpName, setRsvpName] = useState(guestName);
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "not_attending" | "maybe" | "pending">("attending");
  const [rsvpMessage, setRsvpMessage] = useState("");
  const [rsvpCount, setRsvpCount] = useState(1);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [wishes, setWishes] = useState<any[]>([]);

  // Determine if custom design
  const custom = useMemo(() => {
    if (invitation?.custom_data && isCustomDesign(invitation.custom_data)) {
      return invitation.custom_data as CustomDesignData;
    }
    return null;
  }, [invitation]);

  // Load Google Fonts for custom design
  useEffect(() => {
    if (!custom) return;
    const fonts = [custom.fonts.heading, custom.fonts.body];
    return loadGoogleFonts(fonts);
  }, [custom]);



  // Animation helpers
  const entrance = useMemo(() => custom ? getEntranceVariants(custom.animations.entrance) : getEntranceVariants("fadeIn"), [custom]);
  const animDuration = useMemo(() => custom ? getAnimationDuration(custom.animations.speed) : 0.8, [custom]);
  const radiusClass = useMemo(() => custom ? getRadiusClass(custom.layout.borderRadius) : "rounded-3xl", [custom]);
  const spacingClass = useMemo(() => custom ? getSpacingClass(custom.layout.sectionSpacing) : "space-y-20", [custom]);

  const isCustomMode = !!custom;
  const primaryColor = custom?.colors.primary || "#e11d48";
  const secondaryColor = custom?.colors.secondary || "#f59e0b";
  const accentColor = custom?.colors.accent || "#ec4899";
  const textColor = custom?.colors.text || "#1f2937";
  const textMutedColor = custom?.colors.textMuted || "#6b7280";
  const cardBg = custom?.colors.cardBg || "#ffffff";

  const headingFont = custom ? `"${custom.fonts.heading}", serif` : undefined;
  const bodyFont = custom ? `"${custom.fonts.body}", sans-serif` : undefined;
  const headingWeight = custom ? custom.fonts.headingWeight : undefined;
  const bodySize = custom ? `var(--custom-body-size)` : undefined;

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

  useEffect(() => {
    if (!invitation?.event_date) return;
    const target = new Date(invitation.event_date);
    const update = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
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
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        toast.info("Klik tombol musik untuk memutar lagu (autoplay diblokir browser)");
      });
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); } else {
      audioRef.current.play().catch(() => {
        toast.error("Gagal memutar musik. Coba klik lagi.");
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleRsvp = async () => {
    if (!invitation || !rsvpName.trim()) return;
    
    // === P0-2: RSVP TOKEN VALIDATION (FIX) ===
    // Jika ada token, harus validasi dengan token dulu (owner access)
    if (token) {
      const { data: guest } = await supabase.from("guests")
        .select("*")
        .eq("invitation_id", invitation.id)
        .eq("unique_token", token)
        .maybeSingle();
      
      if (!guest) {
        toast.error("Token tidak valid atau sudah dipakai");
        return;
      }
      
      // Update existing guest dengan token
      await supabase.from("guests").update({
        rsvp_status: rsvpStatus,
        rsvp_message: sanitizeInput(rsvpMessage) || null,
        rsvp_guests_count: rsvpCount,
      }).eq("id", guest.id);
      
      setRsvpSubmitted(true);
      const { data } = await supabase.from("guests")
        .select("name, rsvp_message, rsvp_status, created_at")
        .eq("invitation_id", invitation.id)
        .not("rsvp_message", "is", null)
        .order("created_at", { ascending: false });
      if (data) setWishes(data);
      return;
    }
    
    // Tanpa token: name-based matching (public RSVP)
    const { data: existingGuest } = await supabase.from("guests")
      .select("*").eq("invitation_id", invitation.id).eq("name", rsvpName.trim()).maybeSingle();

    if (existingGuest) {
      await supabase.from("guests").update({
        rsvp_status: rsvpStatus,
        rsvp_message: sanitizeInput(rsvpMessage) || null,
        rsvp_guests_count: rsvpCount,
      }).eq("id", existingGuest.id);
    } else {
      await supabase.from("guests").insert([{
        invitation_id: invitation.id,
        name: sanitizeInput(rsvpName),
        rsvp_status: rsvpStatus,
        rsvp_message: sanitizeInput(rsvpMessage) || null,
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

  // Particles
  const ParticleIcon = custom?.animations.particles === "stars" ? Star :
    custom?.animations.particles === "sparkles" ? Sparkles : Heart;

  const showParticles = custom?.animations.particles !== "none" && custom?.animations.particles !== undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}15, #ffffff, ${secondaryColor}15)` }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200" style={{ borderTopColor: primaryColor }} />
          <Heart className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: primaryColor }} fill="currentColor" />
        </motion.div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${primaryColor}15` }}>
            <Heart className="w-10 h-10" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Undangan Tidak Ditemukan</h2>
          <p className="text-gray-600">Maaf, undangan yang Anda cari tidak ada atau sudah tidak tersedia.</p>
        </motion.div>
      </div>
    );
  }

  const eventDate = invitation.event_date ? new Date(invitation.event_date) : null;
  const hasCountdown = eventDate && (countdown.days > 0 || countdown.hours > 0 || countdown.minutes > 0 || countdown.seconds > 0);

  // Section visibility from custom or default all visible
  const showSection = (key: string) => {
    if (!custom) return true;
    return (custom.sections as any)[key] !== false;
  };

  // Background style
  const bgStyle: React.CSSProperties = {};
  if (custom) {
    const bg = custom.background;
    if (bg.type === "gradient") {
      const dir = bg.gradientDirection === "to-r" ? "to right" : bg.gradientDirection === "to-b" ? "to bottom" : bg.gradientDirection === "to-br" ? "to bottom right" : "to top left";
      bgStyle.background = `linear-gradient(${dir}, ${bg.gradientFrom}, ${bg.gradientVia}, ${bg.gradientTo})`;
    } else if (bg.type === "solid") {
      bgStyle.background = bg.gradientFrom;
    } else if (bg.type === "image" && bg.imageUrl) {
      bgStyle.backgroundImage = `url(${bg.imageUrl})`;
      bgStyle.backgroundSize = "cover";
      bgStyle.backgroundPosition = "center";
      bgStyle.backgroundAttachment = "fixed";
    }
  }

  // Pattern overlay
  const patternOverlay = custom?.background.patternType && custom.background.patternType !== "none" ? (
    <div className="fixed inset-0 pointer-events-none z-0" style={{
      opacity: 0.05,
      backgroundImage: custom.background.patternType === "dots"
        ? "radial-gradient(circle, currentColor 1px, transparent 1px)"
        : custom.background.patternType === "lines"
        ? "repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 20px)"
        : "repeating-linear-gradient(45deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 20px)",
      backgroundSize: custom.background.patternType === "dots" ? "20px 20px" : "auto",
      color: textColor,
    }} />
  ) : null;

  const hoverProps = custom?.animations.hoverEffects ? {
    whileHover: { scale: 1.02, y: -5 },
  } : {};

  return (
    <div ref={containerRef} className="min-h-screen text-gray-900 overflow-x-hidden relative" style={{
      ...(isCustomMode ? bgStyle : { background: "linear-gradient(135deg, #fdf2f8, #ffffff, #fef3c7)" }),
      color: textColor,
      fontFamily: bodyFont,
      fontSize: bodySize,
    }}>
      {patternOverlay}

      <SEO
        title={`${invitation.title} - Undangan Digital | Undanganku`}
        description={invitation.event_description || `Anda diundang ke ${invitation.title}.`}
        canonical={`/invite/${slug}`}
        ogImage={invitation.cover_image_url || "/og-image.png"}
        ogType="article"
      />
      {invitation.music_url && <audio ref={audioRef} src={invitation.music_url} loop />}

      {/* Cover */}
      <AnimatePresence>
        {!opened && showSection("showCover") && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 overflow-hidden"
            style={isCustomMode ? bgStyle : { background: "linear-gradient(135deg, #fdf2f8 0%, #fef3c7 50%, #fce7f3 100%)" }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" as const }}
          >
            {/* Background blobs */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl"
              style={{ background: `${primaryColor}30` }}
            />
            <motion.div
              animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl"
              style={{ background: `${secondaryColor}30` }}
            />

            {/* Floating particles */}
            {showParticles && [...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [-20, -100], opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
                className="absolute"
                style={{ color: primaryColor, left: `${15 + i * 15}%`, bottom: "10%" }}
              >
                <ParticleIcon className="w-6 h-6" fill="currentColor" />
              </motion.div>
            ))}

            <motion.div className="text-center relative z-10" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }}>
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mb-8 inline-block">
                <div className="relative">
                  <Heart className="w-20 h-20 mx-auto" style={{ color: primaryColor }} fill="currentColor" />
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full blur-xl" style={{ background: primaryColor }} />
                </div>
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-lg mb-3 font-light tracking-wide" style={{ color: textMutedColor }}>
                Kepada Yth.
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
                className="font-bold mb-8"
                style={{
                  fontFamily: headingFont,
                  fontSize: isCustomMode ? "clamp(2.5rem, 8vw, 4rem)" : undefined,
                  fontWeight: headingWeight,
                  background: `linear-gradient(to right, ${primaryColor}, ${accentColor}, ${secondaryColor})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {guestName}
              </motion.h1>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mb-4 text-lg" style={{ color: textMutedColor }}>
                Anda diundang untuk hadir di
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, duration: 0.6 }}
                className="font-semibold mb-10"
                style={{ fontFamily: headingFont, fontSize: isCustomMode ? "clamp(1.5rem, 5vw, 2.5rem)" : undefined, color: textColor }}
              >
                {invitation.title}
              </motion.h2>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}>
                <Button
                  size="lg"
                  onClick={openInvitation}
                  className="gap-3 px-8 py-6 text-lg text-white rounded-full shadow-2xl border-0"
                  style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`, boxShadow: `0 25px 50px ${primaryColor}50` }}
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

      {/* Music button */}
      {opened && showSection("showMusicControl") && invitation.music_url && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }}
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`, boxShadow: `0 20px 40px ${primaryColor}50` }}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}>
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </motion.div>
        </motion.button>
      )}

      {opened && (
        <div className={`max-w-${custom?.layout.maxWidth || "2xl"} mx-auto px-4 py-12 ${spacingClass} relative z-10`}>
          {/* Hero */}
          <motion.section
            initial="hidden" animate="visible" variants={entrance}
            transition={{ duration: animDuration, ease: [0.22, 1, 0.36, 1] }}
            className="text-center relative"
          >
            <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="relative">
              {invitation.cover_image_url && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className={`w-full h-64 md:h-80 ${radiusClass} overflow-hidden mb-10 shadow-2xl`}>
                  <img src={invitation.cover_image_url} alt={invitation.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>
              )}
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: custom?.animations.staggerDelay || 0.15, delayChildren: 0.2 } } }} initial="hidden" animate="visible" className="space-y-4">
              <motion.div variants={entrance} className="inline-block">
                <span className="text-sm uppercase tracking-[0.3em] font-medium px-4 py-2 rounded-full" style={{ color: primaryColor, background: `${primaryColor}15` }}>
                  {invitation.event_type === "wedding" ? "The Wedding of" : invitation.event_type === "birthday" ? "Happy Birthday" : "You're Invited"}
                </span>
              </motion.div>

              <motion.h1
                variants={entrance}
                className="font-bold leading-tight"
                style={{
                  fontFamily: headingFont,
                  fontSize: isCustomMode ? "clamp(2.5rem, 8vw, 4.5rem)" : undefined,
                  fontWeight: headingWeight,
                  letterSpacing: custom?.fonts.letterSpacing === "wide" ? "0.025em" : custom?.fonts.letterSpacing === "wider" ? "0.05em" : custom?.fonts.letterSpacing === "widest" ? "0.1em" : undefined,
                  background: `linear-gradient(to right, ${primaryColor}, ${accentColor}, ${secondaryColor})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {invitation.host_names || invitation.event_name || invitation.title}
              </motion.h1>

              {invitation.event_description && (
                <motion.p variants={entrance} className="leading-relaxed max-w-xl mx-auto" style={{ color: textMutedColor }}>
                  {invitation.event_description}
                </motion.p>
              )}
            </motion.div>
          </motion.section>

          {/* Couple Story */}
          {isCustomMode && showSection("showCoupleStory") && custom?.sections.coupleStory && (
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={entrance} transition={{ duration: animDuration }} className="relative">
              <div className={`absolute inset-0 ${radiusClass} blur-2xl opacity-30`} style={{ background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})` }} />
              <div className={`relative ${radiusClass} p-8 shadow-xl border backdrop-blur-xl`} style={{ background: `${cardBg}ee`, borderColor: `${primaryColor}20` }}>
                <h3 className="font-display text-3xl text-center mb-6" style={{ fontFamily: headingFont, color: primaryColor }}>Cerita Kami</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(custom?.sections.brideName || custom?.sections.groomName) && (
                    <>
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                          {custom?.sections.brideName?.charAt(0) || "♀"}
                        </div>
                        <h4 className="font-bold text-xl" style={{ fontFamily: headingFont }}>{custom?.sections.brideName}</h4>
                        {custom?.sections.brideParents && <p className="text-sm mt-1" style={{ color: textMutedColor }}>{custom.sections.brideParents}</p>}
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})` }}>
                          {custom?.sections.groomName?.charAt(0) || "♂"}
                        </div>
                        <h4 className="font-bold text-xl" style={{ fontFamily: headingFont }}>{custom?.sections.groomName}</h4>
                        {custom?.sections.groomParents && <p className="text-sm mt-1" style={{ color: textMutedColor }}>{custom.sections.groomParents}</p>}
                      </div>
                    </>
                  )}
                </div>
                {custom?.sections.coupleStory && (
                  <p className="text-center mt-6 leading-relaxed italic" style={{ color: textMutedColor }}>"{custom.sections.coupleStory}"</p>
                )}
              </div>
            </motion.section>
          )}

          {/* Countdown */}
          {hasCountdown && showSection("showCountdown") && (
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={entrance} transition={{ duration: animDuration }} className="relative">
              <div className={`absolute inset-0 ${radiusClass} blur-2xl opacity-30`} style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor}, ${secondaryColor})` }} />
              <div className={`relative backdrop-blur-xl ${radiusClass} p-8 shadow-xl border`} style={{ background: `${cardBg}cc`, borderColor: `${primaryColor}15` }}>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 text-white px-4 py-2 rounded-full text-sm font-medium" style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}>
                    <Clock className="w-4 h-4" /> Hitung Mundur
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { val: countdown.days, label: "Hari" },
                    { val: countdown.hours, label: "Jam" },
                    { val: countdown.minutes, label: "Menit" },
                    { val: countdown.seconds, label: "Detik" },
                  ].map((c, i) => (
                    <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative group">
                      <div className={`absolute inset-0 ${radiusClass} blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} style={{ background: primaryColor }} />
                      <div className={`relative ${radiusClass} p-4 shadow-lg border`} style={{ background: cardBg, borderColor: `${primaryColor}10` }}>
                        <motion.p key={c.val} initial={{ scale: 1.2, opacity: 0.7 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="text-3xl md:text-4xl font-bold" style={{ color: primaryColor, fontFamily: headingFont }}>
                          {String(c.val).padStart(2, "0")}
                        </motion.p>
                        <p className="text-xs mt-1 font-medium uppercase tracking-wide" style={{ color: textMutedColor }}>{c.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* Gallery */}
          {invitation.gallery_urls && (invitation.gallery_urls as string[]).length > 0 && showSection("showGallery") && (
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
              <motion.h3 variants={entrance} className="text-3xl text-center mb-8" style={{ fontFamily: headingFont, background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Galeri Momen
              </motion.h3>
              <div className="grid grid-cols-2 gap-4">
                {(invitation.gallery_urls as string[]).map((url: string, i: number) => (
                  <motion.div key={i} variants={entrance} {...hoverProps} className={`${radiusClass} overflow-hidden shadow-lg aspect-square`}>
                    <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Event Details */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }} className="space-y-6">
            <motion.h3 variants={entrance} className="text-3xl text-center mb-8" style={{ fontFamily: headingFont, background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Detail Acara
            </motion.h3>

            {eventDate && (
              <motion.div variants={entrance} {...hoverProps} className="relative group">
                <div className={`absolute inset-0 ${radiusClass} blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }} />
                <div className={`relative ${radiusClass} p-6 shadow-xl border flex items-center gap-4`} style={{ background: cardBg, borderColor: `${primaryColor}10` }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg" style={{ color: textColor }}>
                      {eventDate.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    {invitation.event_time && <p className="text-sm mt-1" style={{ color: textMutedColor }}>{invitation.event_time}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {invitation.event_location && (
              <motion.div variants={entrance} {...hoverProps} className="relative group">
                <div className={`absolute inset-0 ${radiusClass} blur-xl opacity-20 group-hover:opacity-40 transition-opacity`} style={{ background: `linear-gradient(to right, ${secondaryColor}, ${primaryColor})` }} />
                <div className={`relative ${radiusClass} p-6 shadow-xl border flex items-center gap-4`} style={{ background: cardBg, borderColor: `${primaryColor}10` }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${secondaryColor}, ${primaryColor})` }}>
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-bold text-lg" style={{ color: textColor }}>{invitation.event_location}</p>
                </div>
              </motion.div>
            )}
          </motion.section>

          {/* Google Maps */}
          {invitation.map_embed_url && showSection("showMaps") && (
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={entrance} transition={{ duration: animDuration }}>
              <h3 className="text-3xl text-center mb-6" style={{ fontFamily: headingFont, background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Lokasi Acara
              </h3>
              <div className={`${radiusClass} overflow-hidden shadow-2xl border-4`} style={{ borderColor: cardBg }}>
                <iframe src={invitation.map_embed_url} width="100%" height="400" className="border-0" allowFullScreen loading="lazy" title="Lokasi Acara" />
              </div>
              <div className="mt-4 text-center">
                <a href={invitation.map_embed_url.replace("/embed?", "/search?").replace("pb=", "query=")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium" style={{ color: primaryColor }}>
                  <MapPin className="w-4 h-4" /> Buka di Google Maps
                </a>
              </div>
            </motion.section>
          )}

          {/* RSVP */}
          {showSection("showRsvp") && (
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={entrance} transition={{ duration: animDuration }} className="relative">
              <div className={`absolute inset-0 ${radiusClass} blur-2xl opacity-30`} style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor}, ${secondaryColor})` }} />
              <div className={`relative backdrop-blur-xl ${radiusClass} p-8 shadow-2xl border`} style={{ background: `${cardBg}ee`, borderColor: `${primaryColor}15` }}>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-medium mb-4" style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }}>
                    <Gift className="w-5 h-5" /> Konfirmasi Kehadiran
                  </div>
                  <h3 className="text-3xl" style={{ fontFamily: headingFont, background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    RSVP
                  </h3>
                </div>

                {rsvpSubmitted ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-8">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                      <Heart className="w-10 h-10 text-white" fill="currentColor" />
                    </motion.div>
                    <p className="text-xl font-bold mb-2" style={{ color: textColor }}>Terima kasih!</p>
                    <p style={{ color: textMutedColor }}>Konfirmasimu sudah kami terima</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <Input placeholder="Nama Anda" value={rsvpName} onChange={(e) => setRsvpName(e.target.value)} maxLength={200} className={radiusClass} style={{ borderColor: `${primaryColor}30` }} />
                    <Select value={rsvpStatus} onValueChange={(v) => setRsvpStatus(v as any)}>
                      <SelectTrigger className={radiusClass}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attending">✓ Hadir</SelectItem>
                        <SelectItem value="not_attending">✗ Tidak Hadir</SelectItem>
                        <SelectItem value="maybe">? Mungkin</SelectItem>
                      </SelectContent>
                    </Select>
                    {rsvpStatus === "attending" && (
                      <Input type="number" placeholder="Jumlah tamu" min={1} max={10} value={rsvpCount} onChange={(e) => setRsvpCount(Number(e.target.value))} className={radiusClass} />
                    )}
                    <Textarea placeholder="Ucapan & doa (opsional)" value={rsvpMessage} onChange={(e) => setRsvpMessage(e.target.value)} maxLength={500} className={`${radiusClass} min-h-[120px]`} />
                    <Button className={`w-full gap-2 text-white ${radiusClass} py-6 text-lg shadow-xl border-0`} style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`, boxShadow: `0 20px 40px ${primaryColor}30` }} onClick={handleRsvp}>
                      <Send className="w-5 h-5" /> Kirim Konfirmasi
                    </Button>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* Wishes */}
          {wishes.length > 0 && showSection("showWishes") && (
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
              <motion.h3 variants={entrance} className="text-3xl text-center mb-8 flex items-center justify-center gap-3" style={{ fontFamily: headingFont, background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                <MessageCircle className="w-8 h-8" /> Ucapan & Doa
              </motion.h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {wishes.map((w, i) => (
                  <motion.div key={i} variants={entrance} {...hoverProps} className="relative group">
                    <div className={`absolute inset-0 ${radiusClass} blur-lg opacity-10 group-hover:opacity-30 transition-opacity`} style={{ background: `linear-gradient(to right, ${primaryColor}, ${accentColor})` }} />
                    <div className={`relative ${radiusClass} p-5 shadow-lg border`} style={{ background: cardBg, borderColor: `${primaryColor}10` }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}>
                          {w.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold" style={{ color: textColor }}>{w.name}</p>
                          <p className="text-sm mt-1 leading-relaxed" style={{ color: textMutedColor }}>{w.rsvp_message}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Share */}
          {showSection("showShare") && (
            <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={entrance} className="text-center space-y-4">
              <Button variant="outline" onClick={shareWhatsApp} className={`gap-2 px-8 py-6 text-lg rounded-full border-2`} style={{ borderColor: primaryColor, color: primaryColor }}>
                <Send className="w-5 h-5" /> Bagikan via WhatsApp
              </Button>
            </motion.section>
          )}

          <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-sm pt-8 border-t" style={{ color: textMutedColor, borderColor: `${primaryColor}15` }}>
            <p className="flex items-center justify-center gap-2">
              Dibuat dengan <Heart className="w-4 h-4" style={{ color: primaryColor }} fill="currentColor" /> menggunakan
              <span className="font-bold" style={{ fontFamily: headingFont, background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Undanganku
              </span>
            </p>
          </motion.footer>
        </div>
      )}
    </div>
  );
}
