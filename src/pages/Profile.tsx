import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { User, CreditCard, Shield, Upload, Camera, Check, Calendar, Mail, Phone, Key } from "lucide-react";
import { getWeekStart } from "@/lib/utils";

export default function Profile() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string; phone: string }>({ full_name: "", avatar_url: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [subscription, setSubscription] = useState<any>(null);
  const [weeklyUsage, setWeeklyUsage] = useState(0);
  const [weeklyQuota, setWeeklyQuota] = useState(6);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;

    supabase.from("profiles").select("full_name, avatar_url, phone").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name || "", avatar_url: data.avatar_url || "", phone: data.phone || "" });
    });

    supabase.from("subscriptions").select("*, subscription_plans(*)").eq("user_id", user.id).eq("status", "active").maybeSingle().then(({ data }) => {
      if (data) setSubscription(data);
    });

    const weekStart = getWeekStart();
    supabase.from("usage_logs").select("invitation_count").eq("user_id", user.id).eq("week_start", weekStart).maybeSingle().then(({ data }) => {
      if (data) setWeeklyUsage(data.invitation_count);
    });

    supabase.from("subscriptions").select("plan_id, subscription_plans(weekly_quota)").eq("user_id", user.id).eq("status", "active").maybeSingle().then(({ data }) => {
      if (data?.subscription_plans) setWeeklyQuota((data.subscription_plans as any).weekly_quota);
    });

    supabase.from("transactions").select("*, subscription_plans(name)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3).then(({ data }) => {
      if (data) setTransactions(data);
    });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Ukuran foto maksimal 2MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Hanya file gambar yang diizinkan"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from("invitations").upload(path, file, { upsert: true });
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("invitations").getPublicUrl(path);
    const avatarUrl = urlData.publicUrl;

    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
    if (updateError) { toast.error(updateError.message); } else {
      setProfile((p) => ({ ...p, avatar_url: avatarUrl }));
      toast.success("Foto profil berhasil diupload");
    }
    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: profile.full_name, phone: profile.phone }).eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Profil berhasil diperbarui");
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error("Password minimal 6 karakter"); return; }
    if (newPassword !== confirmPassword) { toast.error("Password baru tidak cocok"); return; }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else {
      toast.success("Password berhasil diubah");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPassword(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Profil</h1>
          <p className="text-muted-foreground">Kelola akun dan langgananmu</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="profile"><User className="w-3.5 h-3.5 mr-1" /> Profil</TabsTrigger>
            <TabsTrigger value="billing"><CreditCard className="w-3.5 h-3.5 mr-1" /> Tagihan</TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-3.5 h-3.5 mr-1" /> Keamanan</TabsTrigger>
          </TabsList>

          {/* TAB 1: PROFILE */}
          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden bg-secondary flex items-center justify-center border-4 border-border">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                  </div>
                  <p className="text-sm text-muted-foreground">{uploading ? "Mengupload..." : "Klik kamera untuk ganti foto"}</p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="p-6 space-y-4">
                  <CardTitle className="font-display text-lg">Informasi Profil</CardTitle>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" /> {user?.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nama Lengkap</Label>
                    <Input value={profile.full_name} onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))} maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nomor Telepon</Label>
                    <Input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="+62xxx" maxLength={20} />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                    {saving ? "Menyimpan..." : "Simpan Profil"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: BILLING */}
          <TabsContent value="billing" className="mt-6 space-y-6">
            {subscription && (
              <Card className="border-primary">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{(subscription.subscription_plans as any)?.name || "Paket Aktif"}</p>
                      <p className="text-sm text-muted-foreground">
                        Aktif sejak {new Date(subscription.start_date).toLocaleDateString("id-ID")}
                        {subscription.end_date && ` • Berakhir ${new Date(subscription.end_date).toLocaleDateString("id-ID")}`}
                      </p>
                    </div>
                    <a href="/dashboard/subscription">
                      <Button variant="outline" size="sm">Kelola</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">Kuota Minggu Ini</p>
                  <p className="text-sm text-muted-foreground">{weeklyUsage} / {weeklyQuota}</p>
                </div>
                <Progress value={(weeklyUsage / Math.max(weeklyQuota, 1)) * 100} className="h-2.5" />
                <p className="text-xs text-muted-foreground mt-2">
                  {weeklyUsage >= weeklyQuota ? "Kuota habis! Upgrade paket untuk menambah." : `Sisa ${weeklyQuota - weeklyUsage} undangan`}
                </p>
              </CardContent>
            </Card>

            {transactions.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-bold mb-4">Transaksi Terakhir</h3>
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
                            t.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {t.status === "success" ? "Berhasil" : t.status === "pending" ? "Menunggu" : "Gagal"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <a href="/dashboard/subscription">
                    <Button variant="link" className="mt-3 px-0">Lihat semua transaksi →</Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {!subscription && transactions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Belum ada langganan aktif.</p>
                  <a href="/dashboard/subscription">
                    <Button className="mt-4">Lihat Paket</Button>
                  </a>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB 3: SECURITY */}
          <TabsContent value="security" className="mt-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Key className="w-5 h-5" /> Ubah Password
                </CardTitle>
                <div className="space-y-2">
                  <Label>Password Baru</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" />
                </div>
                <div className="space-y-2">
                  <Label>Konfirmasi Password Baru</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ketik ulang password baru" />
                </div>
                <Button onClick={handleChangePassword} disabled={changingPassword || !newPassword} className="gap-2">
                  {changingPassword ? "Mengubah..." : "Ubah Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
