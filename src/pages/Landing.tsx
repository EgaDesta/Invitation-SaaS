import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Users, Music, QrCode, MapPin, ArrowRight, Check, Star, ChevronRight, Zap, Calendar, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { parseFeatures } from "@/lib/utils";

/* ── Unified rose palette ── */
const TONE = {
  bg: "bg-[hsl(var(--tone-rose))]",
  bgSoft: "bg-[hsl(var(--tone-rose-soft))]",
  text: "text-[hsl(var(--tone-rose))]",
  border: "border-[hsl(var(--tone-rose))]",
  ring: "ring-[hsl(var(--tone-rose))]",
};

const features = [
  { icon: Heart, title: "Template Elegan", desc: "Template premium untuk pernikahan, ulang tahun, & acara besar" },
  { icon: Users, title: "Link Personal", desc: "Setiap tamu mendapat undangan dengan nama unik mereka" },
  { icon: Music, title: "Musik Latar", desc: "Upload musik sendiri atau pilih dari koleksi" },
  { icon: QrCode, title: "QR Code", desc: "Generate & bagikan undangan via QR code" },
  { icon: MapPin, title: "Google Maps", desc: "Embed lokasi acara langsung di undangan" },
  { icon: Calendar, title: "RSVP & Countdown", desc: "Form RSVP dan hitung mundur otomatis" },
];

