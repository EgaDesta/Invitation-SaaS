import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Check, CreditCard } from "lucide-react";
import { parseFeatures } from "@/lib/utils";

export default function Subscription() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("subscription_plans").select("*").order("price").then(({ data }) => { if (data) setPlans(data); });
    supabase.from("subscriptions").select("*, subscription_plans(*)").eq("user_id", user.id).eq("status", "active").maybeSingle().then(({ data }) => { if (data) setCurrentSub(data); });
    supabase.from("transactions").select("*, subscription_plans(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) setTransactions(data); });
  }, [user]);

  const handleSubscribe = async (planId: string) => {
    if (!user) return;
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    if (plan.price === 0) {
      // Free plan - activate directly
      const { error } = await supabase.from("subscriptions").insert({ user_id: user.id, plan_id: planId, status: "active" });
      if (!error) {
        toast.success("Paket gratis diaktifkan!");
        window.location.reload();
      }
      return;
    }

    // Dummy payment: auto-activate subscription (simulasi sukses)
    const { error: txError } = await supabase.from("transactions").insert({
      user_id: user.id,
      plan_id: planId,
      amount: plan.price,
      status: "success",
    });
    if (txError) { toast.error(txError.message); return; }

    const { error: subError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_id: planId,
      status: "active",
    });
    if (subError) toast.error(subError.message);
    else {
      toast.success(`Paket ${plan.name} berhasil diaktifkan!`);
      window.location.reload();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Langganan</h1>
          <p className="text-muted-foreground">Kelola paket langgananmu</p>
        </div>

        {currentSub && (
          <Card className="border-primary">
            <CardContent className="p-6 flex items-center gap-4">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-lg">Paket Aktif: {(currentSub.subscription_plans as any)?.name}</p>
                <p className="text-sm text-muted-foreground">
                  Aktif sejak {new Date(currentSub.start_date).toLocaleDateString("id-ID")}
                  {currentSub.end_date && ` • Berakhir ${new Date(currentSub.end_date).toLocaleDateString("id-ID")}`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`h-full ${currentSub?.plan_id === plan.id ? "border-primary" : ""}`}>
                <CardContent className="p-6 flex flex-col h-full">
                  <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold my-4">
                    {plan.price === 0 ? "Gratis" : `Rp ${plan.price.toLocaleString("id-ID")}`}
                    {plan.price > 0 && <span className="text-sm text-muted-foreground">/bulan</span>}
                  </p>
                  <ul className="space-y-2 flex-1 mb-6">
                    {parseFeatures(plan.features).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={currentSub?.plan_id === plan.id ? "secondary" : "default"}
                    disabled={currentSub?.plan_id === plan.id}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {currentSub?.plan_id === plan.id ? "Aktif" : "Pilih Paket"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-bold mb-4">Riwayat Transaksi</h3>
              <div className="space-y-3">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">{(t.subscription_plans as any)?.name || "Paket"}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Rp {t.amount.toLocaleString("id-ID")}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        t.status === "success" ? "bg-primary/10 text-primary" :
                        t.status === "pending" ? "bg-gold/10 text-gold" :
                        "bg-destructive/10 text-destructive"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
