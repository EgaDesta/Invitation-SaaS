// Custom Design System - CMS-like template builder types

export interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundSecondary: string;
  text: string;
  textMuted: string;
  cardBg: string;
}

export interface CustomFonts {
  heading: string;
  body: string;
  headingSize: string;
  bodySize: string;
  headingWeight: string;
  letterSpacing: string;
}

export interface CustomLayout {
  style: "classic" | "modern" | "minimal" | "luxury";
  coverStyle: "fullscreen" | "split" | "centered" | "magazine";
  borderRadius: "none" | "sm" | "md" | "lg" | "xl" | "full";
  sectionSpacing: "compact" | "normal" | "spacious";
  maxWidth: string;
}

export interface CustomAnimations {
  entrance: "fadeIn" | "slideUp" | "slideDown" | "scaleIn" | "rotateIn" | "slideLeft" | "slideRight";
  speed: "slow" | "normal" | "fast";
  parallax: boolean;
  particles: "hearts" | "stars" | "petals" | "sparkles" | "confetti" | "none";
  hoverEffects: boolean;
  staggerDelay: number;
}

export interface CustomBackground {
  type: "solid" | "gradient" | "image" | "pattern";
  imageUrl: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  gradientDirection: "to-r" | "to-b" | "to-br" | "to-tl";
  overlayOpacity: number;
  patternType: "dots" | "lines" | "waves" | "none";
}

export interface CustomSections {
  showCover: boolean;
  showCountdown: boolean;
  showGallery: boolean;
  showRsvp: boolean;
  showWishes: boolean;
  showMaps: boolean;
  showMusicControl: boolean;
  showShare: boolean;
  showCoupleStory: boolean;
  coupleStory: string;
  brideName: string;
  groomName: string;
  brideParents: string;
  groomParents: string;
}

export interface CustomDesignData {
  version: 1;
  mode: "custom";
  colors: CustomColors;
  fonts: CustomFonts;
  layout: CustomLayout;
  animations: CustomAnimations;
  background: CustomBackground;
  sections: CustomSections;
}

export const DEFAULT_CUSTOM_DESIGN: CustomDesignData = {
  version: 1,
  mode: "custom",
  colors: {
    primary: "#e11d48",
    secondary: "#f59e0b",
    accent: "#ec4899",
    background: "#fdf2f8",
    backgroundSecondary: "#ffffff",
    text: "#1f2937",
    textMuted: "#6b7280",
    cardBg: "#ffffff",
  },
  fonts: {
    heading: "Playfair Display",
    body: "Inter",
    headingSize: "5xl",
    bodySize: "base",
    headingWeight: "700",
    letterSpacing: "normal",
  },
  layout: {
    style: "modern",
    coverStyle: "centered",
    borderRadius: "xl",
    sectionSpacing: "normal",
    maxWidth: "2xl",
  },
  animations: {
    entrance: "fadeIn",
    speed: "normal",
    parallax: true,
    particles: "hearts",
    hoverEffects: true,
    staggerDelay: 0.15,
  },
  background: {
    type: "gradient",
    imageUrl: "",
    gradientFrom: "#fdf2f8",
    gradientVia: "#ffffff",
    gradientTo: "#fef3c7",
    gradientDirection: "to-br",
    overlayOpacity: 0.5,
    patternType: "none",
  },
  sections: {
    showCover: true,
    showCountdown: true,
    showGallery: true,
    showRsvp: true,
    showWishes: true,
    showMaps: true,
    showMusicControl: true,
    showShare: true,
    showCoupleStory: false,
    coupleStory: "",
    brideName: "",
    groomName: "",
    brideParents: "",
    groomParents: "",
  },
};

export const FONT_OPTIONS = [
  { name: "Playfair Display", category: "Serif", google: "Playfair+Display" },
  { name: "Cormorant Garamond", category: "Serif", google: "Cormorant+Garamond" },
  { name: "Lora", category: "Serif", google: "Lora" },
  { name: "Merriweather", category: "Serif", google: "Merriweather" },
  { name: "Inter", category: "Sans", google: "Inter" },
  { name: "Poppins", category: "Sans", google: "Poppins" },
  { name: "Nunito", category: "Sans", google: "Nunito" },
  { name: "Montserrat", category: "Sans", google: "Montserrat" },
  { name: "Raleway", category: "Sans", google: "Raleway" },
  { name: "Josefin Sans", category: "Sans", google: "Josefin+Sans" },
  { name: "Great Vibes", category: "Script", google: "Great+Vibes" },
  { name: "Dancing Script", category: "Script", google: "Dancing+Script" },
  { name: "Sacramento", category: "Script", google: "Sacramento" },
  { name: "Allura", category: "Script", google: "Allura" },
  { name: "Cinzel", category: "Display", google: "Cinzel" },
  { name: "Tangerine", category: "Script", google: "Tangerine" },
];

