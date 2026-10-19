import type { ReactNode } from "react";
import { ClipboardCopy, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { getNodeAnywhere, useBuilder } from "../store/builder";
import type { AnimationName, HoverAnimation, NodeStyle } from "../types";
import { resolveStyle } from "../lib/nodes";

const sizeFields: Array<[keyof NodeStyle, string]> = [["width","Width"],["maxWidth","Max width"],["height","Height"],["minHeight","Min height"]];
const spacingFields: Array<[keyof NodeStyle, string]> = [["padding","Padding"],["margin","Margin"],["gap","Gap"]];
const typeFields: Array<[keyof NodeStyle, string]> = [["fontSize","Font size"],["fontWeight","Weight"],["lineHeight","Line height"],["letterSpacing","Letter spacing"]];

export default function PropertiesPanel() {
  const { project, selectedId, viewport, updateNode, updateStyle, setNodeHidden, deleteNode, duplicateNode, copyNode, pasteNode, clipboard } = useBuilder();
  const node = selectedId ? getNodeAnywhere(project, selectedId) : undefined;
  if (!node) return <aside className="properties-panel empty-properties"><div className="empty-property-state"><div className="empty-property-icon">◫</div><strong>Select an element</strong><p>Click any block on the canvas or choose it from Layers to edit content, responsive layout, animation and links.</p>{clipboard && <button className="secondary-button" onClick={() => pasteNode(null)}><ClipboardCopy size={14}/>Paste copied element</button>}</div></aside>;
  const style = resolveStyle(node, viewport);
  const set = <K extends keyof typeof node>(key: K, value: (typeof node)[K]) => updateNode(node.id, { [key]: value });
  const global = node.type === "navbar" || node.type === "footer";
  return <aside className="properties-panel">
    <div className="property-header"><div><span className="panel-kicker">{viewport} properties</span><h2>{node.name}</h2><span className="node-type-chip">{node.type}</span></div><div className="property-actions"><button onClick={() => setNodeHidden(node.id, viewport, !node.hiddenOn?.[viewport])} title="Toggle visibility">{node.hiddenOn?.[viewport] ? <EyeOff size={14}/> : <Eye size={14}/>}</button>{!global && <><button onClick={() => copyNode(node.id)} title="Copy"><ClipboardCopy size={14}/></button><button onClick={() => duplicateNode(node.id)} title="Duplicate"><Copy size={14}/></button><button className="danger" onClick={() => deleteNode(node.id)} title="Delete"><Trash2 size={14}/></button></>}</div></div>

    <PropertySection title="Content">
      {["heading","text","button","label","icon"].includes(node.type) && <Field label="Text"><textarea value={node.content || ""} onChange={e => set("content", e.target.value)}/></Field>}
      {["image","video"].includes(node.type) && <Field label="Source URL"><textarea value={node.src || ""} onChange={e => set("src", e.target.value)}/></Field>}
      {node.type === "image" && <Field label="Alt text"><input value={node.alt || ""} onChange={e => set("alt", e.target.value)}/></Field>}
      {["input","textarea"].includes(node.type) && <Field label="Placeholder"><input value={node.placeholder || ""} onChange={e => set("placeholder", e.target.value)}/></Field>}
      {node.type === "select" && <Field label="Options"><textarea value={(node.options || []).join("\n")} onChange={e => set("options", e.target.value.split("\n").filter(Boolean))}/></Field>}
      {node.type === "button" && <><Field label="Link"><input value={node.href || ""} onChange={e => set("href", e.target.value)} placeholder="/about or https://..."/></Field><Field label="Open in"><select value={node.target || "_self"} onChange={e => set("target", e.target.value as "_self"|"_blank")}><option value="_self">Same tab</option><option value="_blank">New tab</option></select></Field></>}
      {node.meta?.sourceId && <div className="source-detail"><span>Block source</span><code>{String(node.meta.sourceId)}</code></div>}
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
