export type Viewport = "desktop" | "tablet" | "mobile";

export type NodeType =
  | "section" | "container" | "card" | "form"
  | "heading" | "text" | "button" | "image" | "video" | "icon"
  | "input" | "textarea" | "select" | "label" | "spacer" | "divider"
  | "navbar" | "footer";

export type AnimationName =
  | "none" | "fade-up" | "fade-in" | "slide-left" | "slide-right"
  | "zoom-in" | "float" | "pulse" | "bounce-soft";

export type HoverAnimation = "none" | "lift" | "scale" | "glow" | "tilt";

export interface NodeStyle {
  background: string;
  color: string;
  width: string;
  maxWidth: string;
  height: string;
  minHeight: string;
  padding: string;
  margin: string;
  borderWidth: string;
  borderColor: string;
  borderStyle: "solid" | "dashed" | "dotted" | "none";
  borderRadius: string;
  boxShadow: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: "left" | "center" | "right";
  display: "block" | "flex" | "grid";
  flexDirection: "row" | "column";
  justifyContent: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  alignItems: "stretch" | "flex-start" | "center" | "flex-end";
  gridColumns: string;
  gap: string;
  opacity: number;
  overflow: "visible" | "hidden" | "auto";
}

export interface NodeResponsiveStyle {
  tablet?: Partial<NodeStyle>;
  mobile?: Partial<NodeStyle>;
}

export interface BuilderNode {
  id: string;
  type: NodeType;
  name: string;
  content?: string;
  src?: string;
  alt?: string;
  href?: string;
  target?: "_self" | "_blank";
  placeholder?: string;
  options?: string[];
  animation?: AnimationName;
  hoverAnimation?: HoverAnimation;
  animationDuration?: number;
  animationDelay?: number;
  style: NodeStyle;
  responsive?: NodeResponsiveStyle;
  hiddenOn?: Partial<Record<Viewport, boolean>>;
  children?: BuilderNode[];
  meta?: Record<string, string | number | boolean>;
}

export interface BuilderPage {
  id: string;
  name: string;
  path: string;
  nodes: BuilderNode[];
  showNavbar: boolean;
  showFooter: boolean;
}

export type AssetKind = "image" | "video";
export type AssetSource = "upload" | "url";

export interface ProjectAsset {
  id: string;
  name: string;
  fileName: string;
  kind: AssetKind;
  source: AssetSource;
  url?: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
}

export interface BuilderProject {
  id: string;
  name: string;
  description?: string;
  templateId?: string;
  pages: BuilderPage[];
  activePageId: string;
  globalNavbar: BuilderNode;
  globalFooter: BuilderNode;
  assets: ProjectAsset[];
  createdAt: string;
  updatedAt: string;
  schemaVersion: 3;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  pageCount: number;
  assetCount: number;
}

export interface LibraryItem {
  id: string;
  name: string;
  category: "elements" | "sections" | "templates";
  group?: string;
  description?: string;
  sourceId?: string;
  thumbnail?: string;
  create?: () => BuilderNode;
  createPageNodes?: () => BuilderNode[];
}
