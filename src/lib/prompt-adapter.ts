import type { BuilderNode, ImportedBlock, NodeStyle, ProjectTheme, PromptArtifactType } from "../types";
import { createNode, defaultStyle, uid } from "./nodes";
import type { PromptCatalogItem } from "../templates/prompt-catalog";
import { defaultTheme } from "../templates/themes";

const S = (style: Partial<NodeStyle>): NodeStyle => ({ ...defaultStyle(), ...style });
const human = (value: string) => value.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
const unique = <T,>(list: T[]) => Array.from(new Set(list));
const MAX_SOURCE = 250_000;

export interface PromptAnalysis {
  kind: string;
  artifactType: PromptArtifactType;
  texts: string[];
  media: string[];
  dependencies: string[];
  animated: boolean;
  hasClientDirective: boolean;
  theme?: ProjectTheme;
}

const noiseText = /^(use client|use server|motion\/react|framer-motion|react|next\/image|next\/link|lucide-react|className|children|props|cn|variant|default)$/i;
const componentKinds = new Set(["accordion","alert","animated-list","animated-text","dock","autocomplete","avatar"]);
const formKinds = new Set(["contact","newsletter","waitlist","login","register","mfa","verify-email"]);
const gridKinds = new Set(["pricing","portfolio","feature","about","team","testimonial","services","blog","bento","timeline","logos"]);

