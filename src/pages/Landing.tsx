import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Users, Music, QrCode, MapPin, ArrowRight, Check, Star, ChevronRight, Zap, Calendar, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

/* ── 3-tone palette classes ── */
const TONE = {
  brown: {
    bg: "bg-[hsl(var(--tone-brown))]",
    bgSoft: "bg-[hsl(var(--tone-brown-soft))]",
    text: "text-[hsl(var(--tone-brown))]",
    border: "border-[hsl(var(--tone-brown))]",
    ring: "ring-[hsl(var(--tone-brown))]",
  },
  rose: {
    bg: "bg-[hsl(var(--tone-rose))]",
    bgSoft: "bg-[hsl(var(--tone-rose-soft))]",
    text: "text-[hsl(var(--tone-rose))]",
    border: "border-[hsl(var(--tone-rose))]",
    ring: "ring-[hsl(var(--tone-rose))]",
  },
  gold: {
    bg: "bg-[hsl(var(--tone-gold))]",
    bgSoft: "bg-[hsl(var(--tone-gold-soft))]",
    text: "text-[hsl(var(--tone-gold))]",
    border: "border-[hsl(var(--tone-gold))]",
    ring: "ring-[hsl(var(--tone-gold))]",
  },
};

const features = [
  { icon: Heart, title: "Template Elegan", desc: "Template premium untuk pernikahan, ulang tahun, & acara besar", tone: "brown" as const },
  { icon: Users, title: "Link Personal", desc: "Setiap tamu mendapat undangan dengan nama unik mereka", tone: "rose" as const },
  { icon: Music, title: "Musik Latar", desc: "Upload musik sendiri atau pilih dari koleksi", tone: "gold" as const },
  { icon: QrCode, title: "QR Code", desc: "Generate & bagikan undangan via QR code", tone: "rose" as const },
  { icon: MapPin, title: "Google Maps", desc: "Embed lokasi acara langsung di undangan", tone: "gold" as const },
  { icon: Calendar, title: "RSVP & Countdown", desc: "Form RSVP dan hitung mundur otomatis", tone: "brown" as const },
];

const testimonials = [
  { name: "Rina & Adi", role: "Pernikahan, Bali", text: "Undangannya cantik banget! Tamu-tamu pada kagum. Prosesnya juga gampang.", avatar: "RA" },
  { name: "Dewi Kusuma", role: "Ulang Tahun Anak", text: "Fitur RSVP-nya sangat membantu. Bisa track siapa saja yang datang.", avatar: "DK" },
  { name: "Budi & Sari", role: "Pernikahan, Jakarta", text: "Hemat biaya cetak, tapi hasilnya jauh lebih elegan dari undangan fisik.", avatar: "BS" },
];

const stagger = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }
  }),
};

