import type { BuilderNode, BuilderProject, DesignSystem, NodeStyle, Viewport } from "../types";

export const defaultDesignSystem: DesignSystem = {
  breakpoints: { mobileMax: 639, tabletMax: 1023, previewDesktop: 1440, previewTablet: 768, previewMobile: 390 },
  containerMaxWidth: "1200px",
  contentPadding: { desktop: "40px", tablet: "28px", mobile: "18px" },
  spacing: { xs: "4px", sm: "8px", md: "16px", lg: "24px", xl: "40px", xxl: "64px" },
  typography: { xs: "12px", sm: "14px", base: "16px", lg: "18px", xl: "24px", xxl: "36px", display: "56px" },
  autoResponsive: true,
  reducedMotion: true
};

const px = (value: string) => { const m = /^(-?\d+(?:\.\d+)?)px$/.exec(value.trim()); return m ? Number(m[1]) : undefined; };
const scaledPx = (value: string, factor: number, floor: number) => { const n = px(value); return n == null ? value : `${Math.max(floor, Math.round(n * factor))}px`; };

export function resolveResponsiveStyle(node: BuilderNode, viewport: Viewport): NodeStyle {
  if (viewport === "desktop") return node.style;
  if (viewport === "tablet") return { ...node.style, ...(node.responsive?.tablet || {}) };
  return { ...node.style, ...(node.responsive?.tablet || {}), ...(node.responsive?.mobile || {}) };
}

export function previewWidth(design: DesignSystem, viewport: Viewport): number {
  if (viewport === "tablet") return design.breakpoints.previewTablet;
  if (viewport === "mobile") return design.breakpoints.previewMobile;
  return design.breakpoints.previewDesktop;
}

function inferred(node: BuilderNode, viewport: Exclude<Viewport,"desktop">, design: DesignSystem): Partial<NodeStyle> {
  const s = node.style;
  const patch: Partial<NodeStyle> = {};
  const mobile = viewport === "mobile";
  if (node.type === "section") patch.padding = mobile ? `44px ${design.contentPadding.mobile}` : `60px ${design.contentPadding.tablet}`;
  if (["container","card","form","tabs","accordion"].includes(node.type) && px(s.padding || "") && (px(s.padding || "") || 0) >= 20) patch.padding = mobile ? "18px" : "20px";
  if (node.type === "heading") patch.fontSize = scaledPx(s.fontSize, mobile ? .68 : .84, mobile ? 26 : 32);
  if (node.type === "text") patch.fontSize = scaledPx(s.fontSize, mobile ? .9 : .96, 15);
  if (["image","video","carousel","embed","map","html"].includes(node.type)) {
    const h = px(s.height || "");
    if (h && h > 260) patch.height = mobile ? "240px" : "300px";
  }
  if (s.display === "grid") {
    const multi = /repeat\(\s*([2-9]|\d{2,})/i.test(s.gridColumns) || s.gridColumns.split(/\s+/).filter(Boolean).length > 1;
    if (multi) patch.gridColumns = mobile ? "1fr" : "repeat(2,minmax(0,1fr))";
  }
  if (mobile && s.display === "flex" && s.flexDirection === "row" && !["navbar","socials","breadcrumb"].includes(node.type)) patch.flexDirection = "column";
  if (mobile && ["button","input","textarea","select","file"].includes(node.type) && s.width !== "100%") patch.maxWidth = "100%";
  if (node.type === "spacer") patch.height = mobile ? "32px" : "40px";
  return patch;
}

export function ensureResponsiveNode(node: BuilderNode, design: DesignSystem = defaultDesignSystem): BuilderNode {
  const children = node.children?.map(child => ensureResponsiveNode(child, design));
  if (!design.autoResponsive) return { ...node, children };
  const tablet = { ...inferred(node,"tablet",design), ...(node.responsive?.tablet || {}) };
  const mobile = { ...inferred(node,"mobile",design), ...(node.responsive?.mobile || {}) };
  return { ...node, children, responsive: { tablet, mobile }, hiddenOn: { ...(node.hiddenOn || {}) } };
}

export function ensureResponsiveProject(project: BuilderProject): BuilderProject {
  const design = project.designSystem || structuredClone(defaultDesignSystem);
  return {
    ...project,
    designSystem: design,
    globalNavbar: ensureResponsiveNode(project.globalNavbar, design),
    globalFooter: ensureResponsiveNode(project.globalFooter, design),
    pages: project.pages.map(page => ({ ...page, nodes: page.nodes.map(node => ensureResponsiveNode(node, design)) })),
    components: project.components.map(component => ({ ...component, node: ensureResponsiveNode(component.node, design) })),
    importedBlocks: project.importedBlocks.map(block => ({ ...block, node: ensureResponsiveNode(block.node, design) }))
  };
}

export interface ResponsiveAudit { total: number; ready: number; missing: number; overflowRisk: number; score: number; }
export function auditResponsiveProject(project: BuilderProject): ResponsiveAudit {
  let total=0, ready=0, overflowRisk=0;
  const visit=(node:BuilderNode)=>{
    total++;
    if (node.responsive?.tablet && node.responsive?.mobile) ready++;
    const w=px(node.style.width||"");
    if (w && w > project.designSystem.breakpoints.previewMobile && node.style.maxWidth === "none") overflowRisk++;
    node.children?.forEach(visit);
  };
  visit(project.globalNavbar); visit(project.globalFooter); project.pages.forEach(p=>p.nodes.forEach(visit));
  const missing=Math.max(0,total-ready);
  const score=total ? Math.max(0,Math.round(((ready - overflowRisk) / total)*100)) : 100;
  return { total, ready, missing, overflowRisk, score };
}

export function designSystemVars(design: DesignSystem, viewport: Viewport): Record<string,string> {
  const pad = design.contentPadding[viewport];
  return {
    "--nw-container": design.containerMaxWidth,
    "--nw-page-pad": pad,
    "--nw-space-xs": design.spacing.xs, "--nw-space-sm": design.spacing.sm, "--nw-space-md": design.spacing.md,
    "--nw-space-lg": design.spacing.lg, "--nw-space-xl": design.spacing.xl, "--nw-space-2xl": design.spacing.xxl,
    "--nw-type-xs": design.typography.xs, "--nw-type-sm": design.typography.sm, "--nw-type-base": design.typography.base,
    "--nw-type-lg": design.typography.lg, "--nw-type-xl": design.typography.xl, "--nw-type-2xl": design.typography.xxl, "--nw-type-display": design.typography.display
  };
}
