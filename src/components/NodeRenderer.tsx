import { useState } from "react";
import type { CSSProperties, DragEvent, MouseEvent } from "react";
import { ChevronLeft, ChevronRight, GripVertical, X } from "lucide-react";
import type { BuilderNode, BuilderProject } from "../types";
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

const canNest = (node: BuilderNode) => ["container", "section", "card", "form", "navbar", "footer", "symbol", "modal"].includes(node.type);

export default function NodeRenderer({ node, readOnly = false }: { node: BuilderNode; readOnly?: boolean }) {
  const { project, selectedId, setSelected, addNode, moveNode, viewport } = useBuilder();
  const mediaSrc = useAssetSource(project, node.src);
  const [activeTab, setActiveTab] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(!!node.checked);
  const [slide, setSlide] = useState(0);
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
  const interactive = readOnly;

  switch (node.type) {
    case "heading": return wrap(<h1 {...common}>{node.content}</h1>);
    case "text": return wrap(<p {...common}>{node.content}</p>);
    case "button": return wrap(<a {...common} className={`${className} nw-button`} href={readOnly ? node.href : undefined} target={node.target} rel={node.target === "_blank" ? "noreferrer" : undefined}>{node.content}</a>);
    case "link": return wrap(<a {...common} className={`${className} nw-link`} href={readOnly ? node.href : undefined} target={node.target} rel={node.target === "_blank" ? "noreferrer" : undefined}>{node.content}</a>);
    case "badge": return wrap(<span {...common} className={`${className} nw-badge`}>{node.content}</span>);
    case "image": return wrap(<img {...common} src={mediaSrc} alt={node.alt || ""} style={{ ...common.style, objectFit: "cover" }}/>);
    case "video": return wrap(<video {...common} src={mediaSrc} controls={readOnly} muted loop playsInline style={{ ...common.style, objectFit: "cover" }}/>);
    case "icon": return wrap(<span {...common}>{node.content || "✦"}</span>);
    case "input": return wrap(<input {...common} placeholder={node.placeholder} readOnly={!readOnly}/>);
    case "textarea": return wrap(<textarea {...common} placeholder={node.placeholder} readOnly={!readOnly}/>);
    case "select": return wrap(<select {...common} disabled={!readOnly}>{(node.options || []).map(o => <option key={o}>{o}</option>)}</select>);
    case "label": return wrap(<label {...common}>{node.content}</label>);
    case "checkbox": return wrap(<label {...common} className={`${className} nw-check-control`}><input type="checkbox" defaultChecked={node.checked} disabled={!interactive} name={node.nameAttr} value={node.value}/><span>{node.content}</span></label>);
    case "radio": return wrap(<fieldset {...common} className={`${className} nw-radio-group`}><legend>{node.content}</legend>{(node.options || []).map((o, i) => <label key={o}><input type="radio" name={`${node.nameAttr || node.id}-${readOnly ? "live" : "edit"}`} value={o} defaultChecked={(node.value || node.options?.[0]) === o} disabled={!interactive}/><span>{o}</span></label>)}</fieldset>);
    case "switch": return wrap(<label {...common} className={`${className} nw-switch-row`}><button type="button" className={`nw-switch ${switchOn ? "on" : ""}`} aria-pressed={switchOn} disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setSwitchOn(v => !v); }}><span/></button><span>{node.content}</span></label>);
    case "range": return wrap(<label {...common} className={`${className} nw-range`}><span>{node.content}</span><input type="range" min={node.min ?? 0} max={node.max ?? 100} step={node.step ?? 1} defaultValue={Number(node.value ?? 50)} disabled={!interactive}/></label>);
    case "file": return wrap(<label {...common} className={`${className} nw-file-input`}><span>{node.content}</span><input type="file" disabled={!interactive}/></label>);
    case "list": return wrap(<ul {...common} className={`${className} nw-list`}>{(node.options || []).map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>);
    case "embed": case "map": return wrap(<div {...common} className={`${className} nw-embed`}><iframe src={node.src} title={node.alt || node.name} loading="lazy" allowFullScreen style={{ width: "100%", height: "100%", border: 0, pointerEvents: readOnly ? "auto" : "none" }}/></div>);
    case "table": return wrap(<div {...common} className={`${className} nw-table-wrap`}><table><thead><tr>{(node.table?.headers || []).map((h, i) => <th key={`${h}-${i}`}>{h}</th>)}</tr></thead><tbody>{(node.table?.rows || []).map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>)}</tbody></table></div>);
    case "tabs": return wrap(<div {...common} className={`${className} nw-tabs`}><div className="nw-tab-list">{(node.items || []).map((item, i) => <button type="button" key={item.title} className={activeTab === i ? "active" : ""} disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setActiveTab(i); }}>{item.title}</button>)}</div><div className="nw-tab-panel">{node.items?.[activeTab]?.body || ""}</div></div>);
    case "accordion": return wrap(<div {...common} className={`${className} nw-accordion`}>{(node.items || []).map((item, i) => <div className="nw-accordion-item" key={item.title}><button type="button" disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setOpenAccordion(v => v === i ? null : i); }}><span>{item.title}</span><b>{openAccordion === i ? "−" : "+"}</b></button>{openAccordion === i && <div className="nw-accordion-panel">{item.body}</div>}</div>)}</div>);
    case "modal": {
      const trigger = <button type="button" className="nw-modal-trigger" disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setModalOpen(true); }}>{node.content || "Open modal"}</button>;
      return wrap(<div {...common} className={`${className} nw-modal-node`}>{trigger}{!readOnly && <div className="nw-modal-editor-content">{children}{(!node.children || node.children.length === 0) && <div className="empty-drop">Drop modal content here</div>}</div>}{readOnly && modalOpen && <div className="nw-modal-backdrop" onClick={() => setModalOpen(false)}><div className="nw-modal-dialog" onClick={e => e.stopPropagation()}><button className="nw-modal-close" onClick={() => setModalOpen(false)}><X size={17}/></button>{children}</div></div>}</div>);
    }
    case "carousel": {
      const slides = node.slides || [];
      const safe = slides.length ? Math.min(slide, slides.length - 1) : 0;
      return wrap(<div {...common} className={`${className} nw-carousel`}>{slides.length ? <><ResolvedSlide project={project} src={slides[safe].src} alt={slides[safe].alt || ""}/>{slides[safe].caption && <div className="nw-carousel-caption">{slides[safe].caption}</div>}<button type="button" className="nw-carousel-prev" disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setSlide(v => (v - 1 + slides.length) % slides.length); }}><ChevronLeft size={18}/></button><button type="button" className="nw-carousel-next" disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setSlide(v => (v + 1) % slides.length); }}><ChevronRight size={18}/></button><div className="nw-carousel-dots">{slides.map((_, i) => <i key={i} className={i === safe ? "active" : ""}/>)}</div></> : <div className="empty-drop">Add carousel slides in Properties</div>}</div>);
    }
    case "socials": return wrap(<div {...common} className={`${className} nw-socials`}>{(node.links || []).map(link => <a key={`${link.label}-${link.href}`} href={readOnly ? link.href : undefined} target="_blank" rel="noreferrer">{link.label}</a>)}</div>);
    case "symbol": return wrap(<div {...common} className={`${className} nw-symbol`}>{!readOnly && <div className="nw-symbol-chip">Component · {node.componentName || "Symbol"}</div>}{children}{!readOnly && (!node.children || node.children.length === 0) && <div className="empty-drop">Drop reusable component content here</div>}</div>);
    case "divider": case "spacer": return wrap(<div {...common}/>);
    case "form": return wrap(<form {...common} onSubmit={e => e.preventDefault()}>{children}{!readOnly && (!node.children || node.children.length === 0) && <div className="empty-drop">Drop form fields here</div>}</form>);
    default: return wrap(<div {...common}>{children}{!readOnly && canNest(node) && (!node.children || node.children.length === 0) ? <div className="empty-drop">Drop elements here</div> : null}</div>);
  }
}

function ResolvedSlide({ project, src, alt }: { project: BuilderProject; src: string; alt: string }) {
  const resolved = useAssetSource(project, src);
  return <img src={resolved} alt={alt} className="nw-carousel-image"/>;
}
