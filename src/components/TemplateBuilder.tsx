import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette, Type, Layout, Sparkles, Image, Eye, Layers, RotateCcw,
  Heart, Star, Flower2, Zap, PartyPopper, Paintbrush
} from "lucide-react";
import {
  CustomDesignData,
  DEFAULT_CUSTOM_DESIGN,
  FONT_OPTIONS,
  COLOR_PRESETS,
  CustomColors,
} from "@/lib/customDesignTypes";

interface TemplateBuilderProps {
  design: CustomDesignData;
  onChange: (design: CustomDesignData) => void;
}

export default function TemplateBuilder({ design, onChange }: TemplateBuilderProps) {
  const [activeTab, setActiveTab] = useState("colors");

  const update = (path: string, value: any) => {
    // Use functional update to avoid stale closure issues
    const next = JSON.parse(JSON.stringify(design));
    const keys = path.split(".");
    let obj: any = next;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(next);
  };

  const applyPreset = (colors: CustomColors) => {
    const next = JSON.parse(JSON.stringify(design));
    next.colors = colors;
    onChange(next);
  };

  const resetDesign = () => {
    onChange(JSON.parse(JSON.stringify(DEFAULT_CUSTOM_DESIGN)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <Paintbrush className="w-5 h-5" />
          Desain Custom
        </h3>
        <Button variant="ghost" size="sm" onClick={resetDesign} className="text-xs gap-1">
          <RotateCcw className="w-3 h-3" /> Reset
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 w-full h-auto p-1">
          <TabsTrigger value="colors" className="text-xs flex-col gap-1 py-2 px-1">
            <Palette className="w-4 h-4" /> Warna
          </TabsTrigger>
          <TabsTrigger value="fonts" className="text-xs flex-col gap-1 py-2 px-1">
            <Type className="w-4 h-4" /> Font
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-xs flex-col gap-1 py-2 px-1">
            <Layout className="w-4 h-4" /> Layout
          </TabsTrigger>
          <TabsTrigger value="animations" className="text-xs flex-col gap-1 py-2 px-1">
            <Sparkles className="w-4 h-4" /> Animasi
          </TabsTrigger>
          <TabsTrigger value="background" className="text-xs flex-col gap-1 py-2 px-1">
            <Image className="w-4 h-4" /> BG
          </TabsTrigger>
          <TabsTrigger value="sections" className="text-xs flex-col gap-1 py-2 px-1">
            <Layers className="w-4 h-4" /> Bagian
          </TabsTrigger>
        </TabsList>

        {/* COLORS TAB */}
        <TabsContent value="colors" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Preset Warna</Label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.colors)}
                  className="group relative p-2 rounded-lg border-2 border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex gap-1 mb-1">
                    <div className="w-5 h-5 rounded-full" style={{ background: preset.colors.primary }} />
                    <div className="w-5 h-5 rounded-full" style={{ background: preset.colors.secondary }} />
                    <div className="w-5 h-5 rounded-full" style={{ background: preset.colors.accent }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(design.colors).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => update(`colors.${key}`, e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer"
                  />
                  <Input
                    value={value}
                    onChange={(e) => update(`colors.${key}`, e.target.value)}
                    className="text-xs h-8"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* FONTS TAB */}
        <TabsContent value="fonts" className="space-y-4 mt-4">
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Font Heading</Label>
              <Select value={design.fonts.heading} onValueChange={(v) => update("fonts.heading", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.name} value={f.name}>
                      <span style={{ fontFamily: f.name }}>{f.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({f.category})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs mt-1" style={{ fontFamily: design.fonts.heading, fontSize: "18px" }}>
                Preview: The Wedding of Andi & Budi
              </p>
            </div>

            <div>
              <Label className="text-sm">Font Body</Label>
              <Select value={design.fonts.body} onValueChange={(v) => update("fonts.body", v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.name} value={f.name}>
                      <span style={{ fontFamily: f.name }}>{f.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({f.category})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs mt-1 text-muted-foreground" style={{ fontFamily: design.fonts.body }}>
                Preview: Kepada Yth. Bapak/Ibu yang kami hormati, dengan ini kami mengundang...
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Ukuran Heading</Label>
                <Select value={design.fonts.headingSize} onValueChange={(v) => update("fonts.headingSize", v)}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["3xl", "4xl", "5xl", "6xl", "7xl", "8xl"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ukuran Body</Label>
                <Select value={design.fonts.bodySize} onValueChange={(v) => update("fonts.bodySize", v)}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["xs", "sm", "base", "lg", "xl"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ketebalan Heading</Label>
                <Select value={design.fonts.headingWeight} onValueChange={(v) => update("fonts.headingWeight", v)}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["300", "400", "500", "600", "700", "800", "900"].map((w) => (
                      <SelectItem key={w} value={w}>{w} ({w === "300" ? "Light" : w === "400" ? "Normal" : w === "500" ? "Medium" : w === "600" ? "Semi Bold" : w === "700" ? "Bold" : w === "800" ? "Extra Bold" : "Black"})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Letter Spacing</Label>
                <Select value={design.fonts.letterSpacing} onValueChange={(v) => update("fonts.letterSpacing", v)}>
                  <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["tight", "normal", "wide", "wider", "widest"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* LAYOUT TAB */}
        <TabsContent value="layout" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm">Gaya Layout</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["classic", "modern", "minimal", "luxury"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => update("layout.style", style)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    design.layout.style === style
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-sm capitalize">{style}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {style === "classic" ? "Tradisional & formal" :
                     style === "modern" ? "Clean & kekinian" :
                     style === "minimal" ? "Simple & bersih" :
                     "Mewah & premium"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm">Gaya Cover</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["fullscreen", "split", "centered", "magazine"] as const).map((cs) => (
                <button
                  key={cs}
                  onClick={() => update("layout.coverStyle", cs)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    design.layout.coverStyle === cs
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-sm capitalize">{cs}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Border Radius</Label>
              <Select value={design.layout.borderRadius} onValueChange={(v) => update("layout.borderRadius", v)}>
                <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["none", "sm", "md", "lg", "xl", "full"].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Spasi Antar Bagian</Label>
              <Select value={design.layout.sectionSpacing} onValueChange={(v) => update("layout.sectionSpacing", v)}>
                <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["compact", "normal", "spacious"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* ANIMATIONS TAB */}
        <TabsContent value="animations" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm">Animasi Masuk</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { id: "fadeIn", icon: Eye, label: "Fade In" },
                { id: "slideUp", icon: Sparkles, label: "Slide Up" },
                { id: "slideDown", icon: Sparkles, label: "Slide Down" },
                { id: "scaleIn", icon: Sparkles, label: "Scale In" },
                { id: "rotateIn", icon: RotateCcw, label: "Rotate In" },
                { id: "slideLeft", icon: Sparkles, label: "Slide Left" },
                { id: "slideRight", icon: Sparkles, label: "Slide Right" },
              ].map((anim) => (
                <button
                  key={anim.id}
                  onClick={() => update("animations.entrance", anim.id)}
                  className={`p-2 rounded-lg border-2 text-center text-sm transition-all ${
                    design.animations.entrance === anim.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm">Kecepatan</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(["slow", "normal", "fast"] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => update("animations.speed", speed)}
                  className={`p-2 rounded-lg border-2 text-center text-sm capitalize transition-all ${
                    design.animations.speed === speed
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {speed === "slow" ? "🐢 Lambat" : speed === "normal" ? "⚡ Normal" : "🚀 Cepat"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm">Partikel</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { id: "hearts", icon: Heart, label: "Hearts" },
                { id: "stars", icon: Star, label: "Stars" },
                { id: "petals", icon: Flower2, label: "Petals" },
                { id: "sparkles", icon: Sparkles, label: "Sparkles" },
                { id: "confetti", icon: PartyPopper, label: "Confetti" },
                { id: "none", icon: Zap, label: "None" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => update("animations.particles", p.id)}
                  className={`p-2 rounded-lg border-2 text-center text-xs transition-all flex flex-col items-center gap-1 ${
                    design.animations.particles === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p.icon className="w-4 h-4" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Parallax Effect</Label>
            <Switch checked={design.animations.parallax} onCheckedChange={(v) => update("animations.parallax", v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Hover Effects</Label>
            <Switch checked={design.animations.hoverEffects} onCheckedChange={(v) => update("animations.hoverEffects", v)} />
          </div>
        </TabsContent>

        {/* BACKGROUND TAB */}
        <TabsContent value="background" className="space-y-4 mt-4">
          <div>
            <Label className="text-sm">Tipe Background</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["solid", "gradient", "image", "pattern"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update("background.type", t)}
                  className={`p-2 rounded-lg border-2 text-center text-sm capitalize transition-all ${
                    design.background.type === t
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {(design.background.type === "gradient" || design.background.type === "solid") && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Dari</Label>
                <input type="color" value={design.background.gradientFrom} onChange={(e) => update("background.gradientFrom", e.target.value)} className="w-full h-8 rounded border cursor-pointer mt-1" />
              </div>
              <div>
                <Label className="text-xs">Via</Label>
                <input type="color" value={design.background.gradientVia} onChange={(e) => update("background.gradientVia", e.target.value)} className="w-full h-8 rounded border cursor-pointer mt-1" />
              </div>
              <div>
                <Label className="text-xs">Ke</Label>
                <input type="color" value={design.background.gradientTo} onChange={(e) => update("background.gradientTo", e.target.value)} className="w-full h-8 rounded border cursor-pointer mt-1" />
              </div>
            </div>
          )}

          {design.background.type === "gradient" && (
            <div>
              <Label className="text-xs">Arah Gradient</Label>
              <Select value={design.background.gradientDirection} onValueChange={(v) => update("background.gradientDirection", v)}>
                <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-r">→ Kanan</SelectItem>
                  <SelectItem value="to-b">↓ Bawah</SelectItem>
                  <SelectItem value="to-br">↘ Diagonal</SelectItem>
                  <SelectItem value="to-tl">↖ Diagonal Balik</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {design.background.type === "image" && (
            <div>
              <Label className="text-xs">URL Gambar Background</Label>
              <Input
                value={design.background.imageUrl}
                onChange={(e) => update("background.imageUrl", e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
              <div>
                <Label className="text-xs">Overlay Opacity: {Math.round(design.background.overlayOpacity * 100)}%</Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={design.background.overlayOpacity}
                  onChange={(e) => update("background.overlayOpacity", parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </div>
            </div>
          )}

          {design.background.type === "pattern" && (
            <div>
              <Label className="text-xs">Tipe Pattern</Label>
              <Select value={design.background.patternType} onValueChange={(v) => update("background.patternType", v)}>
                <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dots">Dots (titik-titik)</SelectItem>
                  <SelectItem value="lines">Lines (garis)</SelectItem>
                  <SelectItem value="waves">Waves (gelombang)</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Live preview */}
          <div className="rounded-xl border overflow-hidden h-20" style={{
            background: design.background.type === "gradient"
              ? `linear-gradient(${design.background.gradientDirection === "to-r" ? "to right" : design.background.gradientDirection === "to-b" ? "to bottom" : design.background.gradientDirection === "to-br" ? "to bottom right" : "to top left"}, ${design.background.gradientFrom}, ${design.background.gradientVia}, ${design.background.gradientTo})`
              : design.background.type === "solid"
              ? design.background.gradientFrom
              : design.background.type === "image"
              ? `url(${design.background.imageUrl})`
              : design.background.gradientFrom,
            backgroundSize: "cover",
          }} />
        </TabsContent>

        {/* SECTIONS TAB */}
        <TabsContent value="sections" className="space-y-3 mt-4">
          {[
            { key: "showCover", label: "Cover Pembuka" },
            { key: "showCountdown", label: "Hitung Mundur" },
            { key: "showGallery", label: "Galeri Foto" },
            { key: "showRsvp", label: "RSVP / Konfirmasi" },
            { key: "showWishes", label: "Ucapan & Doa" },
            { key: "showMaps", label: "Peta Lokasi" },
            { key: "showMusicControl", label: "Tombol Musik" },
            { key: "showShare", label: "Tombol Share" },
            { key: "showCoupleStory", label: "Cerita Pasangan" },
          ].map((section) => (
            <div key={section.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <Label className="text-sm">{section.label}</Label>
              <Switch
                checked={(design.sections as any)[section.key]}
                onCheckedChange={(v) => update(`sections.${section.key}`, v)}
              />
            </div>
          ))}

          {design.sections.showCoupleStory && (
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Nama Mempelai Wanita</Label>
                  <Input value={design.sections.brideName} onChange={(e) => update("sections.brideName", e.target.value)} placeholder="Anisa Putri" className="mt-1 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Nama Mempelai Pria</Label>
                  <Input value={design.sections.groomName} onChange={(e) => update("sections.groomName", e.target.value)} placeholder="Budi Santoso" className="mt-1 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Orang Tua Wanita</Label>
                  <Input value={design.sections.brideParents} onChange={(e) => update("sections.brideParents", e.target.value)} placeholder="Putri dari Bpk. X & Ibu Y" className="mt-1 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Orang Tua Pria</Label>
                  <Input value={design.sections.groomParents} onChange={(e) => update("sections.groomParents", e.target.value)} placeholder="Putra dari Bpk. A & Ibu B" className="mt-1 text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Cerita Pasangan</Label>
                <Textarea value={design.sections.coupleStory} onChange={(e) => update("sections.coupleStory", e.target.value)} placeholder="Cerita perjalanan cinta kalian..." className="mt-1 min-h-[80px]" />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
