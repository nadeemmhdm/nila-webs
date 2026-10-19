import type { CSSProperties, DragEvent, MouseEvent } from "react";
import { GripVertical } from "lucide-react";
import type { BuilderNode } from "../types";
import { resolveStyle } from "../lib/nodes";
import { useBuilder } from "../store/builder";
import { useAssetSource } from "../hooks/useAssetSource";

const toCss = (s: BuilderNode["style"]): CSSProperties => ({
  background: s.background, color: s.color, width: s.width, maxWidth: s.maxWidth, height: s.height, minHeight: s.minHeight,
  padding: s.padding, margin: s.margin, borderWidth: s.borderWidth, borderColor: s.borderColor, borderStyle: s.borderStyle,
  borderRadius: s.borderRadius, boxShadow: s.boxShadow, fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight,
  letterSpacing: s.letterSpacing, textAlign: s.textAlign, display: s.display, flexDirection: s.flexDirection,
  justifyContent: s.justifyContent, alignItems: s.alignItems, gap: s.gap, opacity: s.opacity, overflow: s.overflow,
  gridTemplateColumns: s.gridColumns
});

const canNest = (node: BuilderNode) => ["container", "section", "card", "form", "navbar", "footer"].includes(node.type);

export default function NodeRenderer({ node, readOnly = false }: { node: BuilderNode; readOnly?: boolean }) {
  const { project, selectedId, setSelected, addNode, moveNode, viewport } = useBuilder();
  const mediaSrc = useAssetSource(project, node.src);
  const selected = selectedId === node.id;
  if (node.hiddenOn?.[viewport]) return readOnly ? null : <div className={`hidden-node ${selected ? "selected" : ""}`} onClick={e => { e.stopPropagation(); setSelected(node.id); }}>Hidden on {viewport}: {node.name}</div>;
  const style = toCss(resolveStyle(node, viewport));
  const click = (e: MouseEvent) => { if (!readOnly) { e.preventDefault(); e.stopPropagation(); setSelected(node.id); } };
  const drop = (e: DragEvent) => {
    if (readOnly || !canNest(node)) return;
    e.preventDefault(); e.stopPropagation();
    const library = e.dataTransfer.getData("application/nila-library");
    const moving = e.dataTransfer.getData("application/nila-node");
    if (library) { const { item } = JSON.parse(library); addNode(item, node.id); }
    else if (moving && moving !== node.id) moveNode(moving, node.id);
  };
  const dragStart = (e: DragEvent) => { if (readOnly || ["navbar", "footer"].includes(node.type)) return; e.stopPropagation(); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("application/nila-node", node.id); };
  const children = node.children?.map(child => <NodeRenderer key={child.id} node={child} readOnly={readOnly}/>);
  const className = `builder-node type-${node.type} anim-${node.animation || "none"} hover-${node.hoverAnimation || "none"} ${selected && !readOnly ? "selected-node" : ""}`;
  const common = {
    onClick: click, onDragOver: (e: DragEvent) => { if (!readOnly && canNest(node)) e.preventDefault(); }, onDrop: drop,
    draggable: !readOnly && !["navbar", "footer"].includes(node.type), onDragStart: dragStart,
    style: { ...style, animationDuration: `${node.animationDuration ?? .7}s`, animationDelay: `${node.animationDelay ?? 0}s` }, className
  };
  const overlay = !readOnly && selected ? <div className="selection-label"><GripVertical size={12}/>{node.name}</div> : null;
  const wrap = (element: React.ReactElement) => <>{element}{overlay}</>;
  switch (node.type) {
    case "heading": return wrap(<h1 {...common}>{node.content}</h1>);
    case "text": return wrap(<p {...common}>{node.content}</p>);
    case "button": return wrap(<a {...common} href={readOnly ? node.href : undefined} target={node.target} rel={node.target === "_blank" ? "noreferrer" : undefined}>{node.content}</a>);
    case "image": return wrap(<img {...common} src={mediaSrc} alt={node.alt || ""} style={{ ...common.style, objectFit: "cover" }}/>);
    case "video": return wrap(<video {...common} src={mediaSrc} controls={readOnly} muted loop playsInline style={{ ...common.style, objectFit: "cover" }}/>);
    case "icon": return wrap(<span {...common}>{node.content || "✦"}</span>);
    case "input": return wrap(<input {...common} placeholder={node.placeholder} readOnly={!readOnly}/>);
    case "textarea": return wrap(<textarea {...common} placeholder={node.placeholder} readOnly={!readOnly}/>);
    case "select": return wrap(<select {...common} disabled={!readOnly}>{(node.options || []).map(o => <option key={o}>{o}</option>)}</select>);
    case "label": return wrap(<label {...common}>{node.content}</label>);
    case "divider": case "spacer": return wrap(<div {...common}/>);
    case "form": return wrap(<form {...common} onSubmit={e => e.preventDefault()}>{children}{!readOnly && (!node.children || node.children.length === 0) && <div className="empty-drop">Drop form fields here</div>}</form>);
    default: return wrap(<div {...common}>{children}{!readOnly && canNest(node) && (!node.children || node.children.length === 0) ? <div className="empty-drop">Drop elements here</div> : null}</div>);
  }
}
