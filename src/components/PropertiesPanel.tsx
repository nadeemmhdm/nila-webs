import { useRef } from "react";
import type { ReactNode } from "react";
import { ClipboardCopy, Copy, Eye, EyeOff, FolderOpen, Link2, RefreshCw, Trash2, Upload } from "lucide-react";
import { getNodeAnywhere, useBuilder } from "../store/builder";
import type { AnimationName, AssetKind, BuilderNode, HoverAnimation, InputType, ListStyle, NodeStyle } from "../types";
import { resolveStyle } from "../lib/nodes";
import { createUploadedAsset } from "../lib/assets";

const sizeFields: Array<[keyof NodeStyle, string]> = [["width","Width"],["maxWidth","Max width"],["height","Height"],["minHeight","Min height"]];
const spacingFields: Array<[keyof NodeStyle, string]> = [["padding","Padding"],["margin","Margin"],["gap","Gap"]];
const typeFields: Array<[keyof NodeStyle, string]> = [["fontSize","Font size"],["fontWeight","Weight"],["lineHeight","Line height"],["letterSpacing","Letter spacing"]];
const inputTypes: InputType[] = ["text","email","password","number","date","datetime-local","tel","url","search"];

export default function PropertiesPanel() {
  const { project, selectedId, viewport, updateNode, updateStyle, setNodeHidden, deleteNode, duplicateNode, copyNode, pasteNode, syncSymbolInstances, clipboard } = useBuilder();
  const node = selectedId ? getNodeAnywhere(project, selectedId) : undefined;
  if (!node) return <aside className="properties-panel empty-properties"><div className="empty-property-state"><div className="empty-property-icon">◫</div><strong>Select an element</strong><p>Click any block on the canvas or choose it from Layers to edit content, responsive layout, animation, links and accessibility.</p>{clipboard && <button className="secondary-button" onClick={() => pasteNode(null)}><ClipboardCopy size={14}/>Paste copied element</button>}</div></aside>;
  const style = resolveStyle(node, viewport);
  const set = <K extends keyof typeof node>(key: K, value: (typeof node)[K]) => updateNode(node.id, { [key]: value });
  const global = node.type === "navbar" || node.type === "footer";
  const isFormField = ["input","textarea","select","checkbox","radio","range","file"].includes(node.type);

  return <aside className="properties-panel">
    <div className="property-header"><div><span className="panel-kicker">{viewport} properties</span><h2>{node.name}</h2><span className="node-type-chip">{node.type}</span></div><div className="property-actions"><button onClick={() => setNodeHidden(node.id, viewport, !node.hiddenOn?.[viewport])} title="Toggle visibility">{node.hiddenOn?.[viewport] ? <EyeOff size={14}/> : <Eye size={14}/>}</button>{!global && <><button onClick={() => copyNode(node.id)} title="Copy"><ClipboardCopy size={14}/></button><button onClick={() => duplicateNode(node.id)} title="Duplicate"><Copy size={14}/></button><button className="danger" onClick={() => deleteNode(node.id)} title="Delete"><Trash2 size={14}/></button></>}</div></div>

    <PropertySection title="Content">
      {["heading","text","button","link","badge","label","icon","checkbox","radio","switch","range","file","modal"].includes(node.type) && <Field label={node.type === "radio" ? "Legend" : node.type === "modal" ? "Trigger text" : "Text"}><textarea value={node.content || ""} onChange={e => set("content", e.target.value)}/></Field>}
      {node.type === "icon" && <Field label="Quick icon"><select value={node.content || "✦"} onChange={e => set("content", e.target.value)}>{["✦","★","✓","→","♥","⚡","☀","☁","☎","✉","⌂","⚙","🔍","📍","🚀"].map(v => <option key={v}>{v}</option>)}</select></Field>}
      {["image","video"].includes(node.type) && <MediaSourceEditor node={node}/>}
      {node.type === "image" && <Field label="Alt text"><input value={node.alt || ""} onChange={e => set("alt", e.target.value)}/></Field>}
      {["input","textarea"].includes(node.type) && <Field label="Placeholder"><input value={node.placeholder || ""} onChange={e => set("placeholder", e.target.value)}/></Field>}
      {["select","list","radio"].includes(node.type) && <Field label="Options"><textarea value={(node.options || []).join("\n")} onChange={e => set("options", e.target.value.split("\n").map(v => v.trim()).filter(Boolean))}/></Field>}
      {node.type === "list" && <Field label="List style"><select value={node.listStyle || "disc"} onChange={e => set("listStyle", e.target.value as ListStyle)}><option value="disc">Bullets</option><option value="decimal">Numbers</option><option value="none">None</option></select></Field>}
      {["button","link"].includes(node.type) && <><Field label="Link"><input value={node.href || ""} onChange={e => set("href", e.target.value)} placeholder="/about or https://..."/></Field><Field label="Open in"><select value={node.target || "_self"} onChange={e => set("target", e.target.value as "_self"|"_blank")}><option value="_self">Same tab</option><option value="_blank">New tab</option></select></Field></>}
      {["checkbox","switch"].includes(node.type) && <Field label="Default state"><label className="toggle-line"><input type="checkbox" checked={!!node.checked} onChange={e => set("checked",e.target.checked)}/><span>{node.checked ? "On / checked" : "Off / unchecked"}</span></label></Field>}
      {node.type === "range" && <><Field label="Value"><input type="number" value={Number(node.value ?? 50)} onChange={e => set("value",e.target.value)}/></Field><Field label="Minimum"><input type="number" value={node.min ?? 0} onChange={e => set("min",Number(e.target.value))}/></Field><Field label="Maximum"><input type="number" value={node.max ?? 100} onChange={e => set("max",Number(e.target.value))}/></Field><Field label="Step"><input type="number" value={node.step ?? 1} onChange={e => set("step",Number(e.target.value))}/></Field></>}
      {["embed","map"].includes(node.type) && <><Field label="Embed URL"><textarea value={node.src || ""} onChange={e => set("src",e.target.value)} placeholder="https://..."/></Field><Field label="Title"><input value={node.alt || ""} onChange={e => set("alt",e.target.value)}/></Field></>}
      {node.type === "html" && <><Field label="Sandboxed HTML"><textarea className="code-textarea" value={node.html || ""} onChange={e => set("html",e.target.value)} placeholder="<section>...</section>"/></Field><div className="responsive-note">Custom HTML renders inside a sandboxed iframe. Scripts and parent-page access are disabled.</div></>}
      {node.type === "table" && <TableEditor node={node}/>}
      {["tabs","accordion"].includes(node.type) && <InteractiveItemsEditor node={node}/>}
      {node.type === "carousel" && <CarouselEditor node={node}/>}
      {node.type === "socials" && <SocialLinksEditor node={node}/>}
      {node.type === "symbol" && <><Field label="Component name"><input value={node.componentName || ""} onChange={e => set("componentName",e.target.value)} placeholder="My Component"/></Field><Field label="Linked component"><div className="symbol-sync-actions"><code>{node.symbolSyncKey || "Will link on sync"}</code><button type="button" onClick={() => syncSymbolInstances(node.id)}><RefreshCw size={12}/>Sync instances</button></div></Field><div className="responsive-note">Duplicate a Component Symbol to create linked instances. Edit one copy, then Sync instances to push its content and styles to matching copies.</div></>}
      {node.meta?.sourceId && <div className="source-detail"><span>Block source</span><code>{String(node.meta.sourceId)}</code></div>}
    </PropertySection>

    {isFormField && <PropertySection title="Form & validation">
      {node.type === "input" && <Field label="Input type"><select value={node.inputType || "text"} onChange={e => set("inputType",e.target.value as InputType)}>{inputTypes.map(v => <option key={v}>{v}</option>)}</select></Field>}
      {node.type !== "switch" && <Field label="Field name"><input value={node.nameAttr || ""} onChange={e => set("nameAttr",e.target.value)} placeholder="email"/></Field>}
      {["input","textarea","select","checkbox","radio"].includes(node.type) && <Field label="Default value"><input value={node.value || ""} onChange={e => set("value",e.target.value)}/></Field>}
      {node.type === "file" && <><Field label="Accepted files"><input value={node.accept || ""} onChange={e => set("accept",e.target.value)} placeholder="image/*,.pdf"/></Field><Field label="Multiple"><label className="toggle-line"><input type="checkbox" checked={!!node.multiple} onChange={e => set("multiple",e.target.checked)}/><span>Allow multiple files</span></label></Field></>}
      {["input","textarea"].includes(node.type) && <><Field label="Minimum length"><input type="number" min="0" value={node.minLength ?? 0} onChange={e => set("minLength",Number(e.target.value) || undefined)}/></Field><Field label="Maximum length"><input type="number" min="0" value={node.maxLength ?? 0} onChange={e => set("maxLength",Number(e.target.value) || undefined)}/></Field></>}
      {node.type === "input" && <Field label="Pattern"><input value={node.pattern || ""} onChange={e => set("pattern",e.target.value)} placeholder="[A-Za-z]+"/></Field>}
      {!["range"].includes(node.type) && <Field label="Required"><label className="toggle-line"><input type="checkbox" checked={!!node.required} onChange={e => set("required",e.target.checked)}/><span>{node.required ? "Required" : "Optional"}</span></label></Field>}
    </PropertySection>}

    {node.type === "modal" && <PropertySection title="Modal behavior">
      <Field label="Dialog width"><input value={node.modalWidth || "560px"} onChange={e => set("modalWidth",e.target.value)}/></Field>
      <Field label="Backdrop close"><label className="toggle-line"><input type="checkbox" checked={node.modalCloseOnBackdrop !== false} onChange={e => set("modalCloseOnBackdrop",e.target.checked)}/><span>Close when backdrop is clicked</span></label></Field>
      <div className="responsive-note">Escape always closes the dialog in live preview/export.</div>
    </PropertySection>}

    {node.type === "carousel" && <PropertySection title="Carousel behavior">
      <Field label="Autoplay"><label className="toggle-line"><input type="checkbox" checked={!!node.carouselAutoplay} onChange={e => set("carouselAutoplay",e.target.checked)}/><span>{node.carouselAutoplay ? "Playing automatically" : "Manual navigation"}</span></label></Field>
      <Field label="Interval (ms)"><input type="number" min="1000" step="500" value={node.carouselInterval || 4000} onChange={e => set("carouselInterval",Math.max(1000,Number(e.target.value) || 4000))}/></Field>
      <Field label="Arrows"><label className="toggle-line"><input type="checkbox" checked={node.carouselShowArrows !== false} onChange={e => set("carouselShowArrows",e.target.checked)}/><span>Show previous/next</span></label></Field>
      <Field label="Dots"><label className="toggle-line"><input type="checkbox" checked={node.carouselShowDots !== false} onChange={e => set("carouselShowDots",e.target.checked)}/><span>Show position dots</span></label></Field>
    </PropertySection>}

    <PropertySection title="Accessibility">
      <Field label="ARIA label"><input value={node.ariaLabel || ""} onChange={e => set("ariaLabel",e.target.value)} placeholder="Accessible name"/></Field>
      <Field label="Title / tooltip"><input value={node.titleAttr || ""} onChange={e => set("titleAttr",e.target.value)} placeholder="Optional tooltip"/></Field>
      {node.type === "image" && !node.alt && <div className="a11y-warning">Add alt text for meaningful images. Leave it empty only for decorative images.</div>}
    </PropertySection>

    <PropertySection title={`Responsive · ${viewport}`}>
      <div className="responsive-note">Desktop is the base style. Tablet and mobile only store overrides, so one block stays reusable across every breakpoint.</div>
      <Field label="Visible"><label className="toggle-line"><input type="checkbox" checked={!node.hiddenOn?.[viewport]} onChange={e => setNodeHidden(node.id, viewport, !e.target.checked)}/><span>{node.hiddenOn?.[viewport] ? "Hidden" : "Shown"}</span></label></Field>
      {sizeFields.map(([key,label]) => <StyleInput key={key} label={label} value={String(style[key])} onChange={v => updateStyle(node.id,{ [key]: v })}/>)}
      <Field label="Display"><select value={style.display} onChange={e => updateStyle(node.id,{ display:e.target.value as NodeStyle["display"] })}><option>block</option><option>flex</option><option>grid</option></select></Field>
      {style.display === "grid" && <StyleInput label="Grid columns" value={style.gridColumns} onChange={v => updateStyle(node.id,{gridColumns:v})}/>}
      {style.display === "flex" && <><Field label="Direction"><select value={style.flexDirection} onChange={e => updateStyle(node.id,{flexDirection:e.target.value as NodeStyle["flexDirection"]})}><option>column</option><option>row</option></select></Field><Field label="Justify"><select value={style.justifyContent} onChange={e => updateStyle(node.id,{justifyContent:e.target.value as NodeStyle["justifyContent"]})}><option value="flex-start">Start</option><option value="center">Center</option><option value="flex-end">End</option><option value="space-between">Space between</option><option value="space-around">Space around</option></select></Field><Field label="Align"><select value={style.alignItems} onChange={e => updateStyle(node.id,{alignItems:e.target.value as NodeStyle["alignItems"]})}><option>stretch</option><option value="flex-start">Start</option><option value="center">Center</option><option value="flex-end">End</option></select></Field></>}
      {spacingFields.map(([key,label]) => <StyleInput key={key} label={label} value={String(style[key])} onChange={v => updateStyle(node.id,{ [key]: v })}/>)}
    </PropertySection>

    <PropertySection title="Typography">
      <Field label="Text color"><input type="color" value={safeColor(style.color,"#111827")} onChange={e => updateStyle(node.id,{color:e.target.value})}/></Field>
      {typeFields.map(([key,label]) => <StyleInput key={key} label={label} value={String(style[key])} onChange={v => updateStyle(node.id,{ [key]: v })}/>)}
      <Field label="Align"><select value={style.textAlign} onChange={e => updateStyle(node.id,{textAlign:e.target.value as NodeStyle["textAlign"]})}><option>left</option><option>center</option><option>right</option></select></Field>
    </PropertySection>

    <PropertySection title="Fill, border & effects">
      <Field label="Background"><div className="color-row"><input type="color" value={safeColor(style.background,"#ffffff")} onChange={e => updateStyle(node.id,{background:e.target.value})}/><input value={style.background} onChange={e => updateStyle(node.id,{background:e.target.value})}/></div></Field>
      <StyleInput label="Radius" value={style.borderRadius} onChange={v => updateStyle(node.id,{borderRadius:v})}/>
      <StyleInput label="Border width" value={style.borderWidth} onChange={v => updateStyle(node.id,{borderWidth:v})}/>
      <Field label="Border color"><input type="color" value={safeColor(style.borderColor,"#d1d5db")} onChange={e => updateStyle(node.id,{borderColor:e.target.value})}/></Field>
      <Field label="Border style"><select value={style.borderStyle} onChange={e => updateStyle(node.id,{borderStyle:e.target.value as NodeStyle["borderStyle"]})}><option>solid</option><option>dashed</option><option>dotted</option><option>none</option></select></Field>
      <StyleInput label="Shadow" value={style.boxShadow} onChange={v => updateStyle(node.id,{boxShadow:v})}/>
      <Field label="Opacity"><input type="number" min="0" max="1" step="0.05" value={style.opacity} onChange={e => updateStyle(node.id,{opacity:Number(e.target.value)})}/></Field>
      <Field label="Overflow"><select value={style.overflow} onChange={e => updateStyle(node.id,{overflow:e.target.value as NodeStyle["overflow"]})}><option>visible</option><option>hidden</option><option>auto</option></select></Field>
    </PropertySection>

    <PropertySection title="Animation">
      <Field label="Entrance"><select value={node.animation || "none"} onChange={e => set("animation",e.target.value as AnimationName)}>{["none","fade-up","fade-in","slide-left","slide-right","zoom-in","float","pulse","bounce-soft"].map(v => <option key={v}>{v}</option>)}</select></Field>
      <Field label="Hover"><select value={node.hoverAnimation || "none"} onChange={e => set("hoverAnimation",e.target.value as HoverAnimation)}>{["none","lift","scale","glow","tilt"].map(v => <option key={v}>{v}</option>)}</select></Field>
      <Field label="Duration"><input type="number" min="0" step="0.1" value={node.animationDuration ?? .7} onChange={e => set("animationDuration",Number(e.target.value))}/></Field>
      <Field label="Delay"><input type="number" min="0" step="0.05" value={node.animationDelay ?? 0} onChange={e => set("animationDelay",Number(e.target.value))}/></Field>
    </PropertySection>
  </aside>;
}

