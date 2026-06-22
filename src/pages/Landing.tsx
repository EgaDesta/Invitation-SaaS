import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Users, Music, QrCode, MapPin, ArrowRight, Check, Star, ChevronRight, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const features = [
  { icon: Heart, title: "Template Elegan", desc: "Pilihan template premium untuk pernikahan, ulang tahun, & acara besar", size: "large" },
  { icon: Users, title: "Link Personal", desc: "Setiap tamu mendapat undangan dengan nama mereka", size: "small" },
  { icon: Music, title: "Musik Latar", desc: "Upload musik sendiri atau pilih dari koleksi", size: "small" },
  { icon: QrCode, title: "QR Code", desc: "Generate & bagikan dengan mudah", size: "tall" },
  { icon: MapPin, title: "Google Maps", desc: "Embed lokasi acara langsung di undangan", size: "small" },
  { icon: Sparkles, title: "RSVP & Countdown", desc: "Form RSVP dan hitung mundur otomatis", size: "small" },
];

const testimonials = [
  { name: "Rina & Adi", role: "Pernikahan, Bali", text: "Undangannya cantik banget! Tamu-tamu pada kagum. Prosesnya juga gampang.", avatar: "RA" },
  { name: "Dewi Kusuma", role: "Ulang Tahun Anak", text: "Fitur RSVP-nya sangat membantu. Bisa track siapa saja yang datang.", avatar: "DK" },
  { name: "Budi & Sari", role: "Pernikahan, Jakarta", text: "Hemat biaya cetak, tapi hasilnya jauh lebih elegan dari undangan fisik.", avatar: "BS" },
];

