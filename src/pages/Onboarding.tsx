import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
  { title: "Selamat Datang!", subtitle: "Kami siap bantu kamu membuat undangan digital yang elegan." },
  { title: "Lengkapi Profil", subtitle: "Beri tahu kami siapa kamu." },
  { title: "Selesai!", subtitle: "Kamu siap memulai." },
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "" });

  const handleNext = async () => {
    if (step === 1) {
      if (!form.full_name.trim()) return toast.error("Nama lengkap wajib diisi");
      setLoading(true);
      await supabase.from("profiles").update({ full_name: form.full_name, phone: form.phone }).eq("user_id", user?.id);
      setLoading(false);
    }
    if (step === 2) {
      setLoading(true);
      await supabase.from("profiles").update({ is_onboarded: true }).eq("user_id", user?.id);
      setLoading(false);
      toast.success("Selamat datang di Hadira!");
      navigate("/dashboard", { replace: true });
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= step ? "w-8 bg-primary" : "w-4 bg-secondary"}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {step === 0 && (
                <div className="text-center py-6 space-y-3">
                  <PartyPopper className="w-12 h-12 mx-auto text-primary" />
                  <h1 className="text-2xl font-display font-bold">{steps[0].title}</h1>
                  <p className="text-muted-foreground text-sm">{steps[0].subtitle}</p>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4 py-4">
                  <h2 className="text-xl font-display font-bold">{steps[1].title}</h2>
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} maxLength={100} placeholder="Masukkan nama kamu" />
                  </div>
                  <div className="space-y-2">
                    <Label>No. Telepon (opsional)</Label>
                    <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} maxLength={20} placeholder="+62" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-primary" />
                  <h2 className="text-xl font-display font-bold">{steps[2].title}</h2>
                  <p className="text-muted-foreground text-sm">{steps[2].subtitle}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-end mt-6">
            <Button onClick={handleNext} disabled={loading} className="gap-2">
              {step === steps.length - 1 ? (loading ? "Memuat..." : "Mulai") : "Lanjut"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