function cleanTexts(values: string[]) {
  return unique(values.map(v => v.trim()).filter(v => v.length >= 3 && !noiseText.test(v) && !/^@\//.test(v) && !/^(https?:|\.\/|\.\.\/)/.test(v) && !/(^|\s)(flex|grid|px-\d|py-\d|bg-|text-|rounded-|border-|items-|justify-|hover:|dark:|sm:|md:|lg:|xl:)/.test(v))).slice(0, 32);
}

function quotedStrings(source: string): string[] {
  const found = [...source.matchAll(/(["'`])([^\n\\]{3,260}?)\1/g)].map(m => m[2].trim());
  const jsxText = [...source.matchAll(/>([^<>{}\n][^<>{}]{2,180})</g)].map(m => m[1].trim());
  return cleanTexts([...found, ...jsxText]);
}

function mediaUrls(source: string): string[] {
  return unique([...source.matchAll(/https?:\/\/[^\s"'<>)}]+/g)].map(m => m[0].replace(/[.,;]+$/, "")).filter(u => /\.(png|jpe?g|webp|gif|svg|avif|mp4|webm|mov)(\?|$)|images\.|video|unsplash/i.test(u))).slice(0, 18);
}

function dependencies(source: string): string[] {
  const imports = [...source.matchAll(/(?:from\s+|import\s*\(|require\s*\()\s*["']([^"']+)["']/g)].map(m => m[1]);
  return unique(imports.filter(Boolean)).slice(0, 32);
}

function detectKind(source: string, requestedName = "") {
  const lower = `${requestedName}\n${source}`.toLowerCase();
  const named: Array<[RegExp,string]> = [
    [/pricing/,"pricing"],[/portfolio/,"portfolio"],[/\bfeature/,"feature"],[/\babout/,"about"],[/\bteam/,"team"],
    [/(nav\s*bar|navbar|navigation)/,"navbar"],[/testimonial|review/,"testimonial"],[/service/,"services"],[/\bcta\b|call.to.action/,"cta"],
    [/contact/,"contact"],[/faq|accordion/,"accordion"],[/blog|article/,"blog"],[/footer/,"footer"],[/newsletter/,"newsletter"],
    [/logo\s*cloud|trusted by|partners/,"logos"],[/gallery/,"gallery"],[/bento/,"bento"],[/biolink|link in bio/,"biolink"],[/download|app store|play store/,"download"],
    [/waitlist/,"waitlist"],[/\blogin\b|sign[ -]?in/,"login"],[/register|sign[ -]?up/,"register"],[/multi.?factor|\bmfa\b|two.?factor/,"mfa"],
    [/verify\s*email|email verification/,"verify-email"],[/time[ -]?line|roadmap|process/,"timeline"],[/cookie\s*consent/,"cookie"],[/autocomplete|combobox/,"autocomplete"],
    [/avatar/,"avatar"],[/alert|notification|toast/,"alert"],[/apple\s*dock|\bdock\b/,"dock"],[/animated.*text|text.*animated|typewriter|word rotate/,"animated-text"],
    [/animated.*list|list.*animated|marquee list/,"animated-list"]
  ];
  return named.find(([re]) => re.test(lower))?.[1] || "section";
}

function cssValue(source: string, names: string[]) {
  for (const name of names) {
    const rx = new RegExp(`--${name}\\s*:\\s*([^;}{]+)`, "i");
    const match = source.match(rx);
    if (match?.[1]) return normalizeThemeColor(match[1].trim());
  }
}

function normalizeThemeColor(value: string) {
  if (/^#[0-9a-f]{3,8}$/i.test(value)) return value;
  const hsl = value.match(/^hsl\(([^)]+)\)$/i);
  if (hsl) return `hsl(${hsl[1]})`;
  const rgb = value.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) return `${value}`;
  if (/^[a-z]+$/i.test(value)) return value;
  return undefined;
}

function themeSignals(source: string) {
  return /:root\s*\{|--(?:background|foreground|primary|secondary|muted|card|border)|tailwind\.config|theme\s*:\s*\{|createTheme\(/i.test(source);
}

export function themeFromPromptSource(source: string, requestedName = "Imported Theme"): ProjectTheme | undefined {
  if (!themeSignals(source)) return undefined;
  const hexes = unique([...source.matchAll(/#[0-9a-f]{6}\b/gi)].map(m => m[0]));
  const colors = {
    ...defaultTheme.colors,
    background: cssValue(source,["background","background-color","page"]) || hexes[0] || defaultTheme.colors.background,
    surface: cssValue(source,["card","surface","popover"]) || hexes[1] || defaultTheme.colors.surface,
    surfaceAlt: cssValue(source,["muted","accent","surface-alt"]) || hexes[2] || defaultTheme.colors.surfaceAlt,
    text: cssValue(source,["foreground","text"]) || defaultTheme.colors.text,
    muted: cssValue(source,["muted-foreground","muted-text"]) || defaultTheme.colors.muted,
    primary: cssValue(source,["primary"]) || hexes[3] || defaultTheme.colors.primary,
    primaryText: cssValue(source,["primary-foreground"]) || defaultTheme.colors.primaryText,
    secondary: cssValue(source,["secondary"]) || hexes[4] || defaultTheme.colors.secondary,
    border: cssValue(source,["border","input"]) || defaultTheme.colors.border,
    success: cssValue(source,["success"]) || defaultTheme.colors.success,
    warning: cssValue(source,["warning"]) || defaultTheme.colors.warning,
    danger: cssValue(source,["destructive","danger"]) || defaultTheme.colors.danger
  };
  const radius = source.match(/--radius\s*:\s*([^;}{]+)/i)?.[1]?.trim() || source.match(/borderRadius\s*:\s*["']([^"']+)/i)?.[1] || defaultTheme.radius;
  const fonts = [...source.matchAll(/font-family\s*:\s*([^;}{]+)/gi)].map(m => m[1].trim().replace(/["']/g,""));
  return {
    id: `prompt-theme-${hashSource(source)}`,
    name: requestedName.trim() || "Imported Theme",
    source: "prompt",
    colors,
    typography: { body: fonts[0] || defaultTheme.typography.body, heading: fonts[1] || fonts[0] || defaultTheme.typography.heading },
    radius,
    shadow: defaultTheme.shadow
  };
}

function detectArtifactType(source: string, kind: string): PromptArtifactType {
  if (themeSignals(source) && !/(return\s*\(|<[A-Z]|<section|<div)/.test(source)) return "theme";
  if (componentKinds.has(kind) || /export\s+(?:default\s+)?function\s+(?:Button|Card|Badge|Avatar|Alert|Accordion|Input|Dialog|Tabs|Tooltip)/i.test(source)) return "component";
  return "section";
}

export function analyzePromptSource(source: string, requestedName = ""): PromptAnalysis {
  const kind = detectKind(source, requestedName);
  return {
    kind,
    artifactType: detectArtifactType(source, kind),
    texts: quotedStrings(source),
    media: mediaUrls(source),
    dependencies: dependencies(source),
    animated: /(motion\/react|framer-motion|motion\.|animate-|transition-|keyframes|spring\(|useSpring|useMotionValue)/i.test(source),
    hasClientDirective: /["']use client["']/.test(source),
    theme: themeFromPromptSource(source, requestedName)
  };
}

function metaFor(item: PromptCatalogItem, deps: string[] = [], kind?: string) {
  return {
    sourceId: item.id,
    sourceType: "user-provided-prompt",
    promptAdapter: true,
    animated: item.animated,
    kind: kind || item.kind,
    dependencies: deps.join(" | ").slice(0, 900)
  };
}

function heading(content: string, size = "48px", align: NodeStyle["textAlign"] = "left") {
  return createNode("heading", { content, animation: "fade-up", style: S({ fontSize: size, fontWeight: "750", lineHeight: "1.06", letterSpacing: "-1.5px", color: "var(--nw-text)", textAlign: align }) });
}
function body(content: string, align: NodeStyle["textAlign"] = "left") {
  return createNode("text", { content, animation: "fade-up", style: S({ color: "var(--nw-muted)", fontSize: "17px", lineHeight: "1.65", textAlign: align }) });
}
function button(content: string, href = "#", secondary = false) {
  return createNode("button", { content, href, hoverAnimation: "lift", style: S({ width: "fit-content", padding: "12px 20px", borderRadius: "999px", background: secondary ? "var(--nw-surface-alt)" : "var(--nw-primary)", color: secondary ? "var(--nw-text)" : "var(--nw-primary-text)", borderWidth: secondary ? "1px" : "0px", borderColor: "var(--nw-border)", fontWeight: "700" }) });
}
function badge(content: string) {
  return createNode("badge", { content, style: S({ width: "fit-content", padding: "6px 11px", background: "var(--nw-surface-alt)", color: "var(--nw-primary)", borderRadius: "999px", fontWeight: "700", fontSize: "13px" }) });
}
function mediaNode(url: string, index: number, height = "320px"): BuilderNode {
  const video = /\.(mp4|webm|mov)(\?|$)/i.test(url) || /video/i.test(url);
  return createNode(video ? "video" : "image", { src: url, alt: `Imported media ${index + 1}`, animation: "zoom-in", style: S({ width: "100%", height: video ? "420px" : height, borderRadius: "var(--nw-radius)", overflow: "hidden" }) });
}
function card(name: string, children: BuilderNode[], index = 0, style: Partial<NodeStyle> = {}) {
  return createNode("card", { name, animation: index % 2 ? "fade-up" : "zoom-in", animationDelay: Math.min(index * .06, .35), hoverAnimation: "lift", style: S({ padding: "24px", background: "var(--nw-surface)", color: "var(--nw-text)", borderWidth: "1px", borderColor: "var(--nw-border)", borderRadius: "var(--nw-radius)", boxShadow: "var(--nw-shadow)", display: "flex", flexDirection: "column", gap: "14px", ...style }), children });
}
function container(name: string, children: BuilderNode[], style: Partial<NodeStyle> = {}, responsive?: BuilderNode["responsive"]) {
  return createNode("container", { name, children, style: S({ width: "100%", borderWidth: "0px", display: "flex", flexDirection: "column", gap: "16px", ...style }), responsive });
}
function sectionShell(item: PromptCatalogItem, children: BuilderNode[], kind: string, deps: string[] = [], style: Partial<NodeStyle> = {}) {
  return createNode("section", {
    name: item.name,
    animation: item.animated ? "fade-in" : "none",
    style: S({ width: "100%", minHeight: "260px", padding: "80px 42px", background: "var(--nw-background)", color: "var(--nw-text)", display: "flex", flexDirection: "column", gap: "30px", ...style }),
    responsive: { tablet: { padding: "68px 30px" }, mobile: { padding: "52px 20px" } },
    children,
    meta: metaFor(item, deps, kind)
  });
}
function headerBlock(item: PromptCatalogItem, texts: string[], align: NodeStyle["textAlign"] = "center") {
  return container(`${item.name} heading`, [badge(human(item.name)), heading(texts[0] || human(item.name), "48px", align), body(texts[1] || `Editable ${human(item.name)} converted from your supplied prompt/code.`, align)], { maxWidth: "860px", margin: align === "center" ? "0 auto" : "0", gap: "16px", textAlign: align, alignItems: align === "center" ? "center" : "flex-start" });
}
function grid(name: string, children: BuilderNode[], cols = 3) {
  return container(name, children, { maxWidth: "1180px", margin: "0 auto", display: "grid", gridColumns: `repeat(${cols},minmax(0,1fr))`, gap: "18px" }, { tablet: { gridColumns: "repeat(2,minmax(0,1fr))" }, mobile: { gridColumns: "1fr" } });
}
function split(name: string, left: BuilderNode[], right: BuilderNode[]) {
  return container(name, [container(`${name} copy`, left, { borderWidth: "0px", padding: "0px", gap: "18px" }), container(`${name} visual`, right, { borderWidth: "0px", padding: "0px", gap: "14px" })], { maxWidth: "1180px", margin: "0 auto", display: "grid", gridColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "42px", alignItems: "center" }, { mobile: { gridColumns: "1fr" } });
}
function safeTexts(item: PromptCatalogItem) { return cleanTexts(item.texts); }
function fallbackMedia(item: PromptCatalogItem, count = 3) {
  const base = [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
  ];
  return (item.media.length ? item.media : base).slice(0, count);
}

function pricingSection(item: PromptCatalogItem, texts: string[], deps: string[]) {
  const planNames = texts.slice(2,5).length ? texts.slice(2,5) : ["Starter","Pro","Scale"];
  const cards = planNames.map((name,i) => card(`${name} plan`, [heading(name,"28px"), heading(i === 1 ? "$49/mo" : i === 2 ? "$99/mo" : "$19/mo","34px"), body(texts[5+i] || "Everything you need to launch and grow."), createNode("list", { options: [texts[8+i] || "Responsive sections", "Editable components", "Production export"], style: S({ width:"100%", padding:"0 0 0 20px", display:"flex", flexDirection:"column", gap:"8px", color:"var(--nw-muted)" }) }), button(i===1?"Start Pro":"Choose plan")], i, i===1?{borderWidth:"2px",borderColor:"var(--nw-primary)"}:{}));
  return sectionShell(item,[headerBlock(item,texts),grid(`${item.name} plans`,cards,3)],"pricing",deps);
}
function portfolioSection(item: PromptCatalogItem, texts: string[], deps: string[]) {
  const media=fallbackMedia(item,4); const projects=(media.length?media:[""]).map((url,i)=>card(`${item.name} project ${i+1}`,[...(url?[mediaNode(url,i,"300px")]:[]),badge(texts[2+i]||["Product Design","Brand Identity","UX Research","Interface Design"][i]||"Project"),heading(texts[6+i]||`Selected project ${i+1}`,"26px"),body(texts[10+i]||"Case study, process and outcome are fully editable.")],i));
  return sectionShell(item,[headerBlock(item,texts),grid(`${item.name} projects`,projects,2)],"portfolio",deps);
}
function featureSection(item: PromptCatalogItem, texts: string[], deps: string[], kind="feature") {
  const labels=texts.slice(2,8).length?texts.slice(2,8):["Fast workflow","Responsive system","Reusable components","Theme tokens","Animations","Production export"];
  const cards=labels.map((label,i)=>card(`${item.name} ${i+1}`,[createNode("icon",{content:["✦","⌁","◫","◉","↗","✓"][i%6],style:S({fontSize:"26px",color:"var(--nw-primary)",width:"fit-content"})}),heading(label,"24px"),body(texts[8+i]||"Customize this item in the Properties panel.")],i,{minHeight:i===0?"220px":"190px"}));
  return sectionShell(item,[headerBlock(item,texts),grid(`${item.name} feature grid`,cards,kind==="bento"?4:3)],kind,deps);
}
function aboutSection(item: PromptCatalogItem, texts: string[], deps: string[]) {
  const stats=(texts.slice(2,5).length?texts.slice(2,5):["120+ Projects","8 Years","24 Awards"]).map((t,i)=>card(`Stat ${i+1}`,[heading(t,"32px"),body(["Completed work","Experience","Recognition"][i])],i,{boxShadow:"none"}));
  const visual=fallbackMedia(item,1)[0];
  return sectionShell(item,[split(`${item.name} split`,[badge("About"),heading(texts[0]||"Designing useful digital experiences"),body(texts[1]||"Tell your story with a flexible responsive section."),container("About stats",stats,{display:"grid",gridColumns:"repeat(3,minmax(0,1fr))",gap:"10px"},{mobile:{gridColumns:"1fr"}})],visual?[mediaNode(visual,0,"460px")]:[featureSection(item,texts,deps).children?.[1] || body("Add media here")])],"about",deps);
}
function teamSection(item: PromptCatalogItem, texts: string[], deps: string[]) {
  const media=fallbackMedia(item,4); const names=texts.filter(t=>/\s/.test(t)).slice(2,6); const cards=media.slice(0,4).map((url,i)=>card(`Team member ${i+1}`,[mediaNode(url,i,"260px"),heading(names[i]||["Alex Morgan","Maya Chen","Noah James","Sara Khan"][i],"24px"),body(texts[6+i]||["Product Designer","Frontend Developer","Brand Strategist","Research Lead"][i])],i));
  return sectionShell(item,[headerBlock(item,texts),grid(`${item.name} team`,cards,4)],"team",deps);
}
function testimonialSection(item: PromptCatalogItem,texts:string[],deps:string[]){
  const quotes=texts.slice(2,8).length?texts.slice(2,8):["The workflow became dramatically faster.","We shipped with a consistent design system.","Exported code was easy to continue developing."];
  return sectionShell(item,[headerBlock(item,texts),grid(`${item.name} testimonials`,quotes.slice(0,6).map((q,i)=>card(`Testimonial ${i+1}`,[createNode("icon",{content:"“",style:S({fontSize:"42px",color:"var(--nw-primary)",width:"fit-content"})}),body(q),heading(["Ava, Founder","Liam, Product Lead","Maya, Designer"][i%3],"18px")],i)),3)],"testimonial",deps);
}
function ctaSection(item:PromptCatalogItem,texts:string[],deps:string[]){return sectionShell(item,[container(`${item.name} card`,[badge("Ready when you are"),heading(texts[0]||"Build your next website visually","54px","center"),body(texts[1]||"Start from a block, a prompt, or a complete multi-page template.","center"),container("CTA actions",[button(texts[2]||"Get started"),button(texts[3]||"Learn more","#",true)],{width:"fit-content",display:"flex",flexDirection:"row",gap:"10px",borderWidth:"0px",padding:"0px"})],{maxWidth:"980px",margin:"0 auto",padding:"56px",alignItems:"center",textAlign:"center",background:"var(--nw-surface)",borderWidth:"1px",borderColor:"var(--nw-border)",borderRadius:"var(--nw-radius)",boxShadow:"var(--nw-shadow)"})],"cta",deps,{padding:"64px 30px"});}
function formSection(item: PromptCatalogItem, texts: string[], kind: string, deps: string[]) {
  const fields: BuilderNode[] = [];
  if (["register","contact"].includes(kind)) fields.push(createNode("input", { name: "Name", placeholder: "Your name", nameAttr: "name", required: true }));
  if (kind !== "mfa") fields.push(createNode("input", { name: "Email", inputType: "email", placeholder: "you@example.com", nameAttr: "email", required: true }));
  if (["login","register"].includes(kind)) fields.push(createNode("input", { name: "Password", inputType: "password", placeholder: "Password", nameAttr: "password", required: true }));
  if (["mfa","verify-email"].includes(kind)) fields.push(createNode("input", { name: "Verification code", inputType: "text", placeholder: "000000", nameAttr: "code", required: true, maxLength: 8 }));
  if (kind === "contact") fields.push(createNode("textarea", { name: "Message", placeholder: "Tell us how we can help", nameAttr: "message", required: true }));
  fields.push(button(texts[2] || (["login","register","mfa","verify-email"].includes(kind) ? "Continue" : kind === "contact" ? "Send message" : "Join now")));
  const form=createNode("form", { name: `${item.name} form`, style: S({ width: "100%", maxWidth: "620px", margin: "0 auto", padding: "28px", display: "flex", flexDirection: "column", gap: "14px", background: "var(--nw-surface)", borderWidth: "1px", borderColor: "var(--nw-border)", borderRadius: "var(--nw-radius)", boxShadow: "var(--nw-shadow)" }), children: fields });
  return sectionShell(item, [headerBlock(item, texts), form], kind, deps);
}
function faqSection(item:PromptCatalogItem,texts:string[],deps:string[]){const qs=texts.length?texts:["What is included?","Can I customize every block?","Does the export need Nila Webs?","Are animations exported?"];return sectionShell(item,[headerBlock(item,texts),createNode("accordion",{name:`${item.name} questions`,defaultIndex:0,items:qs.slice(1,9).map((q,i)=>({title:q,body:texts[9+i]||"Edit this answer from the Properties panel."})),animation:"fade-up",style:S({width:"100%",maxWidth:"860px",margin:"0 auto",background:"var(--nw-surface)",borderWidth:"1px",borderColor:"var(--nw-border)",borderRadius:"var(--nw-radius)",overflow:"hidden"})})],"accordion",deps);}
function blogSection(item:PromptCatalogItem,texts:string[],deps:string[]){const media=fallbackMedia(item,3);const posts=[0,1,2].map((_,i)=>card(`Article ${i+1}`,[mediaNode(media[i%media.length],i,"220px"),badge(texts[2+i]||"Insights"),heading(texts[5+i]||`Article title ${i+1}`,"24px"),body(texts[8+i]||"Add a short article summary and link to the full post."),createNode("link",{content:"Read article →",href:"#",style:S({color:"var(--nw-primary)",fontWeight:"700",width:"fit-content"})})],i));return sectionShell(item,[headerBlock(item,texts),grid(`${item.name} articles`,posts,3)],"blog",deps);}
function logoSection(item:PromptCatalogItem,texts:string[],deps:string[]){const labels=(texts.slice(2,10).length?texts.slice(2,10):["ACME","NORTH","ORBIT","LUMA","VERTEX","NOVA"]);return sectionShell(item,[headerBlock(item,texts),container(`${item.name} logos`,labels.slice(0,8).map((t,i)=>createNode("badge",{content:t,animation:"fade-in",animationDelay:i*.04,style:S({padding:"12px 18px",background:"var(--nw-surface)",color:"var(--nw-muted)",borderWidth:"1px",borderColor:"var(--nw-border)",borderRadius:"12px",fontWeight:"800",letterSpacing:"1px"})})),{maxWidth:"1100px",margin:"0 auto",display:"flex",flexDirection:"row",justifyContent:"center",gap:"12px",borderWidth:"0px",padding:"0px"})],"logos",deps,{padding:"58px 30px"});}
function gallerySection(item:PromptCatalogItem,texts:string[],deps:string[]){const media=fallbackMedia(item,6);return sectionShell(item,[headerBlock(item,texts),container(`${item.name} gallery`,media.map((url,i)=>mediaNode(url,i,i%3===0?"380px":"280px")),{maxWidth:"1180px",margin:"0 auto",display:"grid",gridColumns:"repeat(3,minmax(0,1fr))",gap:"14px",borderWidth:"0px",padding:"0px"},{tablet:{gridColumns:"repeat(2,minmax(0,1fr))"},mobile:{gridColumns:"1fr"}})],"gallery",deps);}
function biolinkSection(item:PromptCatalogItem,texts:string[],deps:string[]){const avatar=fallbackMedia(item,1)[0];const links=(texts.slice(2,8).length?texts.slice(2,8):["My portfolio","Latest project","Newsletter","Instagram"]);return sectionShell(item,[container(`${item.name} profile`,[createNode("avatar",{src:avatar,alt:"Profile",content:"NW",style:S({width:"92px",height:"92px",borderRadius:"999px",overflow:"hidden",background:"var(--nw-surface-alt)"})}),heading(texts[0]||"Your Name","34px","center"),body(texts[1]||"Designer, developer and maker.","center"),...links.slice(0,6).map((l,i)=>createNode("button",{content:l,href:"#",hoverAnimation:"scale",animation:"fade-up",animationDelay:i*.05,style:S({width:"100%",padding:"14px 18px",borderRadius:"14px",background:"var(--nw-surface)",color:"var(--nw-text)",borderWidth:"1px",borderColor:"var(--nw-border)",fontWeight:"650",textAlign:"center"})}))],{maxWidth:"520px",margin:"0 auto",padding:"30px",alignItems:"center",background:"var(--nw-surface-alt)",borderWidth:"1px",borderColor:"var(--nw-border)",borderRadius:"var(--nw-radius)",boxShadow:"var(--nw-shadow)"})],"biolink",deps);}
function downloadSection(item:PromptCatalogItem,texts:string[],deps:string[]){const visual=fallbackMedia(item,1)[0];return sectionShell(item,[split(`${item.name} split`,[badge("Download"),heading(texts[0]||"Take the experience with you"),body(texts[1]||"Promote your desktop or mobile app with direct download actions."),container("Download buttons",[button(texts[2]||"Download for Windows"),button(texts[3]||"View releases","#",true)],{display:"flex",flexDirection:"row",gap:"10px",borderWidth:"0px",padding:"0px"})],[mediaNode(visual,0,"420px")])],"download",deps);}
function timelineSection(item:PromptCatalogItem,texts:string[],deps:string[]){const steps=(texts.slice(2,8).length?texts.slice(2,8):["Discover","Design","Build","Launch"]);return sectionShell(item,[headerBlock(item,texts),container(`${item.name} timeline`,steps.slice(0,6).map((t,i)=>container(`Step ${i+1}`,[badge(String(i+1).padStart(2,"0")),heading(t,"24px"),body(texts[8+i]||"Describe this milestone, stage or event.")],{padding:"20px",background:"var(--nw-surface)",borderWidth:"1px",borderColor:"var(--nw-border)",borderRadius:"var(--nw-radius)",display:"grid",gridColumns:"64px minmax(0,1fr)",gap:"16px"},{mobile:{gridColumns:"1fr"}})),{maxWidth:"900px",margin:"0 auto",gap:"12px",borderWidth:"0px",padding:"0px"})],"timeline",deps);}
function cookieSection(item:PromptCatalogItem,texts:string[],deps:string[]){return sectionShell(item,[container(`${item.name} consent`,[heading(texts[0]||"We use cookies","22px"),body(texts[1]||"We use cookies to improve your experience. Choose how you want to continue."),container("Cookie actions",[button(texts[2]||"Accept all"),button(texts[3]||"Only necessary","#",true)],{display:"flex",flexDirection:"row",gap:"8px",borderWidth:"0px",padding:"0px"})],{maxWidth:"620px",margin:"0 auto",padding:"24px",background:"var(--nw-surface)",borderWidth:"1px",borderColor:"var(--nw-border)",borderRadius:"var(--nw-radius)",boxShadow:"var(--nw-shadow)"})],"cookie",deps,{padding:"42px 24px"});}

function componentFromCatalog(item: PromptCatalogItem, deps: string[] = []): BuilderNode | null {
  const texts = safeTexts(item); const label=texts[0]||item.name; const meta=metaFor(item,deps,item.kind);
  if(item.kind==="accordion") return createNode("accordion",{name:item.name,items:(texts.length?texts:["What is included?","How does it work?","Can I customize it?"]).slice(0,6).map((title,i)=>({title,body:texts[i+1]||"Edit this accordion content in the Properties panel."})),animation:"fade-up",style:S({width:"100%",maxWidth:"820px",margin:"0 auto",background:"var(--nw-surface)",color:"var(--nw-text)",borderWidth:"1px",borderColor:"var(--nw-border)",borderRadius:"var(--nw-radius)"}),meta});
  if(item.kind==="alert") return createNode("alert",{name:item.name,content:label,animation:"fade-in",style:S({padding:"14px 16px",borderWidth:"1px",borderRadius:"var(--nw-radius)",background:"var(--nw-surface)",color:"var(--nw-text)"}),meta:{...meta,variant:/success|7/i.test(item.name)?"success":/warning|5/i.test(item.name)?"warning":/danger|6/i.test(item.name)?"danger":"info"}});
  if(item.kind==="animated-text") return createNode("heading",{name:item.name,content:label,animation:/4|8|12/.test(item.name)?"pulse":"fade-up",hoverAnimation:"scale",style:S({fontSize:"56px",fontWeight:"750",color:"var(--nw-text)",textAlign:"center",letterSpacing:"-2px"}),meta});
  if(item.kind==="animated-list") return container(item.name,(texts.length?texts:["First activity","Second activity","Third activity"]).slice(0,6).map((t,i)=>card(`${item.name} ${i+1}`,[body(t)],i,{padding:"14px 16px",boxShadow:"none"})),{maxWidth:"680px",margin:"0 auto",gap:"10px",borderWidth:"0px",padding:"0px"});
  if(item.kind==="dock") return container(item.name,["⌂","✦","◫","✉","⚙"].map(icon=>createNode("button",{content:icon,hoverAnimation:"scale",style:S({width:"46px",height:"46px",borderRadius:"14px",background:"var(--nw-surface-alt)",color:"var(--nw-text)",textAlign:"center"})})),{width:"fit-content",margin:"0 auto",padding:"8px",background:"var(--nw-surface)",borderWidth:"1px",borderColor:"var(--nw-border)",borderRadius:"24px",display:"flex",flexDirection:"row",gap:"6px",boxShadow:"var(--nw-shadow)"});
  if(item.kind==="autocomplete") return createNode("form",{name:item.name,style:S({width:"100%",maxWidth:"520px",margin:"0 auto",padding:"20px",display:"flex",flexDirection:"column",gap:"10px",background:"var(--nw-surface)",borderWidth:"1px",borderColor:"var(--nw-border)",borderRadius:"var(--nw-radius)"}),children:[createNode("label",{content:label||"Search"}),createNode("input",{name:"Autocomplete input",inputType:"search",placeholder:"Start typing…",options:texts.slice(0,7),autocomplete:"off",style:S({width:"100%",padding:"12px 14px",borderWidth:"1px",borderColor:"var(--nw-border)",borderRadius:"12px",background:"var(--nw-background)",color:"var(--nw-text)"})})],meta});
  if(item.kind==="avatar") return createNode("avatar",{name:item.name,src:item.media[0],alt:label,content:(label||"NW").slice(0,2).toUpperCase(),style:S({width:/7|6/.test(item.name)?"96px":"72px",height:/7|6/.test(item.name)?"96px":"72px",borderRadius:"999px",overflow:"hidden",background:"var(--nw-surface-alt)",color:"var(--nw-text)"}),meta});
  return null;
}

export function catalogItemToNode(item: PromptCatalogItem, deps: string[] = []): BuilderNode {
  const component=componentFromCatalog(item,deps); if(component){component.meta={...(component.meta||{}),...metaFor(item,deps,item.kind)};return component;}
  const texts=safeTexts(item); const kind=!item.kind||item.kind==="section"?detectKind("",item.name):item.kind;
  if(formKinds.has(kind)) return formSection(item,texts,kind,deps);
  if(kind==="navbar") return createNode("navbar",{name:item.name,animation:item.animated?"fade-in":"none",style:S({width:"100%",padding:"16px 32px",background:"var(--nw-background)",color:"var(--nw-text)",display:"flex",flexDirection:"row",justifyContent:"space-between",alignItems:"center",gap:"16px",borderWidth:"1px",borderColor:"var(--nw-border)"}),responsive:{mobile:{padding:"12px 16px"}},children:[heading(texts[0]||"Brand","22px"),container("Nav links",(texts.slice(1,6).length?texts.slice(1,6):["Home","About","Work","Contact"]).map(t=>createNode("link",{content:t,href:"#",style:S({color:"var(--nw-text)",width:"fit-content",fontWeight:"600"})})),{width:"auto",display:"flex",flexDirection:"row",gap:"18px",alignItems:"center",borderWidth:"0px",padding:"0px"})],meta:metaFor(item,deps,kind)});
  if(kind==="footer") return createNode("footer",{name:item.name,style:S({width:"100%",padding:"56px 34px",background:"var(--nw-surface)",color:"var(--nw-text)",display:"grid",gridColumns:"2fr 1fr 1fr",gap:"28px",borderWidth:"1px",borderColor:"var(--nw-border)"}),responsive:{mobile:{gridColumns:"1fr"}},children:[container("Footer brand",[heading(texts[0]||"Build something remarkable","28px"),body(texts[1]||"A flexible footer generated from your source.")],{borderWidth:"0px",padding:"0px"}),...texts.slice(2,8).map(t=>createNode("link",{content:t,href:"#",style:S({color:"var(--nw-muted)",width:"fit-content"})}))],meta:metaFor(item,deps,kind)});
  if(kind==="pricing") return pricingSection(item,texts,deps);
  if(kind==="portfolio") return portfolioSection(item,texts,deps);
  if(kind==="feature"||kind==="services"||kind==="bento") return featureSection(item,texts,deps,kind);
  if(kind==="about") return aboutSection(item,texts,deps);
  if(kind==="team") return teamSection(item,texts,deps);
  if(kind==="testimonial") return testimonialSection(item,texts,deps);
  if(kind==="cta") return ctaSection(item,texts,deps);
  if(kind==="accordion") return faqSection(item,texts,deps);
  if(kind==="blog") return blogSection(item,texts,deps);
  if(kind==="logos") return logoSection(item,texts,deps);
  if(kind==="gallery") return gallerySection(item,texts,deps);
  if(kind==="biolink") return biolinkSection(item,texts,deps);
  if(kind==="download") return downloadSection(item,texts,deps);
  if(kind==="timeline") return timelineSection(item,texts,deps);
  if(kind==="cookie") return cookieSection(item,texts,deps);
  const children:BuilderNode[]=[headerBlock(item,texts,"left")];
  if(gridKinds.has(kind)) children.push(featureSection(item,texts,deps,kind).children?.[1]||body("Editable content"));
  else children.push(container(`${item.name} content`,[...texts.slice(2,7).map(t=>body(t)),button(texts[7]||"Get started")],{maxWidth:"980px",margin:"0 auto",borderWidth:"0px",padding:"0px"}));
  if(item.media.length) children.push(container(`${item.name} media`,item.media.slice(0,6).map((url, index) => mediaNode(url, index)),{maxWidth:"1180px",margin:"0 auto",display:"grid",gridColumns:item.media.length>1?"repeat(2,minmax(0,1fr))":"1fr",gap:"16px",borderWidth:"0px",padding:"0px"},{mobile:{gridColumns:"1fr"}}));
  return sectionShell(item,children,kind,deps);
}

export function promptToNode(source: string, requestedName = "Imported Prompt Block"): BuilderNode {
  const analysis=analyzePromptSource(source,requestedName);
  if(analysis.artifactType==="theme") return sectionShell({id:`theme-preview-${uid("block")}`,name:requestedName||"Theme Preview",group:"Imported",kind:"section",texts:analysis.texts,media:analysis.media,animated:analysis.animated,sourceLine:0},[headerBlock({id:"theme",name:requestedName||"Theme Preview",group:"Imported",kind:"section",texts:[],media:[],animated:false,sourceLine:0},["Theme detected","Apply this theme from the import panel."])],"theme",analysis.dependencies);
  const item:PromptCatalogItem={id:`import-${uid("block")}`,name:requestedName.trim()||"Imported Prompt Block",group:"Imported",kind:analysis.kind,texts:analysis.texts,media:analysis.media,animated:analysis.animated,sourceLine:0};
  const node=catalogItemToNode(item,analysis.dependencies);
  node.meta={...(node.meta||{}),clientComponent:analysis.hasClientDirective,dependencies:analysis.dependencies.join(" | ").slice(0,900),kind:analysis.kind,artifactType:analysis.artifactType};
  return node;
}

export function importedBlockFromPrompt(source: string, name: string, existing?: ImportedBlock): ImportedBlock {
  const analysis=analyzePromptSource(source,name); const node=promptToNode(source,name); const now=new Date().toISOString();
  return {id:existing?.id||uid("imported"),name:name.trim()||existing?.name||"Imported Block",group:existing?.group||"Imported Prompts",node,createdAt:existing?.createdAt||now,updatedAt:now,sourceKind:"prompt-code",source:source.slice(0,MAX_SOURCE),dependencies:analysis.dependencies,detectedKind:analysis.kind,artifactType:analysis.artifactType,animated:analysis.animated,revision:(existing?.revision||0)+1,sourceHash:hashSource(source),thumbnail:analysis.media[0]||existing?.thumbnail};
}

export function reconvertImportedBlock(block: ImportedBlock): ImportedBlock {
  if(!block.source) return block;
  return importedBlockFromPrompt(block.source,block.name,block);
}

export function hashSource(source: string) {
  let hash=2166136261;
  for(let i=0;i<source.length;i++){hash^=source.charCodeAt(i);hash=Math.imul(hash,16777619);}
  return (hash>>>0).toString(16).padStart(8,"0");
}
