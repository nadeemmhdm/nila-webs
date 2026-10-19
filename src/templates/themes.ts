import type { ProjectTheme } from "../types";

export const defaultTheme: ProjectTheme = {
  id: "nila-light",
  name: "Nila Light",
  colors: {
    background: "#ffffff",
    surface: "#f8fafc",
    surfaceAlt: "#eef2ff",
    text: "#0f172a",
    muted: "#64748b",
    primary: "#7c3aed",
    primaryText: "#ffffff",
    secondary: "#0ea5e9",
    border: "#e2e8f0",
    success: "#059669",
    warning: "#d97706",
    danger: "#dc2626"
  },
  typography: { body: "Inter, ui-sans-serif, system-ui, sans-serif", heading: "Inter, ui-sans-serif, system-ui, sans-serif" },
  radius: "18px",
  shadow: "0 18px 55px rgba(15,23,42,.10)"
};

export const themePresets: ProjectTheme[] = [
  defaultTheme,
  {
    ...defaultTheme,
    id: "nila-dark", name: "Nila Dark",
    colors: { ...defaultTheme.colors, background: "#07090d", surface: "#11151b", surfaceAlt: "#181225", text: "#f8fafc", muted: "#94a3b8", primary: "#a78bfa", primaryText: "#0b0714", secondary: "#22d3ee", border: "#28303a" },
    shadow: "0 22px 70px rgba(0,0,0,.38)"
  },
  {
    ...defaultTheme,
    id: "aurora", name: "Aurora",
    colors: { ...defaultTheme.colors, background: "#07121d", surface: "#0d1d2a", surfaceAlt: "#0c2a2d", text: "#ecfeff", muted: "#9bd5d8", primary: "#2dd4bf", primaryText: "#05201d", secondary: "#38bdf8", border: "#1d4750" },
    radius: "24px", shadow: "0 20px 65px rgba(45,212,191,.12)"
  },
  {
    ...defaultTheme,
    id: "coral-studio", name: "Coral Studio",
    colors: { ...defaultTheme.colors, background: "#fff8f4", surface: "#ffffff", surfaceAlt: "#fff0e8", text: "#2d1812", muted: "#8a5a4d", primary: "#f97356", primaryText: "#ffffff", secondary: "#f59e0b", border: "#f5d6cb" },
    radius: "22px", shadow: "0 18px 55px rgba(160,70,40,.12)"
  },
  {
    ...defaultTheme,
    id: "teal-estate", name: "Teal Estate",
    colors: { ...defaultTheme.colors, background: "#f3fbfa", surface: "#ffffff", surfaceAlt: "#dff7f2", text: "#102a2a", muted: "#567270", primary: "#0f766e", primaryText: "#ffffff", secondary: "#14b8a6", border: "#c9e5e1" },
    radius: "14px", shadow: "0 16px 45px rgba(15,118,110,.11)"
  },
  {
    ...defaultTheme,
    id: "mono-pro", name: "Mono Pro",
    colors: { ...defaultTheme.colors, background: "#f7f7f5", surface: "#ffffff", surfaceAlt: "#eeeeeb", text: "#161616", muted: "#6b6b66", primary: "#161616", primaryText: "#ffffff", secondary: "#525252", border: "#d9d9d4" },
    typography: { body: "Inter, ui-sans-serif, system-ui, sans-serif", heading: "Georgia, ui-serif, serif" },
    radius: "8px", shadow: "0 12px 38px rgba(0,0,0,.08)"
  }
];

export function themeVars(theme: ProjectTheme): Record<string, string> {
  return {
    "--nw-background": theme.colors.background,
    "--nw-surface": theme.colors.surface,
    "--nw-surface-alt": theme.colors.surfaceAlt,
    "--nw-text": theme.colors.text,
    "--nw-muted": theme.colors.muted,
    "--nw-primary": theme.colors.primary,
    "--nw-primary-text": theme.colors.primaryText,
    "--nw-secondary": theme.colors.secondary,
    "--nw-border": theme.colors.border,
    "--nw-success": theme.colors.success,
    "--nw-warning": theme.colors.warning,
    "--nw-danger": theme.colors.danger,
    "--nw-radius": theme.radius,
    "--nw-shadow": theme.shadow,
    "--nw-font-body": theme.typography.body,
    "--nw-font-heading": theme.typography.heading
  };
}
