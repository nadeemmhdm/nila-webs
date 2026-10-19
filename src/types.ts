export type Viewport = "desktop" | "tablet" | "mobile";

export type NodeType =
  | "section" | "container" | "card" | "form"
  | "heading" | "text" | "button" | "image" | "video" | "icon"
  | "input" | "textarea" | "select" | "label" | "checkbox" | "radio" | "switch" | "range" | "file"
  | "link" | "badge" | "list" | "embed" | "map" | "table" | "tabs" | "accordion" | "modal" | "carousel" | "socials" | "symbol"
  | "html" | "code" | "alert" | "avatar" | "progress" | "breadcrumb" | "rating"
  | "spacer" | "divider" | "navbar" | "footer";

export type AnimationName =
  | "none" | "fade-up" | "fade-down" | "fade-in" | "slide-left" | "slide-right" | "slide-up" | "slide-down"
  | "zoom-in" | "zoom-out" | "rotate-in" | "blur-in" | "float" | "pulse" | "bounce-soft";

export type HoverAnimation = "none" | "lift" | "scale" | "glow" | "tilt" | "rotate" | "press" | "brightness";
export type MotionTrigger = "load" | "scroll" | "always";
export type TimelineOrder = "forward" | "reverse";
export type ReducedMotionMode = "respect" | "reduce" | "disable";
export type InputKind = "text" | "email" | "password" | "number" | "date" | "datetime-local" | "time" | "tel" | "url" | "search";
export type InputType = InputKind;
export type ListStyle = "disc" | "decimal" | "none";
export type FormMethod = "get" | "post";
export type LinkKind = "page" | "anchor" | "external" | "email" | "phone";
export type FormProvider = "none" | "custom" | "formspree";
export type PromptArtifactType = "section" | "component" | "theme";

export interface ThemeColors {
  background: string; surface: string; surfaceAlt: string; text: string; muted: string; primary: string; primaryText: string; secondary: string; border: string; success: string; warning: string; danger: string;
}
export interface ProjectTheme {
  id: string;
  name: string;
  colors: ThemeColors;
  typography: { body: string; heading: string };
  radius: string;
  shadow: string;
  source?: "preset" | "custom" | "prompt";
}

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

export interface DesignSystem {
  breakpoints: { mobileMax:number; tabletMax:number; previewDesktop:number; previewTablet:number; previewMobile:number };
  containerMaxWidth: string;
  contentPadding: Record<Viewport,string>;
  spacing: { xs:string; sm:string; md:string; lg:string; xl:string; xxl:string };
  typography: { xs:string; sm:string; base:string; lg:string; xl:string; xxl:string; display:string };
  autoResponsive: boolean;
  reducedMotion: boolean;
}

export interface MotionSystem {
  enabled: boolean;
  defaultTrigger: MotionTrigger;
  defaultDuration: number;
  defaultEasing: string;
  scrollThreshold: number;
  defaultStagger: number;
  parallaxMax: number;
  reducedMotion: ReducedMotionMode;
}

export interface InteractiveItem { title: string; body: string; }
export interface TableModel { headers: string[]; rows: string[][]; caption?: string; }
export interface CarouselSlide { src: string; alt?: string; caption?: string; }
export interface SocialLink { label: string; href: string; }

export interface PageSeo { title: string; description: string; image: string; canonical: string; noIndex: boolean; }
export interface SeoSettings { siteTitle: string; titleTemplate: string; description: string; siteUrl: string; language: string; defaultImage: string; favicon: string; index: boolean; follow: boolean; generateSitemap: boolean; generateRobots: boolean; }
export interface SiteAuditIssue { severity: "error" | "warning" | "info"; code: string; message: string; pageId?: string; nodeId?: string; }
export interface SiteAuditResult { score: number; issues: SiteAuditIssue[]; }

