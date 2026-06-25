import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, FileText, Eye, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import type { Invitation, DashboardStats } from "@/types";
import { getWeekStart } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({ invitations: 0, totalViews: 0, totalGuests: 0 });
  const [weeklyUsage, setWeeklyUsage] = useState(0);
  const [weeklyQuota, setWeeklyQuota] = useState(6);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    if (!user) return;

    const checkOnboarding = async () => {
      const { data: profile } = await supabase.from("profiles").select("is_onboarded").eq("user_id", user.id).maybeSingle();
      if (profile && !profile.is_onboarded) {
        navigate("/onboarding", { replace: true });
      }
    };
    checkOnboarding();

    const fetchData = async () => {
      const { data: invData } = await supabase
        .from("invitations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (invData) {
        setInvitations(invData as Invitation[]);
        setStats((s) => ({
          ...s,
          invitations: invData.length,
          totalViews: invData.reduce((a: number, b: Invitation) => a + (b.view_count || 0), 0),
        }));
      }

      const { count } = await supabase
        .from("guests")
        .select("*, invitations!inner(user_id)", { count: "exact", head: true })
        .eq("invitations.user_id", user.id);
      if (count) setStats((s) => ({ ...s, totalGuests: count }));

      const weekStart = getWeekStart();
      const { data: usage } = await supabase
        .from("usage_logs")
        .select("invitation_count")
        .eq("user_id", user.id)
        .eq("week_start", weekStart)
        .maybeSingle();
      if (usage) setWeeklyUsage(usage.invitation_count);

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan_id, subscription_plans(weekly_quota)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();
      if (sub?.subscription_plans) {
        setWeeklyQuota((sub.subscription_plans as unknown as { weekly_quota: number }).weekly_quota);
      }
    };

    fetchData();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Kelola undangan digitalmu</p>
          </div>
          <Link to="/dashboard/create">
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" /> Buat Undangan
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Undangan", value: stats.invitations, icon: FileText, color: "text-primary" },
            { label: "Total Dilihat", value: stats.totalViews, icon: Eye, color: "text-accent" },
            { label: "Total Tamu", value: stats.totalGuests, icon: Users, color: "text-gold" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-2">Kuota Minggu Ini</p>
                <p className="text-lg font-bold mb-2">{weeklyUsage} / {weeklyQuota}</p>
                <Progress value={(weeklyUsage / weeklyQuota) * 100} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Undangan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {invitations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Belum ada undangan. Buat undangan pertamamu!</p>
                <Link to="/dashboard/create">
                  <Button className="mt-4" variant="outline">Buat Sekarang</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">{inv.title}</p>
                      <p className="text-xs text-muted-foreground">{inv.event_type} • {new Date(inv.created_at).toLocaleDateString("id-ID")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{inv.view_count} views</span>
                      <Link to={`/dashboard/invitations/${inv.id}`}>
                        <Button size="sm" variant="ghost">Detail</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}