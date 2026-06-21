import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Sparkles, Users, Music, QrCode, MapPin, ArrowRight, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

const features = [
  { icon: Heart, title: "Template Elegan", desc: "Pilihan template premium untuk pernikahan, ulang tahun, & acara besar" },
  { icon: Users, title: "Link Personal", desc: "Setiap tamu mendapat undangan dengan nama mereka yang unik" },
  { icon: Music, title: "Musik Latar", desc: "Upload musik sendiri atau pilih dari koleksi kami" },
  { icon: QrCode, title: "QR Code", desc: "Generate QR code untuk dibagikan dengan mudah" },
  { icon: MapPin, title: "Google Maps", desc: "Embed lokasi acara langsung di undangan" },
  { icon: Sparkles, title: "RSVP & Countdown", desc: "Form RSVP dan hitung mundur otomatis" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Landing() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("subscription_plans")
      .select("*")
      .order("price")
      .then(({ data }) => { if (data) setPlans(data); })
      .catch((err) => console.error("Failed to load plans:", err));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Undanganku - Platform Undangan Digital #1 Indonesia"
        description="Buat undangan digital pernikahan, ulang tahun & acara spesial dengan template premium, RSVP online, countdown timer, Google Maps & musik latar. Mulai gratis!"
        canonical="/"
      />
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="font-display text-2xl font-bold text-primary">
            Undangan<span className="text-accent">ku</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Masuk</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="sm">Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              ✨ Platform Undangan Digital #1 Indonesia
            </span>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Buat Undangan Digital yang{" "}
            <span className="text-gradient">Memukau</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Undangan pernikahan, ulang tahun, dan acara besar dengan template premium,
            link personal untuk setiap tamu, dan fitur RSVP lengkap.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link to="/auth?tab=signup">
              <Button size="lg" className="gap-2 text-base px-8">
                Mulai Gratis <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg" className="text-base px-8">
                Lihat Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-display font-bold mb-4">
              Fitur Lengkap untuk Acara Sempurna
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-xl mx-auto">
              Semua yang kamu butuhkan untuk membuat undangan digital yang profesional
            </motion.p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="h-full hover:shadow-lg transition-shadow border-border/50 bg-card">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                    <p className="text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Pilih Paket yang Tepat</h2>
            <p className="text-muted-foreground text-lg">Mulai gratis, upgrade kapan saja</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className={`relative h-full ${i === 1 ? "border-primary shadow-lg scale-105" : "border-border/50"}`}>
                  {i === 1 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      POPULER
                    </span>
                  )}
                  <CardContent className="p-6">
                    <h3 className="font-display text-2xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-3xl font-bold">
                        {plan.price === 0 ? "Gratis" : `Rp ${plan.price.toLocaleString("id-ID")}`}
                      </span>
                      {plan.price > 0 && <span className="text-muted-foreground text-sm">/bulan</span>}
                    </div>
                    <ul className="space-y-3 mb-6">
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
                            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ));
                      })()}
                    </ul>
                    <Link to="/auth?tab=signup">
                      <Button className="w-full" variant={i === 1 ? "default" : "outline"}>
                        {plan.price === 0 ? "Mulai Gratis" : "Langganan Sekarang"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-secondary/20">
        <div className="container mx-auto text-center">
          <p className="font-display text-xl font-bold text-primary mb-2">
            Undangan<span className="text-accent">ku</span>
          </p>
          <p className="text-muted-foreground text-sm">
            © 2026 Undanganku. Platform undangan digital terbaik di Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}
