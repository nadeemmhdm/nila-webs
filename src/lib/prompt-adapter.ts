import type { BuilderNode, ImportedBlock, NodeStyle } from "../types";
import { createNode, defaultStyle, uid } from "./nodes";
import type { PromptCatalogItem } from "../templates/prompt-catalog";

const S = (style: Partial<NodeStyle>): NodeStyle => ({ ...defaultStyle(), ...style });
const human = (value: string) => value.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
const unique = <T,>(list: T[]) => Array.from(new Set(list));

function textNode(content: string, heading = false): BuilderNode {
  return createNode(heading ? "heading" : "text", {
    content,
    animation: "fade-up",
    style: S(heading
      ? { fontSize: "48px", fontWeight: "700", lineHeight: "1.08", letterSpacing: "-1.4px", color: "var(--nw-text)" }
      : { color: "var(--nw-muted)", fontSize: "17px", lineHeight: "1.65" })
  });
}

function mediaNode(url: string, index: number): BuilderNode {
  const video = /\.(mp4|webm|mov)(\?|$)/i.test(url) || /video/i.test(url);
  return createNode(video ? "video" : "image", {
    src: url,
    alt: `Imported media ${index + 1}`,
    animation: "zoom-in",
    style: S({ width: "100%", height: video ? "420px" : "320px", borderRadius: "var(--nw-radius)", overflow: "hidden" })
  });
}

