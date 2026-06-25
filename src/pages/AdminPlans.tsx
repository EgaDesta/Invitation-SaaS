import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { PlusCircle, Trash2, Edit, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminPlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", price: 0, weekly_quota: 6, description: "", features: "[]" });

  const fetchPlans = async () => {
    const { data } = await supabase.from("subscription_plans").select("*").order("price");
    if (data) setPlans(data);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const features = form.features.trim() ? form.features : "[]";
    const payload = {
      name: form.name,
      price: form.price,
      weekly_quota: form.weekly_quota,
      description: form.description,
      features: JSON.parse(features),
      is_active: true,
    };

    if (editId) {
      const { error } = await supabase.from("subscription_plans").update(payload).eq("id", editId);
      if (error) toast.error(error.message);
      else toast.success("Plan diperbarui");
    } else {
      const { error } = await supabase.from("subscription_plans").insert(payload);
      if (error) toast.error(error.message);
      else toast.success("Plan ditambahkan");
    }
    setOpen(false);
    setEditId(null);
    setForm({ name: "", price: 0, weekly_quota: 6, description: "", features: "[]" });
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus plan ini?")) return;
    const { error } = await supabase.from("subscription_plans").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Plan dihapus"); fetchPlans(); }
  };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      price: p.price,
      weekly_quota: p.weekly_quota,
      description: p.description || "",
      features: JSON.stringify(p.features || []),
    });
    setOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Kelola Paket</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { setEditId(null); setForm({ name: "", price: 0, weekly_quota: 6, description: "", features: "[]" }); }}>
                <PlusCircle className="w-4 h-4" /> Tambah
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editId ? "Edit" : "Tambah"} Paket</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Paket</Label>
                  <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={100} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Harga (Rp)</Label>
                    <Input type="number" min={0} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Kuota Mingguan</Label>
                    <Input type="number" min={1} value={form.weekly_quota} onChange={(e) => setForm((f) => ({ ...f, weekly_quota: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label>Fitur (JSON array)</Label>
                  <Textarea value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} rows={4} placeholder='["Fitur 1", "Fitur 2"]' />
                </div>
                <Button onClick={handleSave} className="w-full">Simpan</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit className="w-3 h-3" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
                <p className="text-2xl font-bold mb-3">
                  {p.price === 0 ? "Gratis" : `Rp ${p.price.toLocaleString("id-ID")}`}
                  {p.price > 0 && <span className="text-sm font-normal text-muted-foreground">/bulan</span>}
                </p>
                <p className="text-xs text-muted-foreground mb-2">Kuota: {p.weekly_quota} undangan/minggu</p>
                <ul className="space-y-1">
                  {(p.features || []).map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-primary mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
