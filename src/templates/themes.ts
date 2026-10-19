import type { ProjectTheme } from "../types";

export const defaultTheme: ProjectTheme = {
  id: "nila-light",
  name: "Nila Light",
  source: "preset",
  colors: {
    background: "#ffffff", surface: "#f8fafc", surfaceAlt: "#eef2ff", text: "#0f172a", muted: "#64748b",
    primary: "#7c3aed", primaryText: "#ffffff", secondary: "#0ea5e9", border: "#e2e8f0",
    success: "#059669", warning: "#d97706", danger: "#dc2626"
  },
  typography: { body: "Inter, ui-sans-serif, system-ui, sans-serif", heading: "Inter, ui-sans-serif, system-ui, sans-serif" },
  radius: "18px", shadow: "0 18px 55px rgba(15,23,42,.10)"
};

const preset = (theme: ProjectTheme): ProjectTheme => ({ ...theme, source: "preset" });

export const themePresets: ProjectTheme[] = [
  defaultTheme,
  preset({ ...defaultTheme, id: "nila-dark", name: "Nila Dark", colors: { ...defaultTheme.colors, background: "#07090d", surface: "#11151b", surfaceAlt: "#181225", text: "#f8fafc", muted: "#94a3b8", primary: "#a78bfa", primaryText: "#0b0714", secondary: "#22d3ee", border: "#28303a" }, shadow: "0 22px 70px rgba(0,0,0,.38)" }),
  preset({ ...defaultTheme, id: "aurora", name: "Aurora", colors: { ...defaultTheme.colors, background: "#07121d", surface: "#0d1d2a", surfaceAlt: "#0c2a2d", text: "#ecfeff", muted: "#9bd5d8", primary: "#2dd4bf", primaryText: "#05201d", secondary: "#38bdf8", border: "#1d4750" }, radius: "24px", shadow: "0 20px 65px rgba(45,212,191,.12)" }),
  preset({ ...defaultTheme, id: "coral-studio", name: "Coral Studio", colors: { ...defaultTheme.colors, background: "#fff8f4", surface: "#ffffff", surfaceAlt: "#fff0e8", text: "#2d1812", muted: "#8a5a4d", primary: "#f97356", primaryText: "#ffffff", secondary: "#f59e0b", border: "#f5d6cb" }, radius: "22px", shadow: "0 18px 55px rgba(160,70,40,.12)" }),
  preset({ ...defaultTheme, id: "teal-estate", name: "Teal Estate", colors: { ...defaultTheme.colors, background: "#f3fbfa", surface: "#ffffff", surfaceAlt: "#dff7f2", text: "#102a2a", muted: "#567270", primary: "#0f766e", primaryText: "#ffffff", secondary: "#14b8a6", border: "#c9e5e1" }, radius: "14px", shadow: "0 16px 45px rgba(15,118,110,.11)" }),
  preset({ ...defaultTheme, id: "mono-pro", name: "Mono Pro", colors: { ...defaultTheme.colors, background: "#f7f7f5", surface: "#ffffff", surfaceAlt: "#eeeeeb", text: "#161616", muted: "#6b6b66", primary: "#161616", primaryText: "#ffffff", secondary: "#525252", border: "#d9d9d4" }, typography: { body: "Inter, ui-sans-serif, system-ui, sans-serif", heading: "Georgia, ui-serif, serif" }, radius: "8px", shadow: "0 12px 38px rgba(0,0,0,.08)" }),
  preset({ ...defaultTheme, id: "ocean-blue", name: "Ocean Blue", colors: { ...defaultTheme.colors, background: "#f5f9ff", surface: "#ffffff", surfaceAlt: "#e7f0ff", text: "#0b1f3a", muted: "#5a6f89", primary: "#2563eb", primaryText: "#ffffff", secondary: "#06b6d4", border: "#d6e2f5" }, radius: "16px", shadow: "0 18px 55px rgba(37,99,235,.10)" }),
  preset({ ...defaultTheme, id: "rose-editorial", name: "Rose Editorial", colors: { ...defaultTheme.colors, background: "#fff9fb", surface: "#ffffff", surfaceAlt: "#fff0f5", text: "#2b1520", muted: "#8b6575", primary: "#db2777", primaryText: "#ffffff", secondary: "#f97316", border: "#f4d7e3" }, typography: { body: "Inter, ui-sans-serif, system-ui, sans-serif", heading: "Georgia, ui-serif, serif" }, radius: "10px", shadow: "0 18px 55px rgba(190,24,93,.10)" }),
  preset({ ...defaultTheme, id: "emerald-product", name: "Emerald Product", colors: { ...defaultTheme.colors, background: "#f5fbf8", surface: "#ffffff", surfaceAlt: "#e6f7ef", text: "#0b2c20", muted: "#54766a", primary: "#059669", primaryText: "#ffffff", secondary: "#84cc16", border: "#d1e9df" }, radius: "20px", shadow: "0 18px 55px rgba(5,150,105,.11)" }),
  preset({ ...defaultTheme, id: "midnight-neon", name: "Midnight Neon", colors: { ...defaultTheme.colors, background: "#05060a", surface: "#10121a", surfaceAlt: "#19142b", text: "#fafafa", muted: "#9ca3af", primary: "#8b5cf6", primaryText: "#ffffff", secondary: "#22d3ee", border: "#2a2e3b" }, radius: "20px", shadow: "0 24px 80px rgba(139,92,246,.16)" }),
  preset({ ...defaultTheme, id: "warm-sand", name: "Warm Sand", colors: { ...defaultTheme.colors, background: "#fbf7ef", surface: "#fffdf8", surfaceAlt: "#f4ead7", text: "#2b241d", muted: "#786b5c", primary: "#b45309", primaryText: "#fffaf0", secondary: "#0f766e", border: "#e6dac5" }, typography: { body: "Inter, ui-sans-serif, system-ui, sans-serif", heading: "Georgia, ui-serif, serif" }, radius: "12px", shadow: "0 18px 50px rgba(90,60,25,.10)" })
];

export function themeVars(theme: ProjectTheme): Record<string, string> {
  return {
    "--nw-background": theme.colors.background, "--nw-surface": theme.colors.surface, "--nw-surface-alt": theme.colors.surfaceAlt,
    "--nw-text": theme.colors.text, "--nw-muted": theme.colors.muted, "--nw-primary": theme.colors.primary,
    "--nw-primary-text": theme.colors.primaryText, "--nw-secondary": theme.colors.secondary, "--nw-border": theme.colors.border,
    "--nw-success": theme.colors.success, "--nw-warning": theme.colors.warning, "--nw-danger": theme.colors.danger,
    "--nw-radius": theme.radius, "--nw-shadow": theme.shadow, "--nw-font-body": theme.typography.body, "--nw-font-heading": theme.typography.heading
  };
}
