import { useEffect, useRef, useState } from "react";
import type { AriaRole, CSSProperties, DragEvent, MouseEvent } from "react";
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

export default function NodeRenderer({ node, readOnly = false, timelineOffset = 0 }: { node: BuilderNode; readOnly?: boolean; timelineOffset?: number }) {
  const { project, selectedId, setSelected, addNode, moveNode, viewport } = useBuilder();
  const mediaSrc = useAssetSource(project, node.src);
  const [activeTab, setActiveTab] = useState(node.defaultIndex ?? 0);
  const [openAccordion, setOpenAccordion] = useState<number | null>(node.defaultIndex ?? 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(!!node.checked);
  const [slide, setSlide] = useState(0);
  const motionEl = useRef<HTMLElement | null>(null);
  const motionEnabled = project.motionSystem.enabled;
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(query.matches);
    update(); query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  const reduced = project.motionSystem.reducedMotion === "reduce" || (project.motionSystem.reducedMotion === "respect" && prefersReduced);
  const trigger = node.motionTrigger || project.motionSystem.defaultTrigger;
  const [inView, setInView] = useState(trigger !== "scroll" || !readOnly);
  const [parallaxY, setParallaxY] = useState(0);
  const selected = selectedId === node.id;
  const slides = node.slides || [];
  const carouselAutoplay = node.autoplay ?? node.carouselAutoplay ?? false;
  const carouselInterval = node.interval ?? node.carouselInterval ?? 4500;
  const carouselShowDots = node.showDots ?? node.carouselShowDots ?? true;
  const carouselShowArrows = node.carouselShowArrows ?? true;
  const modalCloseOnBackdrop = node.closeOnBackdrop ?? node.modalCloseOnBackdrop ?? true;


  useEffect(() => {
    if (!readOnly || !motionEnabled || reduced || trigger !== "scroll" || !node.animation || node.animation === "none") { setInView(true); return; }
    const el = motionEl.current;
    if (!el || typeof IntersectionObserver === "undefined") { setInView(true); return; }
    setInView(false);
    const observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry?.isIntersecting) { setInView(true); if (!node.motionRepeat) observer.disconnect(); }
      else if (node.motionRepeat) setInView(false);
    }, { threshold: Math.max(0, Math.min(1, node.motionThreshold ?? project.motionSystem.scrollThreshold)), rootMargin: "0px 0px -4% 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [readOnly, motionEnabled, reduced, trigger, node.animation, node.motionRepeat, node.motionThreshold, project.motionSystem.scrollThreshold]);

  useEffect(() => {
    if (!readOnly || !motionEnabled || reduced || !node.parallax) { setParallaxY(0); return; }
    const el = motionEl.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const strength = Math.max(-project.motionSystem.parallaxMax, Math.min(project.motionSystem.parallaxMax, node.parallax || 0));
      setParallaxY(Math.round(-center * strength * 0.18));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", onScroll, { passive: true }); window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [readOnly, motionEnabled, reduced, node.parallax, project.motionSystem.parallaxMax]);

  useEffect(() => {
    if (!readOnly || !carouselAutoplay || slides.length < 2) return;
    const timer = window.setInterval(() => setSlide(value => (value + 1) % slides.length), Math.max(1200, carouselInterval));
    return () => window.clearInterval(timer);
  }, [readOnly, carouselAutoplay, carouselInterval, slides.length]);

  useEffect(() => {
    if (!readOnly || !modalOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setModalOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [readOnly, modalOpen]);

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
  const childCount = node.children?.length || 0;
  const children = node.children?.map((child,index) => {
    const orderIndex = node.timelineOrder === "reverse" ? childCount - 1 - index : index;
    const childOffset = (node.timelineStagger || 0) * orderIndex;
    return <NodeRenderer key={child.id} node={child} readOnly={readOnly} timelineOffset={timelineOffset + childOffset}/>;
  });
  const motionClass = !motionEnabled || reduced ? "motion-disabled" : `motion-${trigger} ${inView ? "motion-inview" : "motion-pending"}`;
  const className = `builder-node type-${node.type} anim-${node.animation || "none"} hover-${node.hoverAnimation || "none"} ${motionClass} ${node.parallax ? "has-parallax" : ""} ${node.sticky ? "is-sticky" : ""} ${selected && !readOnly ? "selected-node" : ""}`;
  const common = {
    onClick: click, onDragOver: (e: DragEvent) => { if (!readOnly && canNest(node)) e.preventDefault(); }, onDrop: drop,
    draggable: !readOnly && !["navbar", "footer"].includes(node.type), onDragStart: dragStart,
    ref: (el: HTMLElement | null) => { motionEl.current = el; },
    style: { ...style, animationDuration: `${node.animationDuration ?? project.motionSystem.defaultDuration}s`, animationDelay: `${(node.animationDelay ?? 0) + timelineOffset}s`, animationTimingFunction: node.motionEasing || project.motionSystem.defaultEasing, transitionDuration: `${node.transitionDuration ?? .25}s`, transitionTimingFunction: node.transitionEasing || "ease", ...(readOnly && node.parallax && !reduced ? ({ "--nw-parallax-y": `${parallaxY}px` } as CSSProperties) : {}), ...(readOnly && node.sticky ? { position: "sticky" as const, top: node.stickyTop || "0px", zIndex: node.stickyZIndex ?? 10 } : {}) }, className,
    "aria-label": node.ariaLabel || undefined, title: node.titleAttr || undefined, role: node.roleAttr as AriaRole | undefined, tabIndex: node.tabIndex
  };
  const overlay = !readOnly && selected ? <div className="selection-label"><GripVertical size={12}/>{node.name}</div> : null;
  const componentChip = !readOnly && (node.componentId || node.symbolSyncKey) ? <div className="nw-component-chip">↻ {node.componentName || "Component"}</div> : null;
  const wrap = (element: React.ReactElement) => <>{element}{componentChip}{overlay}</>;
  const interactive = readOnly;

  switch (node.type) {
    case "heading": return wrap(<h1 {...common}>{node.content}</h1>);
    case "text": return wrap(<p {...common}>{node.content}</p>);
    case "button": return wrap(<a {...common} className={`${className} nw-button`} href={readOnly ? node.href : undefined} target={node.target} rel={node.target === "_blank" ? "noreferrer" : undefined}>{node.content}</a>);
    case "link": return wrap(<a {...common} className={`${className} nw-link`} href={readOnly ? node.href : undefined} target={node.target} rel={node.target === "_blank" ? "noreferrer" : undefined}>{node.content}</a>);
    case "badge": return wrap(<span {...common} className={`${className} nw-badge`}>{node.content}</span>);
    case "image": return wrap(<img {...common} src={mediaSrc} alt={node.alt || ""} style={{ ...common.style, objectFit: "cover" }}/>);
    case "video": return wrap(<video {...common} src={mediaSrc} controls={readOnly} muted loop playsInline style={{ ...common.style, objectFit: "cover" }}/>);
    case "avatar": return wrap(<div {...common} className={`${className} nw-avatar`}>{mediaSrc ? <img src={mediaSrc} alt={node.alt || ""}/> : <span>{node.content || "?"}</span>}</div>);
    case "icon": return wrap(<span {...common}>{node.content || "✦"}</span>);
    case "input": return wrap(<input {...common} type={node.inputType || "text"} placeholder={node.placeholder} name={node.nameAttr} defaultValue={node.value} required={readOnly && !!node.required} pattern={node.pattern || undefined} minLength={node.minLength} maxLength={node.maxLength} autoComplete={node.autocomplete} readOnly={!readOnly}/>);
    case "textarea": return wrap(<textarea {...common} placeholder={node.placeholder} name={node.nameAttr} defaultValue={node.value} rows={node.rows || 4} required={readOnly && !!node.required} minLength={node.minLength} maxLength={node.maxLength} autoComplete={node.autocomplete} readOnly={!readOnly}/>);
    case "select": return wrap(<select {...common} name={node.nameAttr} defaultValue={node.value} required={readOnly && !!node.required} disabled={!readOnly}>{(node.options || []).map(o => <option key={o}>{o}</option>)}</select>);
    case "label": return wrap(<label {...common}>{node.content}</label>);
    case "checkbox": return wrap(<label {...common} className={`${className} nw-check-control`}><input type="checkbox" defaultChecked={node.checked} disabled={!interactive} required={readOnly && !!node.required} name={node.nameAttr} value={node.value}/><span>{node.content}</span></label>);
    case "radio": return wrap(<fieldset {...common} className={`${className} nw-radio-group`}><legend>{node.content}</legend>{(node.options || []).map(o => <label key={o}><input type="radio" name={`${node.nameAttr || node.id}-${readOnly ? "live" : "edit"}`} value={o} defaultChecked={(node.value || node.options?.[0]) === o} required={readOnly && !!node.required} disabled={!interactive}/><span>{o}</span></label>)}</fieldset>);
    case "switch": return wrap(<label {...common} className={`${className} nw-switch-row`}><button type="button" className={`nw-switch ${switchOn ? "on" : ""}`} aria-pressed={switchOn} aria-label={node.ariaLabel || node.content || "Toggle"} disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setSwitchOn(v => !v); }}><span/></button><span>{node.content}</span></label>);
    case "range": return wrap(<label {...common} className={`${className} nw-range`}><span>{node.content}</span><input type="range" name={node.nameAttr} min={node.min ?? 0} max={node.max ?? 100} step={node.step ?? 1} defaultValue={Number(node.value ?? 50)} disabled={!interactive}/></label>);
    case "file": return wrap(<label {...common} className={`${className} nw-file-input`}><span>{node.content}</span><input type="file" name={node.nameAttr} accept={node.accept} multiple={!!node.multiple} required={readOnly && !!node.required} disabled={!interactive}/></label>);
    case "list": {
      const ordered = node.ordered ?? node.listStyle === "decimal";
      const listStyleType = node.listStyle === "none" ? "none" : node.listStyle || (ordered ? "decimal" : "disc");
      return ordered ? wrap(<ol {...common} style={{ ...common.style, listStyleType }} className={`${className} nw-list`}>{(node.options || []).map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ol>) : wrap(<ul {...common} style={{ ...common.style, listStyleType }} className={`${className} nw-list`}>{(node.options || []).map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>);
    }
    case "embed": case "map": return wrap(<div {...common} className={`${className} nw-embed`}><iframe src={node.src} title={node.alt || node.name} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" style={{ width: "100%", height: "100%", border: 0, pointerEvents: readOnly ? "auto" : "none" }}/></div>);
    case "html": return wrap(<div {...common} className={`${className} nw-html-block`}><iframe title={node.ariaLabel || node.name} srcDoc={node.html ?? node.content ?? ""} sandbox="" style={{ width: "100%", height: "100%", border: 0, background: "transparent" }}/></div>);
    case "code": return wrap(<pre {...common} className={`${className} nw-code`}><code>{node.content}</code></pre>);
    case "alert": return wrap(<div {...common} className={`${className} nw-alert nw-alert-${String(node.meta?.variant || "info")}`}>{node.content}</div>);
    case "progress": return wrap(<label {...common} className={`${className} nw-progress`}><span>{node.content}</span><progress value={Number(node.value || 0)} max={node.max ?? 100}/><b>{node.value || "0"}%</b></label>);
    case "rating": { const max = Math.max(1, node.max || 5); const value = Math.max(0, Math.min(max, Number(node.value || 0))); return wrap(<div {...common} className={`${className} nw-rating`} aria-label={node.ariaLabel || `${value} out of ${max} stars`}><span aria-hidden="true">{"★".repeat(Math.round(value))}{"☆".repeat(Math.max(0, max - Math.round(value)))}</span></div>); }
    case "breadcrumb": return wrap(<nav {...common} className={`${className} nw-breadcrumb`} aria-label={node.ariaLabel || "Breadcrumb"}>{(node.links || []).map((link, i) => <span key={`${link.label}-${i}`}><a href={readOnly ? link.href : undefined}>{link.label}</a>{i < (node.links?.length || 0) - 1 && <i aria-hidden="true">/</i>}</span>)}</nav>);
    case "table": return wrap(<div {...common} className={`${className} nw-table-wrap${node.tableStriped ? " striped" : ""}${node.tableCompact ? " compact" : ""}`}><table>{node.table?.caption && <caption>{node.table.caption}</caption>}<thead><tr>{(node.table?.headers || []).map((h, i) => <th key={`${h}-${i}`} scope="col">{h}</th>)}</tr></thead><tbody>{(node.table?.rows || []).map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>)}</tbody></table></div>);
    case "tabs": return wrap(<div {...common} className={`${className} nw-tabs`}><div className="nw-tab-list" role="tablist">{(node.items || []).map((item, i) => <button type="button" role="tab" aria-selected={activeTab === i} key={item.title} className={activeTab === i ? "active" : ""} disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setActiveTab(i); }}>{item.title}</button>)}</div><div className="nw-tab-panel" role="tabpanel">{node.items?.[activeTab]?.body || ""}</div></div>);
    case "accordion": return wrap(<div {...common} className={`${className} nw-accordion`}>{(node.items || []).map((item, i) => <div className="nw-accordion-item" key={item.title}><button type="button" aria-expanded={openAccordion === i} disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setOpenAccordion(v => v === i ? null : i); }}><span>{item.title}</span><b>{openAccordion === i ? "−" : "+"}</b></button>{openAccordion === i && <div className="nw-accordion-panel">{item.body}</div>}</div>)}</div>);
    case "modal": {
      const trigger = <button type="button" className="nw-modal-trigger" aria-label={node.ariaLabel || undefined} disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setModalOpen(true); }}>{node.content || "Open modal"}</button>;
      const closeBackdrop = () => { if (modalCloseOnBackdrop) setModalOpen(false); };
      return wrap(<div {...common} className={`${className} nw-modal-node`}>{trigger}{!readOnly && <div className="nw-modal-editor-content">{children}{(!node.children || node.children.length === 0) && <div className="empty-drop">Drop modal content here</div>}</div>}{readOnly && modalOpen && <div className="nw-modal-backdrop" onClick={closeBackdrop}><div className="nw-modal-dialog" role="dialog" aria-modal="true" aria-label={node.ariaLabel || "Dialog"} style={{ maxWidth: node.modalWidth || "560px" }} onClick={e => e.stopPropagation()}><button className="nw-modal-close" aria-label="Close dialog" onClick={() => setModalOpen(false)}><X size={17}/></button>{children}</div></div>}</div>);
    }
    case "carousel": {
      const safe = slides.length ? Math.min(slide, slides.length - 1) : 0;
      return wrap(<div {...common} className={`${className} nw-carousel`} aria-roledescription="carousel">{slides.length ? <><ResolvedSlide project={project} src={slides[safe].src} alt={slides[safe].alt || ""}/>{slides[safe].caption && <div className="nw-carousel-caption">{slides[safe].caption}</div>}{carouselShowArrows && <><button type="button" aria-label="Previous slide" className="nw-carousel-prev" disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setSlide(v => (v - 1 + slides.length) % slides.length); }}><ChevronLeft size={18}/></button><button type="button" aria-label="Next slide" className="nw-carousel-next" disabled={!interactive} onClick={e => { e.stopPropagation(); if (interactive) setSlide(v => (v + 1) % slides.length); }}><ChevronRight size={18}/></button></>}{carouselShowDots && <div className="nw-carousel-dots">{slides.map((_, i) => <i key={i} className={i === safe ? "active" : ""}/>)}</div>}</> : <div className="empty-drop">Add carousel slides in Properties</div>}</div>);
    }
    case "socials": return wrap(<div {...common} className={`${className} nw-socials`}>{(node.links || []).map(link => <a key={`${link.label}-${link.href}`} href={readOnly ? link.href : undefined} target={readOnly ? "_blank" : undefined} rel="noreferrer">{link.label}</a>)}</div>);
    case "symbol": return wrap(<div {...common} className={`${className} nw-symbol`}>{children}<div className="nw-symbol-chip">{node.componentId ? "Linked" : "Component group"}</div>{!readOnly && (!node.children || node.children.length === 0) && <div className="empty-drop">Drop component content here</div>}</div>);
    case "divider": case "spacer": return wrap(<div {...common}/>);
    case "form": return wrap(<form {...common} action={readOnly ? node.formAction || undefined : undefined} method={node.formMethod || "post"} onSubmit={e => { if (!readOnly || !node.formAction) e.preventDefault(); }}>{children}{!readOnly && (!node.children || node.children.length === 0) && <div className="empty-drop">Drop form fields here</div>}</form>);
    default: return wrap(<div {...common}>{children}{!readOnly && canNest(node) && (!node.children || node.children.length === 0) ? <div className="empty-drop">Drop elements here</div> : null}</div>);
  }
}

function ResolvedSlide({ project, src, alt }: { project: BuilderProject; src: string; alt: string }) {
  const resolved = useAssetSource(project, src);
  return <img className="nw-carousel-image" src={resolved} alt={alt}/>;
}