const testimonials = [
  { name: "Rina & Adi", role: "Pernikahan, Bali", text: "Undangannya cantik banget! Tamu-tamu pada kagum. Prosesnya juga gampang.", avatar: "RA" },
  { name: "Dewi Kusuma", role: "Ulang Tahun Anak", text: "Fitur RSVP-nya sangat membantu. Bisa track siapa saja yang datang.", avatar: "DK" },
  { name: "Budi & Sari", role: "Pernikahan, Jakarta", text: "Hemat biaya cetak, tapi hasilnya jauh lebih elegan dari undangan fisik.", avatar: "BS" },
];

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
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <Link to="/" className="font-display text-xl font-bold">
            <span className={TONE.text}>Undangan</span>
            <span className={TONE.text}>ku</span>
          </Link>
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
              <Button size="sm" className="text-xs md:text-sm px-4 rounded-full bg-[hsl(var(--tone-rose))] text-white hover:opacity-90">
                Daftar
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 px-4 md:px-6 min-h-[90dvh] flex items-center">
        <div className="container mx-auto max-w-6xl w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-display font-bold leading-[1.05] tracking-tight">
                  Buat Undangan Digital yang
                  <br />
                  <span className="bg-[hsl(var(--tone-rose))] text-white px-3 py-1 inline-block mt-2">Memukau</span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Undangan pernikahan, ulang tahun, dan acara spesial dengan template premium, 
                  link personal untuk setiap tamu, dan fitur RSVP lengkap.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="gap-2 text-base px-8 h-12 rounded-full bg-[hsl(var(--tone-rose))] text-white hover:opacity-90 shadow-lg shadow-[hsl(var(--tone-rose))/30]">
                    Mulai Gratis <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="outline" size="lg" className="text-base px-7 h-12 rounded-full border-2">
                    Lihat Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[hsl(var(--tone-rose))]" /> No card required</span>
                <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[hsl(var(--tone-rose))]" /> Gratis selamanya</span>
              </div>
            </motion.div>

            {/* Right: Decorative card */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden md:flex justify-center"
            >
              <div className="relative w-80 h-[26rem] rounded-[2rem] bg-card border shadow-2xl p-8 flex flex-col justify-between" style={{ boxShadow: "0 40px 80px -20px rgba(0,0,0,0.15)" }}>
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--tone-rose-soft))] flex items-center justify-center">
                      <Heart className="w-5 h-5 text-[hsl(var(--tone-rose))]" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wedding Invitation</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-1">Rina & Adi</h3>
                  <p className="text-sm text-muted-foreground">Sabtu, 15 Maret 2026</p>
                  <p className="text-sm text-muted-foreground">Bali, Indonesia</p>
                </div>
                <div className="space-y-4">
                  <div className="h-28 rounded-2xl bg-[hsl(var(--tone-rose-soft))]/50 border border-border/30 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--tone-rose))]/20 to-[hsl(var(--tone-rose-soft))] flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-[hsl(var(--tone-rose))] opacity-40" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono tracking-wider">01 : 23 : 45 : 12</span>
                    <span className="flex items-center gap-1"><Music className="w-3 h-3" /> Playing</span>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-3 top-12 bg-card border rounded-xl px-3 py-2.5 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">RSVP Masuk!</p>
                    <p className="text-[10px] text-muted-foreground">Budi + 2 orang</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute -left-4 bottom-20 bg-card border rounded-xl px-3 py-2.5 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[hsl(var(--tone-rose))]" />
                  <span className="text-sm font-bold">127</span>
                  <span className="text-[10px] text-muted-foreground">tamu</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="hidden md:flex justify-center mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center pt-2"
            >
              <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-10 border-y border-border/30">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="flex -space-x-2">
              {["RA", "DK", "BS", "MF"].map((initials, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-[hsl(var(--tone-rose))] flex items-center justify-center text-[10px] font-bold text-white border-2 border-background">
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">2,000+</span> undangan dibuat oleh pasangan di seluruh Indonesia
            </p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-[hsl(var(--tone-rose))] text-[hsl(var(--tone-rose))]" />
              ))}
              <span className="text-sm text-muted-foreground ml-1">4.9/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="py-3 bg-[hsl(var(--tone-rose))] text-white overflow-hidden">
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
      <section id="fitur" className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-14 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
              Semua yang kamu butuhkan
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mt-3 max-w-lg mx-auto">
              Tidak perlu tools terpisah. Semua fitur terintegrasi dalam satu platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="h-full border-border/30 hover:border-[hsl(var(--tone-rose))]/30 group transition-all duration-300">
                  <CardContent className="p-6 md:p-7 flex flex-col gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[hsl(var(--tone-rose-soft))] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[hsl(var(--tone-rose))]/20">
                      <f.icon className="w-5 h-5 text-[hsl(var(--tone-rose))]" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold mb-1.5">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 md:py-28 px-4 md:px-6 bg-[hsl(var(--tone-rose-soft))]/40">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold">3 Langkah Mudah</h2>
            <p className="text-muted-foreground text-base md:text-lg mt-3">Buat undangan digital impianmu dalam hitungan menit</p>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute left-1/2 top-12 bottom-12 w-px bg-border -translate-x-1/2" />
            {[
              { step: "01", title: "Pilih Template", desc: "Pilih dari koleksi template premium kami untuk berbagai jenis acara.", icon: Sparkles },
              { step: "02", title: "Personalisasi", desc: "Tambahkan detail acara, foto, musik, dan peta lokasi.", icon: Zap },
              { step: "03", title: "Bagikan", desc: "Kirim link personal ke setiap tamu atau via QR code.", icon: Gift },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex items-center gap-8 md:gap-12 mb-12 md:mb-16 last:mb-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="flex-1 text-center md:text-left">
                  <span className="text-[hsl(var(--tone-rose))] font-mono text-sm font-bold tracking-wider">Langkah {s.step}</span>
                  <h3 className="font-display text-xl md:text-2xl font-bold mt-1 mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm md:text-base max-w-sm">{s.desc}</p>
                </div>
                <div className="shrink-0 relative z-10">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[hsl(var(--tone-rose))] flex items-center justify-center shadow-lg shadow-[hsl(var(--tone-rose))/20]">
                    <s.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                </div>
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="harga" className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold">Pilih paket yang tepat</h2>
            <p className="text-muted-foreground text-base md:text-lg mt-3">Mulai gratis, upgrade kapan saja.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {plans.map((plan, i) => {
              const isPopular = i === 1;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Card className={`relative h-full overflow-hidden transition-all duration-300 ${
                    isPopular ? "ring-2 ring-[hsl(var(--tone-rose))] shadow-lg" : "border-border/30 hover:border-[hsl(var(--tone-rose))]/30"
                  }`}>
                    {isPopular && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[hsl(var(--tone-rose))]" />
                    )}
                    <CardContent className="p-5 md:p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                        {isPopular && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-[hsl(var(--tone-rose))] text-white px-2.5 py-0.5 rounded-full">
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
                        {parseFeatures(plan.features).map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <div className="w-4 h-4 rounded-full bg-[hsl(var(--tone-rose-soft))] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 text-[hsl(var(--tone-rose))]" />
                            </div>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Link to="/auth?tab=signup">
                        <Button
                          className={`w-full rounded-full ${isPopular ? "bg-[hsl(var(--tone-rose))] text-white hover:opacity-90 shadow-md" : ""}`}
                          variant={isPopular ? "default" : "outline"}
                          size="sm"
                        >
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
      <section id="testimoni" className="py-20 md:py-28 px-4 md:px-6 bg-[hsl(var(--tone-rose-soft))]/40">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold">Apa kata mereka?</h2>
            <p className="text-muted-foreground text-base md:text-lg mt-3">Ribuan pasangan sudah membuat undangan digital bersama kami</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card className="h-full border-border/20 hover:border-[hsl(var(--tone-rose))]/20 transition-all duration-300">
                  <CardContent className="p-6 flex flex-col">
                    <div className="flex gap-0.5 mb-4">
                      {Array(5).fill(null).map((_, s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-[hsl(var(--tone-rose))] text-[hsl(var(--tone-rose))]" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed flex-1 mb-5 text-muted-foreground">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[hsl(var(--tone-rose))] flex items-center justify-center text-[10px] font-bold text-white">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
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
      <section className="py-20 md:py-28 px-4 md:px-6">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            className="rounded-[2rem] bg-[hsl(var(--tone-rose))] p-10 md:p-14 text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4 leading-tight">
              Siap buat undangan impianmu?
            </h2>
            <p className="text-white/80 text-base md:text-lg mb-8 max-w-md mx-auto">
              Bergabung dengan ribuan pasangan yang sudah membuat undangan digital memukau.
            </p>
            <Link to="/auth?tab=signup">
              <Button size="lg" variant="secondary" className="rounded-full px-10 h-12 text-sm font-semibold shadow-xl">
                Mulai Sekarang — Gratis <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-4 md:px-6 border-t border-border/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="font-display text-xl font-bold inline-block mb-3">
                <span className="text-[hsl(var(--tone-rose))]">Undangan</span>ku
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[220px]">
                Platform undangan digital terdepan di Indonesia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Produk</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#fitur" className="hover:text-foreground transition-colors">Fitur</a></li>
                <li><a href="#harga" className="hover:text-foreground transition-colors">Harga</a></li>
                <li><Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Akun</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Masuk</Link></li>
                <li><Link to="/auth?tab=signup" className="hover:text-foreground transition-colors">Daftar</Link></li>
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Kontak</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>info@undanganku.id</li>
                <li>WhatsApp</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © 2026 Undanganku. Hak cipta dilindungi.
            </p>
            <p className="text-xs text-muted-foreground">
              Dibuat dengan <Heart className="w-3 h-3 inline text-[hsl(var(--tone-rose))]" /> di Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
