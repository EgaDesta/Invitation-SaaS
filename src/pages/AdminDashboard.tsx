import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Users, FileText, DollarSign, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, invitations: 0, revenue: 0, activeWeekly: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: invCount } = await supabase.from("invitations").select("*", { count: "exact", head: true });
      const { data: txData } = await supabase.from("transactions").select("amount").eq("status", "success");
      const revenue = txData?.reduce((a, b) => a + b.amount, 0) || 0;

      const weekStart = getWeekStart();
      const { count: activeCount } = await supabase.from("usage_logs").select("*", { count: "exact", head: true }).eq("week_start", weekStart);

      setStats({ users: userCount || 0, invitations: invCount || 0, revenue, activeWeekly: activeCount || 0 });
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-primary" },
    { label: "Total Undangan", value: stats.invitations, icon: FileText, color: "text-accent" },
    { label: "Revenue", value: `Rp ${stats.revenue.toLocaleString("id-ID")}`, icon: DollarSign, color: "text-gold" },
    { label: "Aktif Minggu Ini", value: stats.activeWeekly, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split("T")[0];
}
