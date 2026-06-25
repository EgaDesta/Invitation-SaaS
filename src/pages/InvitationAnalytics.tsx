import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Eye, Users, Heart, ArrowLeft, TrendingUp, Check, X, HelpCircle } from "lucide-react";

export default function InvitationAnalytics() {
  const { id } = useParams<{ id: string }>();
  const [invitation, setInvitation] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: inv } = await supabase.from("invitations").select("*").eq("id", id).single();
      if (inv) setInvitation(inv);
      const { data: g } = await supabase.from("guests").select("*").eq("invitation_id", id);
      if (g) setGuests(g);
      setLoading(false);
    })();
  }, [id]);

  const rsvpStats = {
    attending: guests.filter((g) => g.rsvp_status === "attending").length,
    notAttending: guests.filter((g) => g.rsvp_status === "not_attending").length,
    maybe: guests.filter((g) => g.rsvp_status === "maybe").length,
    pending: guests.filter((g) => g.rsvp_status === "pending").length,
  };

  const totalGuests = guests.length;
  const responded = rsvpStats.attending + rsvpStats.notAttending + rsvpStats.maybe;
  const responseRate = totalGuests > 0 ? Math.round((responded / totalGuests) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/dashboard/invitations" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-1">
              <ArrowLeft className="w-3 h-3" /> Kembali
            </Link>
            <h1 className="text-2xl font-display font-bold">{invitation?.title || "Analytics"}</h1>
          </div>
          <Link to={`/invite/${invitation?.slug}?to=Preview`} target="_blank">
            <Button variant="outline" size="sm">Lihat Undangan</Button>
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Eye className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{invitation?.view_count || 0}</p>
                <p className="text-xs text-muted-foreground">Total Dilihat</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Users className="w-5 h-5 text-accent" /></div>
              <div>
                <p className="text-2xl font-bold">{totalGuests}</p>
                <p className="text-xs text-muted-foreground">Total Tamu</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold">{responseRate}%</p>
                <p className="text-xs text-muted-foreground">Respon Tamu</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Heart className="w-5 h-5 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{rsvpStats.attending}</p>
                <p className="text-xs text-muted-foreground">Akan Hadir</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RSVP Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Rekap RSVP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { label: "Hadir", value: rsvpStats.attending, color: "bg-primary", icon: Check },
                { label: "Tidak Hadir", value: rsvpStats.notAttending, color: "bg-destructive", icon: X },
                { label: "Mungkin", value: rsvpStats.maybe, color: "bg-yellow-500", icon: HelpCircle },
                { label: "Belum Respon", value: rsvpStats.pending, color: "bg-muted-foreground", icon: HelpCircle },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><item.icon className="w-3.5 h-3.5" /> {item.label}</span>
                    <span className="font-medium">{item.value} tamu</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${item.color} transition-all`} style={{ width: `${totalGuests > 0 ? (item.value / totalGuests) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Guests */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Tamu Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {guests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada tamu</p>
            ) : (
              <div className="space-y-2">
                {guests.slice(0, 10).map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-sm">
                    <span className="font-medium">{g.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      g.rsvp_status === "attending" ? "bg-primary/10 text-primary" :
                      g.rsvp_status === "not_attending" ? "bg-destructive/10 text-destructive" :
                      g.rsvp_status === "maybe" ? "bg-yellow-100 text-yellow-700" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {g.rsvp_status === "attending" ? "Hadir" : g.rsvp_status === "not_attending" ? "Tidak" : g.rsvp_status === "maybe" ? "Mungkin" : "Pending"}
                    </span>
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
