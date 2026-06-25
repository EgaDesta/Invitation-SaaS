import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import InvitationPreview from "@/components/InvitationPreview";
import TemplateBuilder from "@/components/TemplateBuilder";
import { TEMPLATE_CONFIGS } from "@/lib/templates";
import { DEFAULT_CUSTOM_DESIGN, CustomDesignData } from "@/lib/customDesignTypes";
import { getWeekStart, isValidMapEmbedUrl } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Upload, Image, Music, Palette, Layout, Smartphone, Tablet, Monitor } from "lucide-react";

const steps = ["Template", "Detail Acara", "Media", "Preview"];

export default function CreateInvitation() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const [mode, setMode] = useState<"template" | "custom">("template");
  const [customDesign, setCustomDesign] = useState<CustomDesignData>({ ...DEFAULT_CUSTOM_DESIGN });
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("mobile");

  const [form, setForm] = useState({
    template_id: "",
    title: "",
    event_type: "wedding",
    event_name: "",
    host_names: "",
    event_date: "",
    event_time: "",
    event_location: "",
    event_description: "",
    map_embed_url: "",
    cover_image_url: "",
    music_url: "",
  });

  useEffect(() => {
    supabase.from("invitation_templates").select("*").eq("is_public", true).then(({ data }) => {
      if (data) setTemplates(data);
    });
  }, []);

  // Load existing invitation for edit mode
  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase.from("invitations").select("*").eq("id", id).single();
      if (error || !data) { toast.error("Undangan tidak ditemukan"); navigate("/dashboard/invitations"); return; }

      setForm({
        template_id: data.template_id || "",
        title: data.title || "",
        event_type: data.event_type || "wedding",
        event_name: data.event_name || "",
        host_names: data.host_names || "",
        event_date: data.event_date ? data.event_date.split("T")[0] : "",
        event_time: data.event_time || "",
        event_location: data.event_location || "",
        event_description: data.event_description || "",
        map_embed_url: data.map_embed_url || "",
        cover_image_url: data.cover_image_url || "",
        music_url: data.music_url || "",
      });

      if (data.custom_data && data.custom_data.mode === "custom") {
        setMode("custom");
        setCustomDesign({ ...DEFAULT_CUSTOM_DESIGN, ...data.custom_data });
      } else if (data.template_id) {
        setMode("template");
      }
      setInitialLoading(false);
    })();
  }, [id, navigate]);

  const updateForm = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const selectedTemplate = TEMPLATE_CONFIGS.find((t) => t.id === form.template_id) ||
    templates.find((t) => t.id === form.template_id);

  const getTemplateData = () => {
    if (mode === "custom") return customDesign;
    if (!selectedTemplate) return undefined;
    if ("colors" in selectedTemplate) return { colors: selectedTemplate.colors, fonts: selectedTemplate.fonts };
    return selectedTemplate.template_data;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Ukuran file maksimal 5MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Hanya file gambar yang diizinkan"); return; }

    setUploadingCover(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("invitations").upload(path, file);
    if (error) { toast.error(error.message); setUploadingCover(false); return; }

    const { data: urlData } = supabase.storage.from("invitations").getPublicUrl(path);
    updateForm("cover_image_url", urlData.publicUrl);
    setUploadingCover(false);
    toast.success("Foto cover berhasil diupload");
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Ukuran file maksimal 10MB"); return; }
    if (!file.type.startsWith("audio/")) { toast.error("Hanya file audio yang diizinkan"); return; }

    setUploadingMusic(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("music").upload(path, file);
    if (error) { toast.error(error.message); setUploadingMusic(false); return; }

    const { data: urlData } = supabase.storage.from("music").getPublicUrl(path);
    updateForm("music_url", urlData.publicUrl);
    setUploadingMusic(false);
    toast.success("Musik berhasil diupload");
  };

  const generateSlug = () => {
    const base = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `${base}-${Date.now().toString(36)}`;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    if (form.map_embed_url && !isValidMapEmbedUrl(form.map_embed_url)) {
      toast.error("URL Google Maps tidak valid. Gunakan URL embed dari Google Maps.");
      setLoading(false);
      return;
    }

    const dbTemplate = templates.find((t) => t.id === form.template_id);
    const customData = mode === "custom" ? customDesign : null;

    if (isEditMode) {
      // Edit mode: update existing invitation
      const { error } = await supabase.from("invitations").update({
        template_id: mode === "template" && dbTemplate ? form.template_id : null,
        title: form.title,
        event_type: form.event_type,
        event_name: form.event_name,
        host_names: form.host_names,
        event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
        event_time: form.event_time,
        event_location: form.event_location,
        event_description: form.event_description,
        map_embed_url: form.map_embed_url,
        cover_image_url: form.cover_image_url || null,
        music_url: form.music_url || null,
        custom_data: customData,
      }).eq("id", id);

      if (error) toast.error(error.message);
      else { toast.success("Undangan berhasil diperbarui!"); navigate("/dashboard/invitations"); }
      setLoading(false);
      return;
    }

    // === Create mode: QUOTA ENFORCEMENT ===
    const weekStart = getWeekStart();
    
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(weekly_quota)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    
    const currentQuota = subscription?.subscription_plans?.weekly_quota || 0;
    
    const { data: usage } = await supabase
      .from("usage_logs")
      .select("invitation_count")
      .eq("user_id", user.id)
      .eq("week_start", weekStart)
      .maybeSingle();
    
    const currentUsage = usage?.invitation_count || 0;
    
    if (currentUsage >= currentQuota) {
      toast.error(`Quota minggu ini habis! Limit: ${currentQuota} undangan. Upgrade plan untuk membuat lebih.`);
      setLoading(false);
      return;
    }
    
    const slug = generateSlug();

    const { error } = await supabase.from("invitations").insert({
      user_id: user.id,
      template_id: mode === "template" && dbTemplate ? form.template_id : null,
      slug,
      title: form.title,
      event_type: form.event_type,
      event_name: form.event_name,
      host_names: form.host_names,
      event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
      event_time: form.event_time,
      event_location: form.event_location,
      event_description: form.event_description,
      map_embed_url: form.map_embed_url,
      cover_image_url: form.cover_image_url || null,
      music_url: form.music_url || null,
      is_published: true,
      custom_data: customData,
    });

    if (error) {
      toast.error(error.message);
    } else {
      if (usage) {
        await supabase.from("usage_logs").update({ invitation_count: usage.invitation_count + 1 }).eq("id", usage.id);
      } else {
        await supabase.from("usage_logs").insert({ user_id: user.id, week_start: weekStart, invitation_count: 1 });
      }
      toast.success(`Undangan berhasil dibuat! Sisa quota: ${currentQuota - currentUsage - 1}`);
      navigate("/dashboard/invitations");
    }
    setLoading(false);
  };

  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Memuat undangan...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex gap-6 max-w-7xl mx-auto">
        {/* Form side */}
        <div className="flex-1 min-w-0 space-y-6">
          <div>
            <h1 className="text-2xl font-display font-bold">{isEditMode ? "Edit Undangan" : "Buat Undangan Baru"}</h1>
            <p className="text-muted-foreground">{isEditMode ? "Perbarui detail undanganmu" : "Ikuti langkah-langkah berikut"}</p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setStep(i)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    i <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </button>
                <span className={`text-sm hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {s}
                </span>
                {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardContent className="p-6">
                {step === 0 && (
                  <div className="space-y-4">
                    <CardTitle className="font-display">Pilih Template atau Buat Custom</CardTitle>

                    {/* Mode Toggle */}
                    <div className="flex gap-2 p-1 bg-secondary rounded-lg">
                      <button
                        onClick={() => setMode("template")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                          mode === "template"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Layout className="w-4 h-4" />
                        Pilih Template
                      </button>
                      <button
                        onClick={() => setMode("custom")}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                          mode === "custom"
                            ? "bg-background shadow-sm text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Palette className="w-4 h-4" />
                        Desain Custom
                      </button>
                    </div>

                    {mode === "template" ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {TEMPLATE_CONFIGS.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => updateForm("template_id", t.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              form.template_id === t.id
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className="w-full h-20 rounded-lg mb-2"
                              style={{ background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.secondary})` }}
                            />
                            <p className="font-medium text-sm truncate">{t.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{t.category}</p>
                          </button>
                        ))}
                        {templates.filter((t) => !TEMPLATE_CONFIGS.find((tc) => tc.id === t.id)).map((t) => (
                          <button
                            key={t.id}
                            onClick={() => updateForm("template_id", t.id)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              form.template_id === t.id
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className="w-full h-20 rounded-lg mb-2"
                              style={{
                                background: `linear-gradient(135deg, ${(t.template_data as any)?.colors?.primary || "#B76E79"}, ${(t.template_data as any)?.colors?.secondary || "#F5E6CC"})`,
                              }}
                            />
                            <p className="font-medium text-sm truncate">{t.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{t.category}</p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <TemplateBuilder key="custom-builder" design={customDesign} onChange={setCustomDesign} />
                    )}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <CardTitle className="font-display">Detail Acara</CardTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Judul Undangan *</Label>
                        <Input placeholder="Pernikahan Andi & Budi" value={form.title} onChange={(e) => updateForm("title", e.target.value)} required maxLength={200} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipe Acara</Label>
                        <Select value={form.event_type} onValueChange={(v) => updateForm("event_type", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wedding">Pernikahan</SelectItem>
                            <SelectItem value="birthday">Ulang Tahun</SelectItem>
                            <SelectItem value="event">Acara Besar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nama Acara</Label>
                        <Input placeholder="The Wedding of..." value={form.event_name} onChange={(e) => updateForm("event_name", e.target.value)} maxLength={200} />
                      </div>
                      <div className="space-y-2">
                        <Label>Nama Tuan Rumah</Label>
                        <Input placeholder="Andi & Budi" value={form.host_names} onChange={(e) => updateForm("host_names", e.target.value)} maxLength={200} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tanggal Acara</Label>
                        <Input type="date" value={form.event_date} onChange={(e) => updateForm("event_date", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Waktu Acara</Label>
                        <Input placeholder="09:00 - 12:00 WIB" value={form.event_time} onChange={(e) => updateForm("event_time", e.target.value)} maxLength={100} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Lokasi Acara</Label>
                      <Input placeholder="Hotel Grand Ballroom, Jakarta" value={form.event_location} onChange={(e) => updateForm("event_location", e.target.value)} maxLength={300} />
                    </div>
                    <div className="space-y-2">
                      <Label>Deskripsi</Label>
                      <Textarea placeholder="Deskripsi acara..." value={form.event_description} onChange={(e) => updateForm("event_description", e.target.value)} maxLength={1000} />
                    </div>
                    <div className="space-y-2">
                      <Label>Google Maps Embed URL (opsional)</Label>
                      <Input placeholder="https://www.google.com/maps/embed?pb=..." value={form.map_embed_url} onChange={(e) => updateForm("map_embed_url", e.target.value)} maxLength={500} />
                      <p className="text-xs text-muted-foreground">Buka Google Maps → Share → Embed a map → Salin URL dari src="..."</p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <CardTitle className="font-display">Media</CardTitle>

                    {/* Cover Image Upload */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2"><Image className="w-4 h-4" /> Foto Cover</Label>
                      {form.cover_image_url ? (
                        <div className="relative">
                          <img src={form.cover_image_url} alt="Cover" className="w-full h-40 object-cover rounded-lg" />
                          <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={() => updateForm("cover_image_url", "")}>
                            Hapus
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">{uploadingCover ? "Mengupload..." : "Klik untuk upload foto cover"}</span>
                          <span className="text-xs text-muted-foreground mt-1">Maks 5MB • JPG, PNG, WebP</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} disabled={uploadingCover} />
                        </label>
                      )}
                    </div>

                    {/* Music Upload */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2"><Music className="w-4 h-4" /> Musik Latar</Label>
                      {form.music_url ? (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                          <Music className="w-5 h-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Musik telah diupload</p>
                            <audio controls className="w-full mt-2 h-8" src={form.music_url} />
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => updateForm("music_url", "")}>Hapus</Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                          <Music className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">{uploadingMusic ? "Mengupload..." : "Klik untuk upload musik"}</span>
                          <span className="text-xs text-muted-foreground mt-1">Maks 10MB • MP3, WAV, OGG</span>
                          <input type="file" className="hidden" accept="audio/*" onChange={handleMusicUpload} disabled={uploadingMusic} />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <CardTitle className="font-display">Semua Siap!</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      Preview undanganmu ada di sebelah kanan. Klik "Buat Undangan" untuk mempublikasikan.
                    </p>
                    <div className="rounded-xl border bg-secondary/30 p-4 space-y-2 text-sm">
                      <p><strong>Judul:</strong> {form.title || "-"}</p>
                      <p><strong>Tipe:</strong> {form.event_type}</p>
                      <p><strong>Mode:</strong> {mode === "custom" ? "Desain Custom" : "Template"}</p>
                      <p><strong>Tuan Rumah:</strong> {form.host_names || "-"}</p>
                      <p><strong>Tanggal:</strong> {form.event_date ? new Date(form.event_date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "-"}</p>
                      <p><strong>Lokasi:</strong> {form.event_location || "-"}</p>
                      <p><strong>Cover:</strong> {form.cover_image_url ? "✅" : "❌"}</p>
                      <p><strong>Musik:</strong> {form.music_url ? "✅" : "❌"}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Sebelumnya
                  </Button>
                  {step < steps.length - 1 ? (
                    <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !form.title}>
                      Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={loading || !form.title}>
                      {loading ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Buat Undangan"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Preview - right side (hidden on mobile) */}
        <div className="hidden lg:block sticky top-24 self-start">
          <div className="flex items-center justify-center gap-1 mb-3 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${previewDevice === "mobile" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> HP
            </button>
            <button
              onClick={() => setPreviewDevice("tablet")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${previewDevice === "tablet" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              <Tablet className="w-3.5 h-3.5" /> Tablet
            </button>
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${previewDevice === "desktop" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
          </div>
          <div className="relative">
            {previewDevice === "mobile" && (
              <div className="w-[300px] h-[600px] rounded-[2.5rem] border-[8px] border-foreground/10 bg-background shadow-2xl overflow-hidden mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 bg-foreground/10 rounded-b-lg z-10" />
                <div className="w-full h-full overflow-hidden rounded-[2rem]">
                  <InvitationPreview form={form} templateData={getTemplateData()} />
                </div>
              </div>
            )}
            {previewDevice === "tablet" && (
              <div className="w-[540px] h-[720px] rounded-[1.5rem] border-[6px] border-foreground/10 bg-background shadow-2xl overflow-hidden mx-auto">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-foreground/10 rounded-b-md z-10" />
                <div className="w-full h-full overflow-hidden rounded-[1.2rem]">
                  <InvitationPreview form={form} templateData={getTemplateData()} />
                </div>
              </div>
            )}
            {previewDevice === "desktop" && (
              <div className="w-[640px] h-[420px] rounded-lg border-[4px] border-foreground/10 bg-background shadow-2xl overflow-hidden mx-auto">
                <div className="w-full h-full overflow-hidden rounded-[0.3rem]">
                  <InvitationPreview form={form} templateData={getTemplateData()} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