export const COLOR_PRESETS = [
  { name: "Rose Gold", colors: { primary: "#e11d48", secondary: "#f59e0b", accent: "#ec4899", background: "#fdf2f8", backgroundSecondary: "#ffffff", text: "#1f2937", textMuted: "#6b7280", cardBg: "#ffffff" } },
  { name: "Navy Elegant", colors: { primary: "#1e3a5f", secondary: "#c9a96e", accent: "#4a90d9", background: "#f0f4f8", backgroundSecondary: "#ffffff", text: "#1a202c", textMuted: "#718096", cardBg: "#ffffff" } },
  { name: "Emerald", colors: { primary: "#065f46", secondary: "#d4a574", accent: "#10b981", background: "#f0fdf4", backgroundSecondary: "#ffffff", text: "#1f2937", textMuted: "#6b7280", cardBg: "#ffffff" } },
  { name: "Lavender", colors: { primary: "#7c3aed", secondary: "#f472b6", accent: "#a78bfa", background: "#faf5ff", backgroundSecondary: "#ffffff", text: "#1f2937", textMuted: "#6b7280", cardBg: "#ffffff" } },
  { name: "Dark Luxury", colors: { primary: "#c9a96e", secondary: "#8b6914", accent: "#d4a574", background: "#1a1a2e", backgroundSecondary: "#16213e", text: "#f5f5f5", textMuted: "#a0a0a0", cardBg: "#16213e" } },
  { name: "Peach Blossom", colors: { primary: "#f97316", secondary: "#fb923c", accent: "#fdba74", background: "#fff7ed", backgroundSecondary: "#ffffff", text: "#1f2937", textMuted: "#6b7280", cardBg: "#ffffff" } },
  { name: "Midnight", colors: { primary: "#3b82f6", secondary: "#8b5cf6", accent: "#06b6d4", background: "#0f172a", backgroundSecondary: "#1e293b", text: "#f1f5f9", textMuted: "#94a3b8", cardBg: "#1e293b" } },
  { name: "Sakura", colors: { primary: "#db2777", secondary: "#fda4af", accent: "#f472b6", background: "#fff1f2", backgroundSecondary: "#ffffff", text: "#1f2937", textMuted: "#6b7280", cardBg: "#ffffff" } },
];

export function getRadiusClass(radius: string): string {
  const map: Record<string, string> = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-full",
  };
  return map[radius] || "rounded-xl";
}

export function getSpacingClass(spacing: string): string {
  const map: Record<string, string> = {
    compact: "space-y-10",
    normal: "space-y-16",
    spacious: "space-y-24",
  };
  return map[spacing] || "space-y-16";
}

export function getAnimationDuration(speed: string): number {
  const map: Record<string, number> = { slow: 1.2, normal: 0.8, fast: 0.4 };
  return map[speed] || 0.8;
}

export function getEntranceVariants(entrance: string) {
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];
  const map: Record<string, any> = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.8, ease } },
    },
    slideUp: {
      hidden: { opacity: 0, y: 60 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
    },
    slideDown: {
      hidden: { opacity: 0, y: -60 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.85 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease } },
    },
    rotateIn: {
      hidden: { opacity: 0, rotate: -10, scale: 0.9 },
      visible: { opacity: 1, rotate: 0, scale: 1, transition: { duration: 0.8, ease } },
    },
    slideLeft: {
      hidden: { opacity: 0, x: 60 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease } },
    },
    slideRight: {
      hidden: { opacity: 0, x: -60 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease } },
    },
  };
  return map[entrance] || map.fadeIn;
}

export function isCustomDesign(data: any): data is CustomDesignData {
  return data && data.mode === "custom" && data.version === 1;
}
