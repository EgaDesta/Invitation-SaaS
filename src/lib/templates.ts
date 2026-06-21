export interface TemplateConfig {
  id: string;
  name: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    bg: string;
  };
  fonts: {
    display: string;
    body: string;
  };
  layout: string;
}

export const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: "rose-elegance",
    name: "Rose Elegance",
    category: "wedding",
    colors: { primary: "#B76E79", secondary: "#F5E6CC", text: "#3D2B2B", bg: "#FFF8F5" },
    fonts: { display: "Playfair Display", body: "Inter" },
    layout: "classic",
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    category: "wedding",
    colors: { primary: "#D4A853", secondary: "#1A1A2E", text: "#F0E6D3", bg: "#0F0F1A" },
    fonts: { display: "Playfair Display", body: "Inter" },
    layout: "luxury",
  },
  {
    id: "garden-sage",
    name: "Garden Sage",
    category: "wedding",
    colors: { primary: "#7B9E6B", secondary: "#E8DFD0", text: "#2D3A25", bg: "#F5F2EC" },
    fonts: { display: "Playfair Display", body: "Inter" },
    layout: "botanical",
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    category: "wedding",
    colors: { primary: "#4A8DAB", secondary: "#D4E8EF", text: "#1C3D4D", bg: "#F0F8FB" },
    fonts: { display: "Playfair Display", body: "Inter" },
    layout: "coastal",
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    category: "wedding",
    colors: { primary: "#9B7DB8", secondary: "#E8D8F0", text: "#3D2D4D", bg: "#FAF5FF" },
    fonts: { display: "Playfair Display", body: "Inter" },
    layout: "romantic",
  },
  {
    id: "sunset-blush",
    name: "Sunset Blush",
    category: "birthday",
    colors: { primary: "#E8734A", secondary: "#FDE8D0", text: "#3D2418", bg: "#FFFAF5" },
    fonts: { display: "Playfair Display", body: "Inter" },
    layout: "festive",
  },
  {
    id: "royal-navy",
    name: "Royal Navy",
    category: "event",
    colors: { primary: "#2C3E6B", secondary: "#C8D6E5", text: "#1A2740", bg: "#F0F3F8" },
    fonts: { display: "Playfair Display", body: "Inter" },
    layout: "corporate",
  },
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    category: "birthday",
    colors: { primary: "#E88DA5", secondary: "#FFE4EC", text: "#4A2030", bg: "#FFF5F8" },
    fonts: { display: "Playfair Display", body: "Inter" },
    layout: "playful",
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    category: "wedding",
    colors: { primary: "#2D7C5F", secondary: "#D4E8DE", text: "#1A3D2D", bg: "#F0FAF5" },
    fonts: { display: "Playfair Display", body: "Inter" },
    layout: "nature",
  },
  {
    id: "classic-ivory",
    name: "Classic Ivory",
    category: "wedding",
    colors: { primary: "#8B7355", secondary: "#EDE5D8", text: "#3D3020", bg: "#FFFDF8" },
    fonts: { display: "Playfair Display", body: "Inter" },
    layout: "timeless",
  },
];
