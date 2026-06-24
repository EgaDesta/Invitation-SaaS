import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export function sanitizeInput(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

export function isValidMapEmbedUrl(url: string): boolean {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.hostname === "www.google.com" && u.pathname.startsWith("/maps/embed");
  } catch {
    return false;
  }
}

export function loadGoogleFonts(fontNames: string[]): () => void {
  const unique = [...new Set(fontNames)];
  const googleFonts = unique.map((f) => f.replace(/ /g, "+"));
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?${googleFonts.map((f) => `family=${f}:wght@300;400;500;600;700;800;900`).join("&")}&display=swap`;
  link.rel = "stylesheet";
  document.head.appendChild(link);
  return () => { document.head.removeChild(link); };
}

export function parseFeatures(features: unknown): string[] {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === "object") {
    return Object.entries(features).map(([k, v]) => {
      if (v === true) return k.replace(/_/g, " ");
      if (Array.isArray(v)) return `${k}: ${v.join(", ")}`;
      return `${k}: ${v}`;
    });
  }
  return [];
}