export default function Landing() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("price");
      
      if (error) {
        console.error("Failed to load plans:", error);
        return;
      }
      
      if (data) {
        setPlans(data);
      }
    };
    
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="Undanganku - Platform Undangan Digital #1 Indonesia"
        description="Buat undangan digital pernikahan, ulang tahun & acara spesial dengan template premium, RSVP online, countdown timer, Google Maps & musik latar. Mulai gratis!"
        canonical="/"
      />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto flex items-center justify-between h-14 px-4 md:px-6">
          <Link to="/" className="font-display text-xl font-bold">
            <span className={TONE.brown.text}>Undangan</span>
            <span className={TONE.rose.text}>ku</span>
          </Link>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            <a href="#fitur" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">Fitur</a>
            <a href="#harga" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">Harga</a>
            <a href="#testimoni" className="px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">Testimoni</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-xs md:text-sm">Masuk</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="sm" className={`text-xs md:text-sm px-4 rounded-full ${TONE.brown.bg} hover:opacity-90`}>
                Daftar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-20 pb-12 md:pt-28 md:pb-16 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold leading-[1.05] tracking-tight">
                Buat Undangan
                <br />
                <span className={TONE.brown.text}>Digital</span> yang
                <br />
                <span className={TONE.rose.text}>Memukau</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
                Undangan pernikahan, ulang tahun, dan acara spesial dengan template premium, link personal untuk setiap tamu, dan fitur RSVP lengkap.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link to="/auth?tab=signup">
                  <Button size="lg" className={`gap-2 text-base px-7 h-12 rounded-full ${TONE.brown.bg} hover:opacity-90 shadow-lg glow-btn`}>
                    Mulai Gratis <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="outline" size="lg" className="text-base px-7 h-12 rounded-full border-2">
                    Lihat Demo
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {["RA", "DK", "BS", "MF"].map((initials, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-background ${
                      i === 0 ? TONE.brown.bg : i === 1 ? TONE.rose.bg : i === 2 ? TONE.gold.bg : TONE.brown.bg
                    }`}>
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">2,000+</span> undangan dibuat
                </p>
              </div>
            </motion.div>

            {/* Right: Decorative card */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden md:flex justify-center"
            >
              {/* Card */}
              <div className="relative w-72 lg:w-80 h-[22rem] rounded-3xl bg-card border border-border/50 shadow-2xl shadow-black/8 p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <div className={`w-9 h-9 rounded-xl ${TONE.rose.bgSoft} flex items-center justify-center`}>
                      <Heart className={`w-4 h-4 ${TONE.rose.text}`} />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Wedding</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold leading-tight mb-1">Rina & Adi</h3>
                  <p className="text-sm text-muted-foreground">Sabtu, 15 Maret 2026</p>
                  <p className="text-sm text-muted-foreground">Bali, Indonesia</p>
                </div>
                <div className="space-y-3">
                  <div className={`h-28 rounded-2xl ${TONE.brown.bgSoft} border border-border/30 flex items-center justify-center`}>
                    <MapPin className={`w-7 h-7 ${TONE.brown.text} opacity-40`} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">01 : 23 : 45 : 12</span>
                    <span className="flex items-center gap-1"><Music className="w-3 h-3" /> Playing</span>
                  </div>
                </div>
              </div>

              {/* Floating RSVP badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute -right-2 top-10 bg-card border border-border/40 rounded-xl px-3 py-2 shadow-lg`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">RSVP Masuk!</p>
                    <p className="text-[9px] text-muted-foreground">Budi + 2 orang</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating guest count */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute -left-4 bottom-16 bg-card border border-border/40 rounded-xl px-3 py-2 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${TONE.rose.text}`} />
                  <span className="text-sm font-bold">127</span>
                  <span className="text-[10px] text-muted-foreground">tamu</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className={`py-3 ${TONE.brown.bg} text-white overflow-hidden`}>
        <div className="marquee-track flex items-center gap-6 whitespace-nowrap">
          {Array(3).fill(null).map((_, g) => (
            <div key={g} className="flex items-center gap-6 shrink-0">
              {["Pernikahan", "Ulang Tahun", "Baby Shower", "Khitanan", "Graduation", "Gathering", "Anniversary", "Grand Opening"].map((item) => (
                <span key={item} className="flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                  <Star className="w-2.5 h-2.5" /> {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="fitur" className="py-14 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="mb-10 md:mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            custom={0}
          >
            <span className={`text-[11px] font-mono ${TONE.rose.text} uppercase tracking-[0.2em] mb-2 block`}>— Fitur Unggulan</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
              Semua yang kamu butuhkan
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mt-2 max-w-md">
              Tidak perlu tools terpisah. Semua fitur terintegrasi dalam satu platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {features.map((f, i) => {
              const tone = TONE[f.tone];
              return (
                <motion.div
                  key={f.title}
                  variants={stagger}
                  custom={i + 1}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card className="tilt-card h-full border-border/30 hover:border-[hsl(var(--border))] group">
                    <CardContent className="p-5 md:p-6 flex flex-col gap-3">
                      <div className={`w-11 h-11 rounded-xl ${tone.bgSoft} flex items-center justify-center transition-transform group-hover:scale-110`}>
                        <f.icon className={`w-5 h-5 ${tone.text}`} />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold mb-1">{f.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={`py-14 md:py-18 px-4 md:px-6 ${TONE.gold.bgSoft}`}>
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className={`text-[11px] font-mono ${TONE.gold.text} uppercase tracking-[0.2em] mb-2 block`}>— Cara Kerja</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">3 Langkah Mudah</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              { step: "01", title: "Pilih Template", desc: "Pilih dari koleksi template premium kami untuk berbagai jenis acara.", icon: Sparkles, tone: "brown" as const },
              { step: "02", title: "Personalisasi", desc: "Tambahkan detail acara, foto, musik, dan peta lokasi.", icon: Zap, tone: "rose" as const },
              { step: "03", title: "Bagikan", desc: "Kirim link personal ke setiap tamu atau via QR code.", icon: Gift, tone: "gold" as const },
            ].map((s, i) => {
              const tone = TONE[s.tone];
              return (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="text-center"
                >
                  <div className="relative inline-flex mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${tone.bgSoft} flex items-center justify-center`}>
                      <s.icon className={`w-6 h-6 ${tone.text}`} />
                    </div>
                    <span className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full ${tone.bg} text-white text-[10px] font-bold flex items-center justify-center`}>
                      {s.step}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold mb-1.5">{s.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="harga" className="py-14 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className={`text-[11px] font-mono ${TONE.brown.text} uppercase tracking-[0.2em] mb-2 block`}>— Harga</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Pilih paket yang tepat</h2>
            <p className="text-muted-foreground text-sm mt-2">Mulai gratis, upgrade kapan saja.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {plans.map((plan, i) => {
              const isPopular = i === 1;
              // Assign tone to each plan
              const toneKey = (["brown", "rose", "gold", "brown"] as const)[i] || "brown";
              const tone = TONE[toneKey];

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Card className={`tilt-card relative h-full overflow-hidden ${
                    isPopular ? `ring-2 ${tone.ring} shadow-lg` : "border-border/30"
                  }`}>
                    {isPopular && (
                      <div className={`absolute top-0 left-0 right-0 h-1 ${tone.bg}`} />
                    )}
                    <CardContent className="p-5 md:p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                        {isPopular && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${tone.bg} text-white px-2.5 py-0.5 rounded-full`}>
                            Populer
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-4 min-h-[2rem]">{plan.description}</p>
                      <div className="mb-4">
                        <span className="text-3xl font-bold tracking-tight">
                          {plan.price === 0 ? "Gratis" : `Rp ${plan.price.toLocaleString("id-ID")}`}
                        </span>
                        {plan.price > 0 && <span className="text-muted-foreground text-xs ml-1">/bulan</span>}
                      </div>
                      <ul className="space-y-2.5 mb-5 flex-1">
                        {(() => {
                          const feats = plan.features;
                          if (!feats) return null;
                          const items: string[] = Array.isArray(feats)
                            ? feats
                            : typeof feats === "object"
                              ? Object.entries(feats).map(([k, v]) => {
                                  if (v === true) return k.replace(/_/g, " ");
                                  if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
                                  return `${k}: ${v}`;
                                })
                              : [];
                          return items.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                              <div className={`w-4 h-4 rounded-full ${tone.bgSoft} flex items-center justify-center shrink-0 mt-0.5`}>
                                <Check className={`w-2.5 h-2.5 ${tone.text}`} />
                              </div>
                              <span>{f}</span>
                            </li>
                          ));
                        })()}
                      </ul>
                      <Link to="/auth?tab=signup">
                        <Button className={`w-full rounded-full ${isPopular ? `${tone.bg} hover:opacity-90 glow-btn` : ""}`} variant={isPopular ? "default" : "outline"} size="sm">
                          {plan.price === 0 ? "Mulai Gratis" : "Langganan"} <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimoni" className={`py-14 md:py-18 px-4 md:px-6 ${TONE.rose.bgSoft}`}>
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className={`text-[11px] font-mono ${TONE.rose.text} uppercase tracking-[0.2em] mb-2 block`}>— Testimoni</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold">Apa kata mereka?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.45 }}
              >
                <Card className="tilt-card h-full border-border/20">
                  <CardContent className="p-5 flex flex-col">
                    <div className="flex gap-0.5 mb-3">
                      {Array(5).fill(null).map((_, s) => (
                        <Star key={s} className={`w-3.5 h-3.5 fill-current ${TONE.gold.text}`} />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed flex-1 mb-4">"{t.text}"</p>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-full ${TONE.brown.bg} flex items-center justify-center text-[10px] font-bold text-white`}>
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-[11px] text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            className={`rounded-2xl ${TONE.brown.bg} p-8 md:p-12 text-center text-white`}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-4xl font-display font-bold mb-3">
              Siap buat undangan impianmu?
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-6 max-w-sm mx-auto">
              Bergabung dengan ribuan pengguna yang sudah membuat undangan digital memukau.
            </p>
            <Link to="/auth?tab=signup">
              <Button size="lg" variant="secondary" className="rounded-full px-8 h-11 text-sm font-semibold shadow-xl glow-btn">
                Mulai Sekarang — Gratis <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-4 md:px-6 border-t border-border/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="font-display text-xl font-bold inline-block mb-2">
                <span className={TONE.brown.text}>Undangan</span>
                <span className={TONE.rose.text}>ku</span>
              </Link>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-[200px]">
                Platform undangan digital terdepan di Indonesia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-xs mb-2.5">Produk</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><a href="#fitur" className="hover:text-foreground transition-colors">Fitur</a></li>
                <li><a href="#harga" className="hover:text-foreground transition-colors">Harga</a></li>
                <li><Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xs mb-2.5">Akun</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Masuk</Link></li>
                <li><Link to="/auth?tab=signup" className="hover:text-foreground transition-colors">Daftar</Link></li>
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-xs mb-2.5">Kontak</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li>info@undanganku.id</li>
                <li>WhatsApp</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">
              © 2026 Undanganku. Hak cipta dilindungi.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Dibuat dengan <Heart className={`w-3 h-3 inline ${TONE.rose.text}`} /> di Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