export default function Landing() {
  const [plans, setPlans] = useState<any[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    supabase
      .from("subscription_plans")
      .select("*")
      .order("price")
      .then(({ data }) => { if (data) setPlans(data); })
      .catch((err) => console.error("Failed to load plans:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="Undanganku - Platform Undangan Digital #1 Indonesia"
        description="Buat undangan digital pernikahan, ulang tahun & acara spesial dengan template premium, RSVP online, countdown timer, Google Maps & musik latar. Mulai gratis!"
        canonical="/"
      />

      {/* Floating Pill Nav */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="nav-pill flex items-center gap-1 px-2 py-1.5 rounded-full bg-background/70 backdrop-blur-xl border border-border/40 shadow-lg shadow-black/5">
          <Link to="/" className="px-4 py-2 font-display text-lg font-bold text-primary tracking-tight">
            Undangan<span className="text-accent">ku</span>
          </Link>
          <div className="hidden md:flex items-center gap-0.5 text-sm">
            <a href="#fitur" className="px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">Fitur</a>
            <a href="#harga" className="px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">Harga</a>
            <a href="#testimoni" className="px-3 py-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all">Testimoni</a>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="rounded-full text-xs">Masuk</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="sm" className="rounded-full text-xs px-4">
                Daftar <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — Asymmetric Split Layout */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
        {/* Organic blob decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[80vh]">
            {/* Left: Copy */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary font-medium">Platform Undangan Digital #1</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-display font-bold leading-[0.95] tracking-tight">
                  Undangan
                  <br />
                  <span className="relative inline-block">
                    <span className="text-gradient-modern">Digital</span>
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                      <path d="M2 8C50 2 100 2 150 6C200 10 250 4 298 8" stroke="hsl(var(--accent))" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </span>
                  <br />
                  <span className="text-muted-foreground/70 text-4xl md:text-5xl lg:text-6xl font-light">yang Memukau.</span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  Buat undangan pernikahan, ulang tahun, dan acara spesial dengan template premium, link personal untuk setiap tamu, dan fitur RSVP lengkap.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link to="/auth?tab=signup">
                    <Button size="lg" className="gap-2 text-base px-8 rounded-full h-12 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                      Mulai Gratis <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button variant="outline" size="lg" className="text-base px-8 rounded-full h-12 border-2">
                      Lihat Demo
                    </Button>
                  </Link>
                </div>

                {/* Social proof strip */}
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex -space-x-2">
                    {["RA", "DK", "BS", "MF"].map((initials, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-white border-2 border-background">
                        {initials}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">2,000+</span> undangan dibuat bulan ini
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Decorative card stack */}
            <motion.div
              initial={{ opacity: 0, x: 60, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 hidden lg:block"
            >
              <div className="relative">
                {/* Background card */}
                <div className="absolute top-8 -left-6 w-72 h-96 rounded-3xl bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/20 rotate-[-6deg]" />
                {/* Main card */}
                <div className="relative z-10 w-80 h-[28rem] rounded-3xl bg-card border border-border/60 shadow-2xl shadow-black/10 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Wedding Template</span>
                    </div>
                    <h3 className="font-display text-3xl font-bold leading-tight mb-2">
                      Rina & Adi
                    </h3>
                    <p className="text-sm text-muted-foreground">Sabtu, 15 Maret 2026</p>
                    <p className="text-sm text-muted-foreground">Bali, Indonesia</p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-32 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border/40 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-primary/40" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono">01 : 23 : 45 : 12</span>
                      <span className="flex items-center gap-1"><Music className="w-3 h-3" /> Now Playing</span>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-4 top-12 z-20 bg-card border border-border/50 rounded-2xl px-4 py-3 shadow-xl shadow-black/5"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">RSVP Masuk!</p>
                      <p className="text-[10px] text-muted-foreground">Budi + 2 orang</p>
                    </div>
                  </div>
                </motion.div>
                {/* Floating counter badge */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -left-8 bottom-20 z-20 bg-card border border-border/50 rounded-2xl px-4 py-3 shadow-xl shadow-black/5"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    <span className="text-sm font-bold">127</span>
                    <span className="text-xs text-muted-foreground">tamu</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Marquee strip */}
      <div className="py-4 bg-primary text-primary-foreground overflow-hidden">
        <div className="marquee-track flex items-center gap-8 whitespace-nowrap">
          {Array(3).fill(null).map((_, groupIdx) => (
            <div key={groupIdx} className="flex items-center gap-8 shrink-0">
              {["Pernikahan", "Ulang Tahun", "Baby Shower", "Khitanan", "Graduation", "Gathering", "Anniversary", "Grand Opening"].map((item) => (
                <span key={item} className="flex items-center gap-3 text-sm font-medium tracking-wide uppercase">
                  <Star className="w-3 h-3" />
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Features — Bento Grid */}
      <section id="fitur" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="mb-16 max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-mono text-accent uppercase tracking-[0.2em] mb-3 block">— Fitur Unggulan</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-4">
              Semua yang kamu
              <br />butuhkan, <span className="text-gradient-modern">dalam satu platform</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Tidak perlu tools terpisah. Semua fitur terintegrasi untuk membuat undangan yang sempurna.
            </p>
          </motion.div>

          <div className="bento-grid grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className={
                  f.size === "large" ? "md:col-span-2 md:row-span-2" :
                  f.size === "tall" ? "md:col-span-1 md:row-span-2" :
                  "md:col-span-1"
                }
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Card className="h-full border-border/40 bg-card/80 backdrop-blur-sm hover:bg-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group overflow-hidden relative">
                  {/* Subtle gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-6 md:p-8 relative z-10 flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 ${
                      f.size === "large" ? "bg-gradient-to-br from-primary to-accent text-white" :
                      f.size === "tall" ? "bg-accent/10 text-accent" :
                      "bg-primary/8 text-primary"
                    }`}>
                      <f.icon className={f.size === "large" ? "w-7 h-7" : "w-6 h-6"} />
                    </div>
                    <h3 className={`font-display font-bold mb-2 ${f.size === "large" ? "text-2xl md:text-3xl" : "text-xl"}`}>{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
                    {f.size === "large" && (
                      <div className="mt-6 grid grid-cols-3 gap-3">
                        {["Classic", "Modern", "Floral"].map((tmpl) => (
                          <div key={tmpl} className="h-24 rounded-xl bg-gradient-to-br from-secondary/60 to-secondary/30 border border-border/30 flex items-end p-2">
                            <span className="text-[10px] font-medium text-muted-foreground">{tmpl}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Step cards */}
      <section className="py-24 px-6 bg-secondary/30 relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-mono text-accent uppercase tracking-[0.2em] mb-3 block">— Cara Kerja</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              3 Langkah Mudah
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-20 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {[
              { step: "01", title: "Pilih Template", desc: "Pilih dari koleksi template premium kami yang dirancang untuk berbagai acara.", icon: Sparkles },
              { step: "02", title: "Personalisasi", desc: "Tambahkan detail acara, foto, musik, dan peta lokasi sesuai keinginanmu.", icon: Zap },
              { step: "03", title: "Bagikan", desc: "Kirim link personal ke setiap tamu atau bagikan via QR code.", icon: Users },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-card border border-border/50 flex items-center justify-center shadow-lg">
                    <s.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-white text-[11px] font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — Horizontal Cards */}
      <section id="harga" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="text-xs font-mono text-accent uppercase tracking-[0.2em] mb-3 block">— Harga</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold">
                Pilih paket
                <br />yang <span className="text-gradient-modern">tepat untukmu</span>
              </h2>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Mulai gratis, upgrade kapan saja sesuai kebutuhan acara kamu.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan, i) => {
              const isPopular = i === 1;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                >
                  <Card className={`relative h-full overflow-hidden transition-all duration-500 hover:shadow-2xl ${
                    isPopular
                      ? "border-primary/50 shadow-lg shadow-primary/10 bg-gradient-to-b from-primary/5 to-card"
                      : "border-border/40 hover:border-primary/20"
                  }`}>
                    {isPopular && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                    )}
                    <CardContent className="p-7">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                        {isPopular && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1 rounded-full">
                            Populer
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-5 min-h-[2.5rem]">{plan.description}</p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold tracking-tight">
                          {plan.price === 0 ? "Gratis" : `Rp ${plan.price.toLocaleString("id-ID")}`}
                        </span>
                        {plan.price > 0 && <span className="text-muted-foreground text-sm ml-1">/bulan</span>}
                      </div>
                      <ul className="space-y-3 mb-7">
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
                            <li key={f} className="flex items-start gap-2.5 text-sm">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-primary" />
                              </div>
                              <span>{f}</span>
                            </li>
                          ));
                        })()}
                      </ul>
                      <Link to="/auth?tab=signup">
                        <Button className="w-full rounded-full" variant={isPopular ? "default" : "outline"} size="lg">
                          {plan.price === 0 ? "Mulai Gratis" : "Langganan"} <ChevronRight className="w-4 h-4 ml-1" />
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

      {/* Testimonials */}
      <section id="testimoni" className="py-24 px-6 bg-secondary/20">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-mono text-accent uppercase tracking-[0.2em] mb-3 block">— Testimoni</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              Apa kata mereka?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border/30 hover:border-primary/20 hover:shadow-lg transition-all duration-500">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex gap-1 mb-4">
                      {Array(5).fill(null).map((_, s) => (
                        <Star key={s} className="w-4 h-4 fill-gold text-gold" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed flex-1 mb-5">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
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

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            className="relative rounded-3xl overflow-hidden p-12 md:p-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />

            <div className="relative z-10 text-white">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                Siap buat undangan impianmu?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                Bergabung dengan ribuan pengguna yang sudah membuat undangan digital memukau.
              </p>
              <Link to="/auth?tab=signup">
                <Button size="lg" variant="secondary" className="rounded-full px-10 h-12 text-base font-semibold shadow-xl">
                  Mulai Sekarang — Gratis <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link to="/" className="font-display text-2xl font-bold text-primary inline-block mb-3">
                Undangan<span className="text-accent">ku</span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                Platform undangan digital terdepan di Indonesia. Buat undangan yang memukau dengan mudah.
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
          </div>
          <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2026 Undanganku. Hak cipta dilindungi.
            </p>
            <p className="text-xs text-muted-foreground">
              Dibuat dengan <Heart className="w-3 h-3 inline text-accent" /> di Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
