import { useRef } from "react";
import type { ReactNode } from "react";
import { ClipboardCopy, Copy, Eye, EyeOff, FolderOpen, Link2, RefreshCw, Save, Trash2, Unlink, Upload } from "lucide-react";
import { getNodeAnywhere, useBuilder } from "../store/builder";
import type { AnimationName, AssetKind, BuilderNode, HoverAnimation, InputKind, NodeStyle } from "../types";
import { resolveStyle } from "../lib/nodes";
import { createUploadedAsset } from "../lib/assets";

const sizeFields: Array<[keyof NodeStyle, string]> = [["width","Width"],["maxWidth","Max width"],["height","Height"],["minHeight","Min height"]];
const spacingFields: Array<[keyof NodeStyle, string]> = [["padding","Padding"],["margin","Margin"],["gap","Gap"]];
const typeFields: Array<[keyof NodeStyle, string]> = [["fontSize","Font size"],["fontWeight","Weight"],["lineHeight","Line height"],["letterSpacing","Letter spacing"]];
const inputKinds: InputKind[] = ["text","email","password","number","date","datetime-local","time","tel","url","search"];

export default function PropertiesPanel() {
  const { project, selectedId, viewport, updateNode, updateStyle, setNodeHidden, deleteNode, duplicateNode, copyNode, pasteNode, clipboard, saveNodeAsComponent, syncComponentFromNode, detachComponent, deleteComponent } = useBuilder();
  const node = selectedId ? getNodeAnywhere(project, selectedId) : undefined;
  if (!node) return <aside className="properties-panel empty-properties"><div className="empty-property-state"><div className="empty-property-icon">◫</div><strong>Select an element</strong><p>Click any block on the canvas or choose it from Layers to edit content, responsive layout, validation, accessibility, animation and links.</p>{clipboard && <button className="secondary-button" onClick={() => pasteNode(null)}><ClipboardCopy size={14}/>Paste copied element</button>}</div></aside>;
  const style = resolveStyle(node, viewport);
  const set = <K extends keyof BuilderNode>(key: K, value: BuilderNode[K]) => updateNode(node.id, { [key]: value });
  const global = node.type === "navbar" || node.type === "footer";
  const component = node.componentId ? project.components.find(item => item.id === node.componentId) : undefined;
  const formField = ["input","textarea","select","checkbox","radio","range","file"].includes(node.type);

  return <aside className="properties-panel">
    <div className="property-header"><div><span className="panel-kicker">{viewport} properties</span><h2>{node.name}</h2><span className="node-type-chip">{node.type}</span></div><div className="property-actions"><button onClick={() => setNodeHidden(node.id, viewport, !node.hiddenOn?.[viewport])} title="Toggle visibility">{node.hiddenOn?.[viewport] ? <EyeOff size={14}/> : <Eye size={14}/>}</button>{!global && <><button onClick={() => copyNode(node.id)} title="Copy"><ClipboardCopy size={14}/></button><button onClick={() => duplicateNode(node.id)} title="Duplicate"><Copy size={14}/></button><button className="danger" onClick={() => deleteNode(node.id)} title="Delete"><Trash2 size={14}/></button></>}</div></div>

    <PropertySection title="Content">
      {["heading","text","button","link","badge","label","icon","checkbox","radio","switch","range","file","modal","code","alert","progress","rating"].includes(node.type) && <Field label={node.type === "radio" ? "Legend" : node.type === "modal" ? "Trigger text" : node.type === "code" ? "Code" : "Text"}><textarea value={node.content || ""} onChange={e => set("content", e.target.value)}/></Field>}
      {node.type === "html" && <><div className="responsive-note">Custom HTML is isolated in a sandboxed iframe. Scripts, top navigation and storage access are not granted.</div><Field label="HTML"><textarea className="code-textarea" value={node.html ?? node.content ?? ""} onChange={e => set("html", e.target.value)}/></Field></>}
      {["image","video","avatar"].includes(node.type) && <MediaSourceEditor node={node} kind={node.type === "video" ? "video" : "image"}/>}
      {["image","avatar"].includes(node.type) && <Field label="Alt text"><input value={node.alt || ""} onChange={e => set("alt", e.target.value)}/></Field>}
      {["input","textarea"].includes(node.type) && <Field label="Placeholder"><input value={node.placeholder || ""} onChange={e => set("placeholder", e.target.value)}/></Field>}
      {node.type === "input" && <Field label="Input type"><select value={node.inputType || "text"} onChange={e => set("inputType", e.target.value as InputKind)}>{inputKinds.map(kind => <option key={kind}>{kind}</option>)}</select></Field>}
      {["select","list","radio"].includes(node.type) && <Field label="Options"><textarea value={(node.options || []).join("\n")} onChange={e => set("options", e.target.value.split("\n").map(v => v.trim()).filter(Boolean))}/></Field>}
      {node.type === "list" && <Field label="List style"><select value={node.listStyle === "none" ? "none" : (node.ordered ?? node.listStyle === "decimal") ? "ordered" : "unordered"} onChange={e => { const value=e.target.value; set("ordered", value === "ordered"); set("listStyle", value === "none" ? "none" : value === "ordered" ? "decimal" : "disc"); }}><option value="unordered">Bullets</option><option value="ordered">Numbered</option><option value="none">No marker</option></select></Field>}
      {["button","link"].includes(node.type) && <><Field label="Link"><input value={node.href || ""} onChange={e => set("href", e.target.value)} placeholder="/about or https://..."/></Field><Field label="Open in"><select value={node.target || "_self"} onChange={e => set("target", e.target.value as "_self"|"_blank")}><option value="_self">Same tab</option><option value="_blank">New tab</option></select></Field></>}
      {["checkbox","switch"].includes(node.type) && <Field label="Default state"><label className="toggle-line"><input type="checkbox" checked={!!node.checked} onChange={e => set("checked",e.target.checked)}/><span>{node.checked ? "On / checked" : "Off / unchecked"}</span></label></Field>}
      {node.type === "range" && <NumberRangeFields node={node}/>} 
      {["embed","map"].includes(node.type) && <><Field label="Embed URL"><textarea value={node.src || ""} onChange={e => set("src",e.target.value)} placeholder="https://..."/></Field><Field label="Frame title"><input value={node.alt || ""} onChange={e => set("alt",e.target.value)}/></Field></>}
      {node.type === "table" && <TableEditor node={node}/>}
      {["tabs","accordion"].includes(node.type) && <><InteractiveItemsEditor node={node}/><Field label="Default open index"><input type="number" min="0" value={node.defaultIndex ?? 0} onChange={e => set("defaultIndex",Math.max(0,Number(e.target.value)))}/></Field></>}
      {node.type === "carousel" && <CarouselEditor node={node}/>}
      {["socials","breadcrumb"].includes(node.type) && <SocialLinksEditor node={node} label={node.type === "breadcrumb" ? "Breadcrumb links" : "Social links"}/>} 
      {node.type === "modal" && <><Field label="Close on backdrop"><label className="toggle-line"><input type="checkbox" checked={(node.closeOnBackdrop ?? node.modalCloseOnBackdrop) !== false} onChange={e => set("closeOnBackdrop",e.target.checked)}/><span>{(node.closeOnBackdrop ?? node.modalCloseOnBackdrop) !== false ? "Enabled" : "Disabled"}</span></label></Field><Field label="Dialog width"><input value={node.modalWidth || "560px"} onChange={e => set("modalWidth",e.target.value)} placeholder="560px"/></Field></>}
      {node.type === "alert" && <Field label="Variant"><select value={String(node.meta?.variant || "info")} onChange={e => set("meta",{...(node.meta || {}),variant:e.target.value})}><option>info</option><option>success</option><option>warning</option><option>danger</option></select></Field>}
      {node.type === "progress" && <NumberRangeFields node={node}/>} 
      {node.type === "rating" && <><Field label="Rating"><input type="number" min="0" max={node.max || 5} step="0.5" value={Number(node.value || 0)} onChange={e => set("value",e.target.value)}/></Field><Field label="Stars"><input type="number" min="1" max="10" value={node.max || 5} onChange={e => set("max",Math.max(1,Number(e.target.value)))}/></Field></>}
      {node.meta?.sourceId && <div className="source-detail"><span>Block source</span><code>{String(node.meta.sourceId)}</code></div>}
    </PropertySection>

    {(formField || node.type === "form") && <PropertySection title="Form & validation">
      {node.type === "form" ? <><Field label="Submit URL"><input value={node.formAction || ""} onChange={e => set("formAction",e.target.value)} placeholder="https://... or /api/contact"/></Field><Field label="Method"><select value={node.formMethod || "post"} onChange={e => set("formMethod",e.target.value as "get"|"post")}><option value="post">POST</option><option value="get">GET</option></select></Field></> : <>
        <Field label="Field name"><input value={node.nameAttr || ""} onChange={e => set("nameAttr",e.target.value)}/></Field>
        {!(["range","file"].includes(node.type)) && <Field label="Default value"><input value={node.value || ""} onChange={e => set("value",e.target.value)}/></Field>}
        <Field label="Required"><label className="toggle-line"><input type="checkbox" checked={!!node.required} onChange={e => set("required",e.target.checked)}/><span>{node.required ? "Required" : "Optional"}</span></label></Field>
        {["input","textarea"].includes(node.type) && <><Field label="Minimum length"><input type="number" min="0" value={node.minLength ?? ""} onChange={e => set("minLength",e.target.value === "" ? undefined : Number(e.target.value))}/></Field><Field label="Maximum length"><input type="number" min="0" value={node.maxLength ?? ""} onChange={e => set("maxLength",e.target.value === "" ? undefined : Number(e.target.value))}/></Field><Field label="Autocomplete"><input value={node.autocomplete || ""} onChange={e => set("autocomplete",e.target.value)} placeholder="name, email, current-password…"/></Field></>}
        {node.type === "input" && <Field label="Validation pattern"><input value={node.pattern || ""} onChange={e => set("pattern",e.target.value)} placeholder="Optional regular expression"/></Field>}
        {node.type === "textarea" && <Field label="Rows"><input type="number" min="1" value={node.rows || 4} onChange={e => set("rows",Math.max(1,Number(e.target.value)))}/></Field>}
        {node.type === "file" && <><Field label="Accepted types"><input value={node.accept || ""} onChange={e => set("accept",e.target.value)} placeholder="image/*,.pdf"/></Field><Field label="Multiple files"><label className="toggle-line"><input type="checkbox" checked={!!node.multiple} onChange={e => set("multiple",e.target.checked)}/><span>{node.multiple ? "Allowed" : "Single file"}</span></label></Field></>}
      </>}
    </PropertySection>}

    <PropertySection title="Reusable component">
      {!node.componentId ? <button className="secondary-button property-wide-action" onClick={() => { const name = window.prompt("Component name", node.componentName || node.name); if (name?.trim()) saveNodeAsComponent(node.id,name.trim()); }}><Save size={14}/>Save as component</button> : <>
        <div className="source-detail"><span>Linked component</span><code>{component?.name || node.componentName || node.componentId}</code></div>
        <div className="component-action-row"><button className="secondary-button" onClick={() => syncComponentFromNode(node.id)}><RefreshCw size={13}/>Sync changes</button><button className="secondary-button" onClick={() => detachComponent(node.id)}><Unlink size={13}/>Detach</button></div>
        {component && <button className="danger-outline property-wide-action" onClick={() => { if (confirm(`Delete component “${component.name}”? Instances will be detached.`)) deleteComponent(component.id); }}><Trash2 size={13}/>Delete component definition</button>}
      </>}
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

    <PropertySection title="Accessibility">
      <Field label="ARIA label"><input value={node.ariaLabel || ""} onChange={e => set("ariaLabel",e.target.value)} placeholder="Accessible name"/></Field>
      <Field label="Title / tooltip"><input value={node.titleAttr || ""} onChange={e => set("titleAttr",e.target.value)}/></Field>
      <Field label="ARIA role"><input value={node.roleAttr || ""} onChange={e => set("roleAttr",e.target.value)} placeholder="status, navigation, region…"/></Field>
      <Field label="Tab index"><input type="number" value={node.tabIndex ?? ""} onChange={e => set("tabIndex",e.target.value === "" ? undefined : Number(e.target.value))}/></Field>
      {["image","avatar"].includes(node.type) && !node.alt && <div className="a11y-warning">Add alt text for meaningful images.</div>}
      {["embed","map"].includes(node.type) && !node.alt && <div className="a11y-warning">Add a descriptive frame title.</div>}
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

function NumberRangeFields({ node }: { node: BuilderNode }) {
  const { updateNode } = useBuilder();
  return <><Field label="Value"><input type="number" value={Number(node.value ?? 50)} onChange={e => updateNode(node.id,{value:e.target.value})}/></Field><Field label="Minimum"><input type="number" value={node.min ?? 0} onChange={e => updateNode(node.id,{min:Number(e.target.value)})}/></Field><Field label="Maximum"><input type="number" value={node.max ?? 100} onChange={e => updateNode(node.id,{max:Number(e.target.value)})}/></Field><Field label="Step"><input type="number" value={node.step ?? 1} onChange={e => updateNode(node.id,{step:Number(e.target.value)})}/></Field></>;
}

function TableEditor({ node }: { node: BuilderNode }) {
  const { updateNode } = useBuilder();
  const headers = (node.table?.headers || []).join(", ");
  const rows = (node.table?.rows || []).map(row => row.join(" | ")).join("\n");
  return <>
    <Field label="Caption"><input value={node.table?.caption || ""} onChange={e => updateNode(node.id,{ table:{ headers:node.table?.headers || [], rows:node.table?.rows || [], caption:e.target.value } })}/></Field>
    <Field label="Headers"><textarea value={headers} onChange={e => updateNode(node.id,{ table:{ ...node.table, headers:e.target.value.split(",").map(v=>v.trim()).filter(Boolean), rows:node.table?.rows || [] } })}/></Field>
    <Field label="Rows"><textarea value={rows} onChange={e => updateNode(node.id,{ table:{ ...node.table, headers:node.table?.headers || [], rows:e.target.value.split("\n").filter(Boolean).map(line=>line.split("|").map(v=>v.trim())) } })} placeholder="Ava | Designer | Active"/></Field>
    <Field label="Striped rows"><label className="toggle-line"><input type="checkbox" checked={!!node.tableStriped} onChange={e => updateNode(node.id,{tableStriped:e.target.checked})}/><span>{node.tableStriped ? "On" : "Off"}</span></label></Field>
    <Field label="Compact"><label className="toggle-line"><input type="checkbox" checked={!!node.tableCompact} onChange={e => updateNode(node.id,{tableCompact:e.target.checked})}/><span>{node.tableCompact ? "On" : "Off"}</span></label></Field>
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
    const asset = images.find(item => item.id === assetId); if (!asset) return;
    updateNode(node.id,{ slides:[...(node.slides || []),{src:`asset://${asset.id}`,caption:asset.name,alt:asset.name}] });
  };
  return <>
    <Field label="Slides"><textarea value={text} onChange={e => updateNode(node.id,{ slides:e.target.value.split("\n").filter(Boolean).map(line=>{const [src,caption,alt]=line.split("|");return {src:(src||"").trim(),caption:(caption||"").trim(),alt:(alt||caption||"").trim()};}) })} placeholder="https://image.jpg | Caption | Alt text"/></Field>
    <Field label="Add asset"><div className="media-source-actions"><select defaultValue="" onChange={e => { addAsset(e.target.value); e.currentTarget.value=""; }}><option value="">Choose uploaded image…</option>{images.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select><button type="button" onClick={() => setSidebarTab("assets")}><FolderOpen size={12}/>Assets</button></div></Field>
    <Field label="Autoplay"><label className="toggle-line"><input type="checkbox" checked={!!(node.autoplay ?? node.carouselAutoplay)} onChange={e => updateNode(node.id,{autoplay:e.target.checked})}/><span>{(node.autoplay ?? node.carouselAutoplay) ? "On" : "Off"}</span></label></Field>
    <Field label="Interval (ms)"><input type="number" min="1200" step="100" value={node.interval ?? node.carouselInterval ?? 4500} onChange={e => updateNode(node.id,{interval:Math.max(1200,Number(e.target.value))})}/></Field>
    <Field label="Show arrows"><label className="toggle-line"><input type="checkbox" checked={node.carouselShowArrows !== false} onChange={e => updateNode(node.id,{carouselShowArrows:e.target.checked})}/><span>{node.carouselShowArrows !== false ? "Shown" : "Hidden"}</span></label></Field>
    <Field label="Show dots"><label className="toggle-line"><input type="checkbox" checked={(node.showDots ?? node.carouselShowDots) !== false} onChange={e => updateNode(node.id,{showDots:e.target.checked})}/><span>{(node.showDots ?? node.carouselShowDots) !== false ? "Shown" : "Hidden"}</span></label></Field>
  </>;
}

function SocialLinksEditor({ node, label }: { node: BuilderNode; label: string }) {
  const { updateNode } = useBuilder();
  const text = (node.links || []).map(link => `${link.label} | ${link.href}`).join("\n");
  return <Field label={label}><textarea value={text} onChange={e => updateNode(node.id,{ links:e.target.value.split("\n").filter(Boolean).map(line=>{const [linkLabel,...href]=line.split("|");return {label:(linkLabel||"Link").trim(),href:href.join("|").trim()};}) })} placeholder="Instagram | https://instagram.com"/></Field>;
}

function MediaSourceEditor({ node, kind }: { node: BuilderNode; kind: AssetKind }) {
  const { project, updateNode, addProjectAsset, setSidebarTab } = useBuilder();
  const fileRef = useRef<HTMLInputElement>(null);
  const assets = project.assets.filter(asset => asset.kind === kind);
  const currentAssetId = node.src?.startsWith("asset://") ? node.src.slice("asset://".length) : "";
  const upload = async (file?: File) => {
    if (!file) return;
    const expected = kind === "image" ? file.type.startsWith("image/") : file.type.startsWith("video/");
    if (!expected) { alert(`Choose a ${kind} file.`); return; }
    const asset = await createUploadedAsset(project.id, file, kind);
    addProjectAsset(asset); updateNode(node.id, { src: `asset://${asset.id}` });
    if (fileRef.current) fileRef.current.value = "";
  };
  return <>
    <Field label="Media"><div className="media-source-actions"><button type="button" onClick={() => fileRef.current?.click()}><Upload size={12}/>Upload</button><button type="button" onClick={() => setSidebarTab("assets")}><FolderOpen size={12}/>Assets</button></div><input ref={fileRef} hidden type="file" accept={kind === "image" ? "image/*" : "video/*"} onChange={e => upload(e.target.files?.[0])}/></Field>
    {!!assets.length && <Field label="Project asset"><select value={currentAssetId} onChange={e => e.target.value && updateNode(node.id,{src:`asset://${e.target.value}`})}><option value="">Choose asset…</option>{assets.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></Field>}
    <Field label="External URL"><div className="media-url-row"><Link2 size={12}/><input value={node.src?.startsWith("asset://") ? "" : (node.src || "")} onChange={e => updateNode(node.id,{src:e.target.value})} placeholder={`https://…/${kind === "image" ? "image.jpg" : "video.mp4"}`}/></div></Field>
    {currentAssetId && <div className="source-detail"><span>Selected asset</span><code>{assets.find(a => a.id === currentAssetId)?.name || currentAssetId}</code></div>}
  </>;
}
