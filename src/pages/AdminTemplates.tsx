import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import TemplateBuilder from "@/components/TemplateBuilder";
import { CustomDesignData, DEFAULT_CUSTOM_DESIGN } from "@/lib/customDesignTypes";
import { PlusCircle, Trash2, Edit, Palette } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "wedding" });
  const [editId, setEditId] = useState<string | null>(null);
  const [templateDesign, setTemplateDesign] = useState<CustomDesignData>({ ...DEFAULT_CUSTOM_DESIGN });

  const fetchTemplates = async () => {
    const { data } = await supabase.from("invitation_templates").select("*").order("created_at");
    if (data) setTemplates(data);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editId) {
      const { error } = await supabase.from("invitation_templates").update({
        name: form.name,
        category: form.category,
        template_data: templateDesign,
      }).eq("id", editId);
      if (error) toast.error(error.message);
      else toast.success("Template diperbarui");
    } else {
      const { error } = await supabase.from("invitation_templates").insert({
        name: form.name,
        category: form.category,
        is_public: true,
        template_data: templateDesign,
      });
      if (error) toast.error(error.message);
      else toast.success("Template ditambahkan");
    }
    setForm({ name: "", category: "wedding" });
    setEditId(null);
    setOpen(false);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus template ini?")) return;
    const { error } = await supabase.from("invitation_templates").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Template dihapus"); fetchTemplates(); }
  };

  const openEdit = (t: any) => {
    setEditId(t.id);
    setForm({ name: t.name, category: t.category });
    setTemplateDesign(t.template_data && typeof t.template_data === "object"
      ? { ...DEFAULT_CUSTOM_DESIGN, ...t.template_data }
      : { ...DEFAULT_CUSTOM_DESIGN }
    );
    setOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Kelola Template</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => { setEditId(null); setForm({ name: "", category: "wedding" }); setTemplateDesign({ ...DEFAULT_CUSTOM_DESIGN }); }}>
                <PlusCircle className="w-4 h-4" /> Tambah
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-display">{editId ? "Edit" : "Tambah"} Template</DialogTitle></DialogHeader>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="info">Informasi</TabsTrigger>
                  <TabsTrigger value="design"><Palette className="w-3 h-3 mr-1" /> Desain</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Nama Template</Label>
                    <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wedding">Pernikahan</SelectItem>
                        <SelectItem value="birthday">Ulang Tahun</SelectItem>
                        <SelectItem value="event">Acara</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSave} className="w-full">Simpan Template</Button>
                </TabsContent>

                <TabsContent value="design" className="mt-4">
                  <TemplateBuilder design={templateDesign} onChange={setTemplateDesign} />
                  <Button onClick={handleSave} className="w-full mt-4">Simpan Template</Button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="p-4">
                <div
                  className="w-full h-24 rounded-lg mb-3"
                  style={{
                    background: `linear-gradient(135deg, ${(t.template_data as any)?.colors?.primary || "#B76E79"}, ${(t.template_data as any)?.colors?.secondary || "#F5E6CC"})`,
                  }}
                />
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-xs text-muted-foreground capitalize mb-3">{t.category}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