function safeColor(value:string,fallback:string){return /^#[0-9a-f]{6}$/i.test(value)?value:fallback}
function PropertySection({title,children}:{title:string;children:ReactNode}){return <section className="property-section"><h3>{title}</h3>{children}</section>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="property-field"><span>{label}</span><div>{children}</div></label>}
function StyleInput({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <Field label={label}><input value={value} onChange={e => onChange(e.target.value)}/></Field>}

function TableEditor({ node }: { node: BuilderNode }) {
  const { updateNode } = useBuilder();
  const headers = (node.table?.headers || []).join(", ");
  const rows = (node.table?.rows || []).map(row => row.join(" | ")).join("\n");
  return <>
    <Field label="Headers"><textarea value={headers} onChange={e => updateNode(node.id,{ table:{ headers:e.target.value.split(",").map(v=>v.trim()).filter(Boolean), rows:node.table?.rows || [] } })}/></Field>
    <Field label="Rows"><textarea value={rows} onChange={e => updateNode(node.id,{ table:{ headers:node.table?.headers || [], rows:e.target.value.split("\n").filter(Boolean).map(line=>line.split("|").map(v=>v.trim())) } })} placeholder="Ava | Designer | Active"/></Field>
    <Field label="Striped rows"><label className="toggle-line"><input type="checkbox" checked={!!node.tableStriped} onChange={e => updateNode(node.id,{tableStriped:e.target.checked})}/><span>Alternate row background</span></label></Field>
    <Field label="Compact"><label className="toggle-line"><input type="checkbox" checked={!!node.tableCompact} onChange={e => updateNode(node.id,{tableCompact:e.target.checked})}/><span>Reduced cell padding</span></label></Field>
  </>;
}

function InteractiveItemsEditor({ node }: { node: BuilderNode }) {
  const { updateNode } = useBuilder();
  const text = (node.items || []).map(item => `${item.title} | ${item.body}`).join("\n");
  return <Field label="Items"><textarea value={text} onChange={e => updateNode(node.id,{ items:e.target.value.split("\n").filter(Boolean).map(line=>{const [title,...body]=line.split("|");return {title:(title||"Item").trim(),body:body.join("|").trim()};}) })} placeholder="Title | Content"/></Field>;
}

function CarouselEditor({ node }: { node: BuilderNode }) {
  const { project, updateNode, setSidebarTab } = useBuilder();
  const text = (node.slides || []).map(slide => `${slide.src} | ${slide.caption || ""} | ${slide.alt || ""}`).join("\n");
  const images = project.assets.filter(asset => asset.kind === "image");
  const addAsset = (assetId: string) => {
    if (!assetId) return;
    const asset = images.find(item => item.id === assetId);
    if (!asset) return;
    updateNode(node.id,{ slides:[...(node.slides || []),{src:`asset://${asset.id}`,caption:asset.name,alt:asset.name}] });
  };
  return <>
    <Field label="Slides"><textarea value={text} onChange={e => updateNode(node.id,{ slides:e.target.value.split("\n").filter(Boolean).map(line=>{const [src,caption,alt]=line.split("|");return {src:(src||"").trim(),caption:(caption||"").trim(),alt:(alt||caption||"").trim()};}) })} placeholder="https://image.jpg | Caption | Alt text"/></Field>
    <Field label="Add asset"><div className="media-source-actions"><select defaultValue="" onChange={e => { addAsset(e.target.value); e.currentTarget.value=""; }}><option value="">Choose uploaded image…</option>{images.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select><button type="button" onClick={() => setSidebarTab("assets")}><FolderOpen size={12}/>Assets</button></div></Field>
  </>;
}

function SocialLinksEditor({ node }: { node: BuilderNode }) {
  const { updateNode } = useBuilder();
  const text = (node.links || []).map(link => `${link.label} | ${link.href}`).join("\n");
  return <Field label="Social links"><textarea value={text} onChange={e => updateNode(node.id,{ links:e.target.value.split("\n").filter(Boolean).map(line=>{const [label,...href]=line.split("|");return {label:(label||"Link").trim(),href:href.join("|").trim()};}) })} placeholder="Instagram | https://instagram.com"/></Field>;
}

function MediaSourceEditor({ node }: { node: BuilderNode }) {
  const { project, updateNode, addProjectAsset, setSidebarTab } = useBuilder();
  const fileRef = useRef<HTMLInputElement>(null);
  const kind = node.type as AssetKind;
  const assets = project.assets.filter(asset => asset.kind === kind);
  const currentAssetId = node.src?.startsWith("asset://") ? node.src.slice("asset://".length) : "";
  const upload = async (file?: File) => {
    if (!file) return;
    const expected = kind === "image" ? file.type.startsWith("image/") : file.type.startsWith("video/");
    if (!expected) { alert(`Choose a ${kind} file.`); return; }
    const asset = await createUploadedAsset(project.id, file, kind);
    addProjectAsset(asset);
    updateNode(node.id, { src: `asset://${asset.id}` });
    if (fileRef.current) fileRef.current.value = "";
  };
  return <>
    <Field label="Media">
      <div className="media-source-actions"><button type="button" onClick={() => fileRef.current?.click()}><Upload size={12}/>Upload</button><button type="button" onClick={() => setSidebarTab("assets")}><FolderOpen size={12}/>Assets</button></div>
      <input ref={fileRef} hidden type="file" accept={kind === "image" ? "image/*" : "video/*"} onChange={e => upload(e.target.files?.[0])}/>
    </Field>
    {!!assets.length && <Field label="Project asset"><select value={currentAssetId} onChange={e => e.target.value && updateNode(node.id,{src:`asset://${e.target.value}`})}><option value="">Choose asset…</option>{assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></Field>}
    <Field label="External URL"><div className="media-url-row"><Link2 size={12}/><input value={node.src?.startsWith("asset://") ? "" : (node.src || "")} onChange={e => updateNode(node.id,{src:e.target.value})} placeholder={`https://…/${kind === "image" ? "image.jpg" : "video.mp4"}`}/></div></Field>
    {currentAssetId && <div className="source-detail"><span>Selected asset</span><code>{assets.find(a => a.id === currentAssetId)?.name || currentAssetId}</code></div>}
  </>;
}
