import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TEMPLATE_CONFIGS } from "@/lib/templates";
import { ArrowLeft } from "lucide-react";
import InvitationPreview from "@/components/InvitationPreview";
import { useState } from "react";

const demoInvitations = [
  {
    title: "Pernikahan Andi & Sarah",
    event_type: "wedding",
    event_name: "The Wedding of Andi & Sarah",
    host_names: "Andi & Sarah",
    event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    event_time: "09:00 - 12:00 WIB",
    event_location: "Grand Ballroom Hotel Indonesia, Jakarta",
    event_description: "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri resepsi pernikahan kami.",
    map_embed_url: "",
    template_id: "rose-elegance",
  },
  {
    title: "Sweet 17th Birthday Ayu",
    event_type: "birthday",
    event_name: "Happy 17th Birthday Ayu!",
    host_names: "Ayu Permata",
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    event_time: "16:00 - 21:00 WIB",
    event_location: "Rooftop Lounge, Pacific Place, Jakarta",
    event_description: "Come celebrate with us! Let's make this sweet seventeen unforgettable 🎉",
    map_embed_url: "",
    template_id: "cherry-blossom",
  },
  {
    title: "Gala Dinner Annual 2026",
    event_type: "event",
    event_name: "Annual Gala Dinner",
    host_names: "PT Indonesia Maju",
    event_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    event_time: "18:00 - 22:00 WIB",
    event_location: "The Ritz-Carlton Ballroom, Jakarta",
    event_description: "An evening of celebration and recognition for our outstanding team members.",
    map_embed_url: "",
    template_id: "royal-navy",
  },
];

export default function Demo() {
  const [selected, setSelected] = useState(0);
  const demo = demoInvitations[selected];
  const template = TEMPLATE_CONFIGS.find((t) => t.id === demo.template_id);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <Link to="/" className="font-display text-xl font-bold text-primary">
            Undangan<span className="text-accent">ku</span>
          </Link>
          <Link to="/auth?tab=signup">
            <Button size="sm">Daftar Gratis</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Contoh Undangan</h1>
          <p className="text-muted-foreground">Lihat bagaimana undanganmu akan terlihat</p>
        </motion.div>

        {/* Template selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {demoInvitations.map((d, i) => (
            <Button
              key={i}
              variant={selected === i ? "default" : "outline"}
              size="sm"
              onClick={() => setSelected(i)}
            >
              {d.title.substring(0, 25)}...
            </Button>
          ))}
        </div>

        {/* Preview */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Info */}
          <div className="flex-1 max-w-md space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Template</p>
                  <p className="font-semibold text-lg">{template?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Tipe Acara</p>
                  <p className="font-semibold capitalize">{demo.event_type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Fitur</p>
                  <ul className="text-sm space-y-1 mt-1">
                    <li>✅ Countdown timer real-time</li>
                    <li>✅ RSVP & ucapan</li>
                    <li>✅ Google Maps embed</li>
                    <li>✅ Musik latar</li>
                    <li>✅ WhatsApp sharing</li>
                    <li>✅ QR Code generator</li>
                    <li>✅ Link personal per tamu</li>
                  </ul>
                </div>
                <Link to="/auth?tab=signup">
                  <Button className="w-full mt-2">Buat Undangan Serupa</Button>
                </Link>
              </CardContent>
            </Card>

            {/* All templates showcase */}
            <Card>
              <CardContent className="p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Semua Template</p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATE_CONFIGS.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-lg p-2 text-center cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      style={{ background: `linear-gradient(135deg, ${t.colors.primary}30, ${t.colors.secondary}60)` }}
                      onClick={() => {
                        const idx = demoInvitations.findIndex((d) => d.template_id === t.id);
                        if (idx >= 0) setSelected(idx);
                      }}
                    >
                      <p className="text-[10px] font-medium truncate">{t.name}</p>
                      <p className="text-[8px] opacity-60 capitalize">{t.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile phone preview */}
          <div className="mx-auto lg:mx-0">
            <div className="relative">
              <div className="w-[320px] h-[640px] rounded-[2.5rem] border-[8px] border-foreground/10 bg-background shadow-2xl overflow-hidden">
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/10 rounded-b-xl z-10" />
                <div className="w-full h-full overflow-hidden rounded-[2rem]">
                  <InvitationPreview
                    form={demo}
                    templateData={template ? { colors: template.colors, fonts: template.fonts } : undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