function componentFromCatalog(item: PromptCatalogItem): BuilderNode | null {
  const label = item.texts[0] || item.name;
  if (item.kind === "accordion") return createNode("accordion", {
    name: item.name,
    items: (item.texts.length ? item.texts : ["What is included?", "How does it work?", "Can I customize it?"]).slice(0, 6).map((title, i) => ({ title, body: item.texts[i + 1] || "Edit this accordion content in the Properties panel." })),
    animation: "fade-up",
    style: S({ width: "100%", maxWidth: "820px", margin: "0 auto", background: "var(--nw-surface)", color: "var(--nw-text)", borderWidth: "1px", borderColor: "var(--nw-border)", borderRadius: "var(--nw-radius)" }),
    meta: { sourceId: item.id, promptAdapter: true }
  });
  if (item.kind === "alert") return createNode("alert", { name: item.name, content: label, value: item.name.toLowerCase().includes("7") ? "success" : "info", animation: "fade-in", meta: { sourceId: item.id, promptAdapter: true } });
  if (item.kind === "animated-text") return createNode("heading", { name: item.name, content: label, animation: item.name.includes("4") ? "pulse" : "fade-up", hoverAnimation: "scale", style: S({ fontSize: "56px", fontWeight: "750", color: "var(--nw-text)", textAlign: "center", letterSpacing: "-2px" }), meta: { sourceId: item.id, promptAdapter: true } });
  if (item.kind === "animated-list") return createNode("container", { name: item.name, animation: "fade-up", style: S({ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }), children: (item.texts.length ? item.texts : ["First activity", "Second activity", "Third activity"]).slice(0, 6).map((t, i) => createNode("card", { content: t, animation: i % 2 ? "slide-left" : "slide-right", style: S({ padding: "14px 16px", background: "var(--nw-surface)", borderWidth: "1px", borderColor: "var(--nw-border)", borderRadius: "var(--nw-radius)" }), children: [textNode(t)] })), meta: { sourceId: item.id, promptAdapter: true } });
  if (item.kind === "dock") return createNode("container", { name: item.name, style: S({ width: "fit-content", margin: "0 auto", padding: "8px", background: "var(--nw-surface)", borderWidth: "1px", borderColor: "var(--nw-border)", borderRadius: "24px", display: "flex", flexDirection: "row", gap: "6px", boxShadow: "var(--nw-shadow)" }), children: ["⌂","✦","◫","✉","⚙"].map(icon => createNode("button", { content: icon, hoverAnimation: "scale", style: S({ width: "44px", height: "44px", borderRadius: "14px", background: "var(--nw-surface-alt)", color: "var(--nw-text)" }) })), meta: { sourceId: item.id, promptAdapter: true } });
  if (item.kind === "autocomplete") return createNode("form", { name: item.name, style: S({ width: "100%", maxWidth: "520px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "10px" }), children: [createNode("label", { content: label || "Search" }), createNode("input", { name: "Autocomplete input", placeholder: "Start typing…", options: item.texts.slice(0, 7), autocomplete: "off", style: S({ width: "100%", padding: "12px 14px", borderWidth: "1px", borderColor: "var(--nw-border)", borderRadius: "12px", background: "var(--nw-surface)", color: "var(--nw-text)" }) })], meta: { sourceId: item.id, promptAdapter: true } });
  if (item.kind === "avatar") return createNode("avatar", { name: item.name, src: item.media[0], content: (item.texts[0] || "NW").slice(0, 2).toUpperCase(), style: S({ width: "72px", height: "72px", borderRadius: "999px", overflow: "hidden", background: "var(--nw-surface-alt)", color: "var(--nw-text)" }), meta: { sourceId: item.id, promptAdapter: true } });
  return null;
}

export function catalogItemToNode(item: PromptCatalogItem): BuilderNode {
  const component = componentFromCatalog(item);
  if (component) return component;
  const texts = item.texts.filter(Boolean);
  const title = texts[0] || human(item.name);
  const body = texts[1] || `Editable ${human(item.name)} imported from the supplied React/Shadcn prompt catalog.`;
  const children: BuilderNode[] = [
    createNode("container", {
      name: `${item.name} copy`,
      style: S({ width: "100%", maxWidth: "1180px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "18px" }),
      children: [
        createNode("badge", { content: human(item.name), style: S({ width: "fit-content", padding: "6px 11px", background: "var(--nw-surface-alt)", color: "var(--nw-primary)", borderRadius: "999px", fontWeight: "700" }) }),
        textNode(title, true),
        textNode(body),
        ...(texts.slice(2, 5).map(t => textNode(t, false))),
        createNode("button", { content: "Get started", href: "#", hoverAnimation: "lift", style: S({ width: "fit-content", padding: "12px 20px", borderRadius: "999px", background: "var(--nw-primary)", color: "var(--nw-primary-text)", fontWeight: "700" }) })
      ]
    })
  ];
  if (item.media.length) children.push(createNode("container", { name: `${item.name} media`, style: S({ width: "100%", maxWidth: "1180px", margin: "0 auto", display: "grid", gridColumns: item.media.length > 1 ? "repeat(2,minmax(0,1fr))" : "1fr", gap: "16px" }), responsive: { mobile: { gridColumns: "1fr" } }, children: item.media.slice(0, 4).map(mediaNode) }));
  return createNode("section", {
    name: item.name,
    animation: item.animated ? "fade-in" : "none",
    style: S({ width: "100%", minHeight: "280px", padding: "80px 42px", background: "var(--nw-background)", color: "var(--nw-text)", display: "flex", flexDirection: "column", gap: "30px" }),
    responsive: { mobile: { padding: "52px 20px" } },
    children,
    meta: { sourceId: item.id, sourceType: "user-provided-prompt", promptAdapter: true, animated: item.animated }
  });
}

function quotedStrings(source: string): string[] {
  const found = [...source.matchAll(/(["'`])([^\n\\]{4,180}?)\1/g)].map(m => m[2].trim());
  return unique(found.filter(s => s && !s.startsWith(("@/")) && !/^(https?:|\.\/|\.\.\/)/.test(s) && !/(className|flex |grid |px-|py-|bg-|text-|rounded-|border-|items-|justify-|hover:|dark:)/.test(s))).slice(0, 10);
}

function mediaUrls(source: string): string[] {
  return unique([...source.matchAll(/https?:\/\/[^\s"'<>)}]+/g)].map(m => m[0].replace(/[.,;]+$/, "")).filter(u => /\.(png|jpe?g|webp|svg|mp4|webm)(\?|$)|images\.|video/i.test(u))).slice(0, 8);
}

export function promptToNode(source: string, requestedName = "Imported Prompt Block"): BuilderNode {
  const lower = `${requestedName}\n${source}`.toLowerCase();
  let kind = "section";
  if (lower.includes("accordion")) kind = "accordion";
  else if (lower.includes("autocomplete")) kind = "autocomplete";
  else if (lower.includes("avatar")) kind = "avatar";
  else if (lower.includes("alert")) kind = "alert";
  else if (lower.includes("dock")) kind = "dock";
  else if (lower.includes("animated") && lower.includes("text")) kind = "animated-text";
  else if (lower.includes("animated") && lower.includes("list")) kind = "animated-list";
  const texts = quotedStrings(source);
  const media = mediaUrls(source);
  const item: PromptCatalogItem = { id: `import-${uid("block")}`, name: requestedName.trim() || "Imported Prompt Block", group: "Imported", kind, texts, media, animated: /(motion\/react|framer-motion|motion\.|animate-|transition)/i.test(source), sourceLine: 0 };
  return catalogItemToNode(item);
}

export function importedBlockFromPrompt(source: string, name: string): ImportedBlock {
  const node = promptToNode(source, name);
  const now = new Date().toISOString();
  return { id: uid("imported"), name: name.trim() || "Imported Block", group: "Imported Prompts", node, createdAt: now, updatedAt: now, sourceKind: "prompt-code" };
}
