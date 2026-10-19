import { Gauge, Paintbrush, Plus, RefreshCw, Save, Sparkles, Trash2 } from "lucide-react";
import { useBuilder } from "../store/builder";
import { themePresets } from "../templates/themes";
import { auditResponsiveProject } from "../lib/design-system";
import type { DesignSystem, ProjectTheme, ThemeColors, Viewport } from "../types";

const colorFields: Array<[keyof ThemeColors,string]> = [
  ["background","Background"],["surface","Surface"],["surfaceAlt","Surface alt"],["text","Text"],["muted","Muted"],
  ["primary","Primary"],["primaryText","Primary text"],["secondary","Secondary"],["border","Border"],
  ["success","Success"],["warning","Warning"],["danger","Danger"]
];
const spacingFields:Array<[keyof DesignSystem["spacing"],string]>=[["xs","XS"],["sm","SM"],["md","MD"],["lg","LG"],["xl","XL"],["xxl","2XL"]];
const typeFields:Array<[keyof DesignSystem["typography"],string]>=[["xs","XS"],["sm","SM"],["base","Base"],["lg","LG"],["xl","XL"],["xxl","2XL"],["display","Display"]];

export default function ThemePanel(){
  const { project, setTheme, saveCurrentTheme, deleteSavedTheme, restyleCurrentPage, setDesignSystem, applyResponsiveDefaults } = useBuilder();
  const audit=auditResponsiveProject(project);
  const updateColor = (key:keyof ThemeColors,value:string) => setTheme({ ...project.theme, id:"custom", name:"Custom Theme", source:"custom", colors:{...project.theme.colors,[key]:value} });
  const update = (patch:Partial<ProjectTheme>) => setTheme({ ...project.theme, ...patch, id:"custom", name:"Custom Theme", source:"custom" });
  const allThemes = [...themePresets, ...project.savedThemes];
  const save = () => { const name = window.prompt("Theme name", project.theme.name === "Custom Theme" ? "My Theme" : project.theme.name); if(name?.trim()) saveCurrentTheme(name.trim()); };
  const setPadding=(viewport:Viewport,value:string)=>setDesignSystem({contentPadding:{...project.designSystem.contentPadding,[viewport]:value}});
  return <section className="panel-body theme-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Design system registry</span><h2>Themes & Responsive</h2></div><Paintbrush size={17}/></div>
    <p className="panel-copy">Theme and responsive tokens power native, prompt-imported and template blocks. Desktop is the base; Tablet and Mobile inherit safely.</p>
    <div className="responsive-health"><div className={`responsive-score ${audit.score>=95?"good":audit.score>=80?"warn":"bad"}`}><Gauge size={16}/><strong>{audit.score}%</strong></div><div><b>Responsive health</b><span>{audit.ready}/{audit.total} nodes ready · {audit.overflowRisk} overflow risk</span></div><button onClick={applyResponsiveDefaults}>Auto-fix all</button></div>
    <div className="design-editor">
      <div className="library-group-title">Preview & runtime breakpoints</div>
      <div className="design-grid three"><NumberToken label="Desktop preview" value={project.designSystem.breakpoints.previewDesktop} onChange={v=>setDesignSystem({breakpoints:{...project.designSystem.breakpoints,previewDesktop:v}})}/><NumberToken label="Tablet preview" value={project.designSystem.breakpoints.previewTablet} onChange={v=>setDesignSystem({breakpoints:{...project.designSystem.breakpoints,previewTablet:v}})}/><NumberToken label="Mobile preview" value={project.designSystem.breakpoints.previewMobile} onChange={v=>setDesignSystem({breakpoints:{...project.designSystem.breakpoints,previewMobile:v}})}/><NumberToken label="Mobile max" value={project.designSystem.breakpoints.mobileMax} onChange={v=>setDesignSystem({breakpoints:{...project.designSystem.breakpoints,mobileMax:v}})}/><NumberToken label="Tablet max" value={project.designSystem.breakpoints.tabletMax} onChange={v=>setDesignSystem({breakpoints:{...project.designSystem.breakpoints,tabletMax:v}})}/><label className="theme-input-row"><span>Container max</span><input value={project.designSystem.containerMaxWidth} onChange={e=>setDesignSystem({containerMaxWidth:e.target.value})}/></label></div>
      <div className="library-group-title">Responsive page padding</div><div className="design-grid three">{(["desktop","tablet","mobile"] as Viewport[]).map(v=><label className="theme-input-row" key={v}><span>{v}</span><input value={project.designSystem.contentPadding[v]} onChange={e=>setPadding(v,e.target.value)}/></label>)}</div>
      <div className="library-group-title">Spacing scale</div><div className="design-grid">{spacingFields.map(([key,label])=><label className="theme-input-row" key={key}><span>{label}</span><input value={project.designSystem.spacing[key]} onChange={e=>setDesignSystem({spacing:{...project.designSystem.spacing,[key]:e.target.value}})}/></label>)}</div>
      <div className="library-group-title">Typography scale</div><div className="design-grid">{typeFields.map(([key,label])=><label className="theme-input-row" key={key}><span>{label}</span><input value={project.designSystem.typography[key]} onChange={e=>setDesignSystem({typography:{...project.designSystem.typography,[key]:e.target.value}})}/></label>)}</div>
      <label className="toggle-line design-toggle"><input type="checkbox" checked={project.designSystem.autoResponsive} onChange={e=>setDesignSystem({autoResponsive:e.target.checked})}/><span>Automatically generate safe responsive overrides for new/imported blocks</span></label>
      <label className="toggle-line design-toggle"><input type="checkbox" checked={project.designSystem.reducedMotion} onChange={e=>setDesignSystem({reducedMotion:e.target.checked})}/><span>Respect reduced-motion accessibility preference</span></label>
    </div>
    <div className="theme-grid">{allThemes.map(theme=><div key={theme.id} className={`theme-card-wrap ${project.theme.id===theme.id?"active":""}`}>
      <button className="theme-card" onClick={()=>setTheme(theme)}><div className="theme-swatches"><i style={{background:theme.colors.background}}/><i style={{background:theme.colors.surface}}/><i style={{background:theme.colors.primary}}/><i style={{background:theme.colors.secondary}}/></div><strong>{theme.name}</strong><span>{theme.source === "custom" ? "Saved · " : theme.source === "prompt" ? "Prompt · " : "Preset · "}{theme.radius}</span></button>
      {project.savedThemes.some(item=>item.id===theme.id)&&<button className="theme-delete" title="Delete saved theme" onClick={()=>deleteSavedTheme(theme.id)}><Trash2 size={12}/></button>}
    </div>)}</div>
    <div className="theme-editor"><div className="library-group-title">Theme tokens</div>{colorFields.map(([key,label])=><label className="theme-color-row" key={key}><span>{label}</span><input type="color" value={normalizeColor(project.theme.colors[key])} onChange={e=>updateColor(key,e.target.value)}/><code>{project.theme.colors[key]}</code></label>)}<label className="theme-input-row"><span>Radius</span><input value={project.theme.radius} onChange={e=>update({radius:e.target.value})}/></label><label className="theme-input-row"><span>Shadow</span><input value={project.theme.shadow} onChange={e=>update({shadow:e.target.value})}/></label><label className="theme-input-row"><span>Body font</span><input value={project.theme.typography.body} onChange={e=>update({typography:{...project.theme.typography,body:e.target.value}})}/></label><label className="theme-input-row"><span>Heading font</span><input value={project.theme.typography.heading} onChange={e=>update({typography:{...project.theme.typography,heading:e.target.value}})}/></label></div>
    <div className="theme-action-row"><button className="phase4-secondary" onClick={save}><Save size={14}/>Save theme</button><button className="phase4-primary" onClick={restyleCurrentPage}><RefreshCw size={14}/>Restyle current page</button></div>
    <div className="prompt-safe-note"><Sparkles size={14}/><span>Design tokens are exported as CSS variables, so elements, components and themes stay responsive outside the builder too.</span></div><div className="theme-registry-note"><Plus size={13}/><span>{themePresets.length} presets · {project.savedThemes.length} saved project theme{project.savedThemes.length===1?"":"s"}</span></div>
  </section>;
}
function NumberToken({label,value,onChange}:{label:string;value:number;onChange:(v:number)=>void}){return <label className="theme-input-row"><span>{label}</span><input type="number" min="280" value={value} onChange={e=>onChange(Number(e.target.value)||0)}/></label>}
function normalizeColor(value:string){ return /^#[0-9a-f]{6}$/i.test(value) ? value : "#7c3aed"; }
