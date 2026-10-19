import type { BuilderNode, NodeStyle, NodeType, Viewport } from "../types";

export const uid = (prefix = "node") => `${prefix}_${crypto.randomUUID().slice(0, 8)}`;

export const defaultStyle = (): NodeStyle => ({
  background: "transparent",
  color: "#111827",
  width: "auto",
  maxWidth: "none",
  height: "auto",
  minHeight: "0px",
  padding: "0px",
  margin: "0px",
  borderWidth: "0px",
  borderColor: "#d1d5db",
  borderStyle: "solid",
  borderRadius: "0px",
  boxShadow: "none",
  fontSize: "16px",
  fontWeight: "400",
  lineHeight: "1.5",
  letterSpacing: "0px",
  textAlign: "left",
  display: "block",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "stretch",
  gridColumns: "1fr",
  gap: "0px",
  opacity: 1,
  overflow: "visible"
});

export const createNode = (type: NodeType, overrides: Partial<BuilderNode> = {}): BuilderNode => {
  const base: BuilderNode = {
    id: uid(type), type, name: type[0].toUpperCase() + type.slice(1), style: defaultStyle(),
    animation: "none", hoverAnimation: "none", animationDuration: .7, animationDelay: 0,
    responsive: {}, hiddenOn: {}
  };
  const presets: Partial<Record<NodeType, Partial<BuilderNode>>> = {
    section: { name: "Section", children: [], style: { ...defaultStyle(), width: "100%", padding: "80px 40px", minHeight: "240px", display: "flex", flexDirection: "column", gap: "24px" } },
    container: { name: "Container", children: [], style: { ...defaultStyle(), width: "100%", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", borderWidth: "1px", borderStyle: "dashed", borderColor: "#d1d5db" } },
    card: { name: "Card", children: [], style: { ...defaultStyle(), width: "100%", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", borderWidth: "1px", borderColor: "#e5e7eb", borderRadius: "18px", boxShadow: "0 8px 30px rgba(15,23,42,.06)" } },
    form: { name: "Form", children: [], style: { ...defaultStyle(), width: "100%", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" } },
    heading: { name: "Heading", content: "Build something remarkable", style: { ...defaultStyle(), fontSize: "48px", fontWeight: "700", lineHeight: "1.08", letterSpacing: "-1.5px" } },
    text: { name: "Text", content: "Add your text here. Select this element to customize typography, spacing, colors and animation.", style: { ...defaultStyle(), color: "#4b5563", fontSize: "18px" } },
    button: { name: "Button", content: "Get started", href: "#", target: "_self", style: { ...defaultStyle(), background: "#111827", color: "#ffffff", padding: "12px 22px", borderRadius: "999px", fontWeight: "600", width: "fit-content" }, hoverAnimation: "lift" },
    image: { name: "Image", src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80", alt: "Placeholder", style: { ...defaultStyle(), width: "100%", height: "320px", borderRadius: "18px", overflow: "hidden" } },
    video: { name: "Video", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", style: { ...defaultStyle(), width: "100%", height: "360px", borderRadius: "18px", overflow: "hidden" } },
    icon: { name: "Icon", content: "✦", style: { ...defaultStyle(), fontSize: "28px", width: "fit-content" } },
    input: { name: "Input", placeholder: "Type here...", style: { ...defaultStyle(), width: "100%", padding: "12px 14px", borderWidth: "1px", borderColor: "#d1d5db", borderRadius: "10px" } },
    textarea: { name: "Textarea", placeholder: "Write your message...", style: { ...defaultStyle(), width: "100%", minHeight: "120px", padding: "12px 14px", borderWidth: "1px", borderColor: "#d1d5db", borderRadius: "10px" } },
    select: { name: "Select", options: ["Option one", "Option two", "Option three"], style: { ...defaultStyle(), width: "100%", padding: "12px 14px", borderWidth: "1px", borderColor: "#d1d5db", borderRadius: "10px" } },
    label: { name: "Label", content: "Label", style: { ...defaultStyle(), fontWeight: "600", fontSize: "14px" } },
    spacer: { name: "Spacer", style: { ...defaultStyle(), height: "48px", width: "100%" } },
    divider: { name: "Divider", style: { ...defaultStyle(), height: "1px", width: "100%", background: "#e5e7eb" } }
  };
  return {
    ...base,
    ...(presets[type] || {}),
    ...overrides,
    style: { ...(presets[type]?.style || base.style), ...(overrides.style || {}) },
    responsive: { ...(presets[type]?.responsive || {}), ...(overrides.responsive || {}) },
    hiddenOn: { ...(presets[type]?.hiddenOn || {}), ...(overrides.hiddenOn || {}) }
  };
};

export const cloneNode = (node: BuilderNode): BuilderNode => ({
  ...structuredClone(node), id: uid(node.type), children: node.children?.map(cloneNode)
});

export function mapNode(nodes: BuilderNode[], id: string, fn: (node: BuilderNode) => BuilderNode): BuilderNode[] {
  return nodes.map((node) => node.id === id ? fn(node) : ({ ...node, children: node.children ? mapNode(node.children, id, fn) : node.children }));
}

export function removeNode(nodes: BuilderNode[], id: string): BuilderNode[] {
  return nodes.filter((node) => node.id !== id).map((node) => ({ ...node, children: node.children ? removeNode(node.children, id) : node.children }));
}

export function findNode(nodes: BuilderNode[], id: string): BuilderNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) { const found = findNode(node.children, id); if (found) return found; }
  }
}

export function containsNode(node: BuilderNode, id: string): boolean {
  if (node.id === id) return true;
  return !!node.children?.some(child => containsNode(child, id));
}

export function appendNode(nodes: BuilderNode[], parentId: string | null, child: BuilderNode, index?: number): BuilderNode[] {
  if (!parentId) {
    const next = [...nodes];
    if (index == null || index < 0 || index > next.length) next.push(child); else next.splice(index, 0, child);
    return next;
  }
  return mapNode(nodes, parentId, (node) => {
    const children = [...(node.children || [])];
    if (index == null || index < 0 || index > children.length) children.push(child); else children.splice(index, 0, child);
    return { ...node, children };
  });
}

export function moveNode(nodes: BuilderNode[], id: string, targetParentId: string | null): BuilderNode[] {
  const moving = findNode(nodes, id);
  if (!moving || (targetParentId && containsNode(moving, targetParentId))) return nodes;
  const without = removeNode(nodes, id);
  return appendNode(without, targetParentId, moving);
}

function reorderList(nodes: BuilderNode[], id: string, direction: -1 | 1): [BuilderNode[], boolean] {
  const index = nodes.findIndex(n => n.id === id);
  if (index >= 0) {
    const target = index + direction;
    if (target < 0 || target >= nodes.length) return [nodes, true];
    const copy = [...nodes];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    return [copy, true];
  }
  for (let i = 0; i < nodes.length; i++) {
    if (!nodes[i].children) continue;
    const [children, found] = reorderList(nodes[i].children!, id, direction);
    if (found) {
      const copy = [...nodes];
      copy[i] = { ...copy[i], children };
      return [copy, true];
    }
  }
  return [nodes, false];
}

export function reorderNode(nodes: BuilderNode[], id: string, direction: -1 | 1): BuilderNode[] {
  return reorderList(nodes, id, direction)[0];
}

export function resolveStyle(node: BuilderNode, viewport: Viewport): NodeStyle {
  if (viewport === "desktop") return node.style;
  return { ...node.style, ...(node.responsive?.[viewport] || {}) };
}
