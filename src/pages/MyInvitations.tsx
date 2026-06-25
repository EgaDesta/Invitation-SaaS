import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { PlusCircle, Eye, Copy, Trash2, ExternalLink, Users, Pencil, BarChart3 } from "lucide-react";

export default function MyInvitations() {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("invitations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setInvitations(data);
    setLoading(false);
  };

  useEffect(() => { fetchInvitations(); }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus undangan ini?")) return;
    const { error } = await supabase.from("invitations").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Undangan dihapus");
      fetchInvitations();
    }
  };

  const handleDuplicate = async (inv: any) => {
    if (!user) return;
    const { slug, ...rest } = inv;
    const newSlug = `${slug}-copy-${Date.now().toString(36)}`;
    const { error } = await supabase.from("invitations").insert({ ...rest, slug: newSlug, title: `${rest.title} (Copy)`, view_count: 0 });
    if (error) toast.error(error.message);
    else {
      toast.success("Undangan berhasil diduplikasi");
      fetchInvitations();
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/invite/${slug}?to=Nama+Tamu`;
    navigator.clipboard.writeText(url);
    toast.success("Link disalin!");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Undangan Saya</h1>
          <Link to="/dashboard/create">
            <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Buat Baru</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Memuat...</div>
        ) : invitations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16 text-muted-foreground">
              <p className="mb-4">Belum ada undangan</p>
              <Link to="/dashboard/create"><Button>Buat Undangan Pertama</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {invitations.map((inv, i) => (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{inv.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {inv.event_type} • {new Date(inv.created_at).toLocaleDateString("id-ID")}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {inv.view_count}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${inv.is_published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {inv.is_published ? "Publik" : "Draft"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => copyLink(inv.slug)} title="Salin link">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Link to={`/invite/${inv.slug}?to=Preview`} target="_blank">
                        <Button size="sm" variant="ghost" title="Lihat">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/dashboard/invitations/${inv.id}/guests`}>
                        <Button size="sm" variant="ghost" title="Kelola tamu">
                          <Users className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/dashboard/invitations/${inv.id}/edit`}>
                        <Button size="sm" variant="ghost" title="Edit undangan">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/dashboard/invitations/${inv.id}/analytics`}>
                        <Button size="sm" variant="ghost" title="Analytics">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => handleDuplicate(inv)} title="Duplikasi">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(inv.id)} title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