export interface BuilderNode {
  id: string;
  type: NodeType;
  name: string;
  content?: string;
  src?: string;
  alt?: string;
  href?: string;
  linkKind?: LinkKind;
  anchorId?: string;
  download?: boolean;
  target?: "_self" | "_blank";
  placeholder?: string;
  options?: string[];
  checked?: boolean;
  required?: boolean;
  value?: string;
  nameAttr?: string;
  inputType?: InputKind;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  rows?: number;
  accept?: string;
  multiple?: boolean;
  autocomplete?: string;
  min?: number;
  max?: number;
  step?: number;
  formAction?: string;
  formMethod?: FormMethod;
  formProvider?: FormProvider;
  formSuccessMessage?: string;
  formHoneypot?: string;
  items?: InteractiveItem[];
  table?: TableModel;
  slides?: CarouselSlide[];
  links?: SocialLink[];
  componentName?: string;
  componentId?: string;
  /** Legacy Phase 3 linked-symbol key; retained for project compatibility. */
  symbolSyncKey?: string;
  /** Sandboxed custom HTML source. */
  html?: string;
  /** Legacy list/table/modal/carousel properties retained for migrated projects. */
  listStyle?: ListStyle;
  tableStriped?: boolean;
  tableCompact?: boolean;
  modalCloseOnBackdrop?: boolean;
  modalWidth?: string;
  carouselAutoplay?: boolean;
  carouselInterval?: number;
  carouselShowDots?: boolean;
  carouselShowArrows?: boolean;
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  closeOnBackdrop?: boolean;
  defaultIndex?: number;
  ordered?: boolean;
  ariaLabel?: string;
  titleAttr?: string;
  roleAttr?: string;
  tabIndex?: number;
  animation?: AnimationName;
  hoverAnimation?: HoverAnimation;
  animationDuration?: number;
  animationDelay?: number;
  motionTrigger?: MotionTrigger;
  motionRepeat?: boolean;
  motionThreshold?: number;
  motionEasing?: string;
  transitionDuration?: number;
  transitionEasing?: string;
  parallax?: number;
  sticky?: boolean;
  stickyTop?: string;
  stickyZIndex?: number;
  timelineStagger?: number;
  timelineOrder?: TimelineOrder;
  style: NodeStyle;
  responsive?: NodeResponsiveStyle;
  hiddenOn?: Partial<Record<Viewport, boolean>>;
  children?: BuilderNode[];
  meta?: Record<string, string | number | boolean>;
}

export interface ImportedBlock {
  id: string;
  name: string;
  group: string;
  node: BuilderNode;
  createdAt: string;
  updatedAt: string;
  sourceKind: "prompt-code" | "catalog";
  /** Original prompt/code retained so the block can be re-converted later. */
  source?: string;
  dependencies?: string[];
  detectedKind?: string;
  artifactType?: PromptArtifactType;
  animated?: boolean;
  revision?: number;
  sourceHash?: string;
  thumbnail?: string;
}

export interface SavedComponent {
  id: string;
  name: string;
  node: BuilderNode;
  createdAt: string;
  updatedAt: string;
}

export interface BuilderPage {
  id: string;
  name: string;
  path: string;
  nodes: BuilderNode[];
  showNavbar: boolean;
  showFooter: boolean;
  seo?: PageSeo;
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
  components: SavedComponent[];
  importedBlocks: ImportedBlock[];
  theme: ProjectTheme;
  savedThemes: ProjectTheme[];
  favoriteLibraryIds: string[];
  designSystem: DesignSystem;
  motionSystem: MotionSystem;
  seo: SeoSettings;
  createdAt: string;
  updatedAt: string;
  schemaVersion: 9;
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
  tags?: string[];
  sourceType?: "native" | "prompt" | "project";
  create?: () => BuilderNode;
  createPageNodes?: () => BuilderNode[];
}

export interface SiteTemplatePayload {
  pages: BuilderPage[];
  globalNavbar: BuilderNode;
  globalFooter: BuilderNode;
  theme: ProjectTheme;
}

export interface SiteTemplateDefinition {
  id: string;
  name: string;
  group: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  pageCount: number;
  build: () => SiteTemplatePayload;
}

export interface ExportDependencyManifest {
  generatedBy: "Nila Webs";
  schemaVersion: 1;
  projectId: string;
  usedSourceIds: string[];
  sourceDependencies: string[];
  runtimeDependencies: string[];
  usedComponentIds: string[];
  usedAssetIds: string[];
}
