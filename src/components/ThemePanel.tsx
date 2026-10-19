import { Paintbrush, Plus, RefreshCw, Save, Sparkles, Trash2 } from "lucide-react";
import { useBuilder } from "../store/builder";
import { themePresets } from "../templates/themes";
import type { ProjectTheme, ThemeColors } from "../types";

const colorFields: Array<[keyof ThemeColors,string]> = [
  ["background","Background"],["surface","Surface"],["surfaceAlt","Surface alt"],["text","Text"],["muted","Muted"],
  ["primary","Primary"],["primaryText","Primary text"],["secondary","Secondary"],["border","Border"],
  ["success","Success"],["warning","Warning"],["danger","Danger"]
];

export default function ThemePanel(){
  const { project, setTheme, saveCurrentTheme, deleteSavedTheme, restyleCurrentPage } = useBuilder();
  const updateColor = (key:keyof ThemeColors,value:string) => setTheme({ ...project.theme, id:"custom", name:"Custom Theme", source:"custom", colors:{...project.theme.colors,[key]:value} });
  const update = (patch:Partial<ProjectTheme>) => setTheme({ ...project.theme, ...patch, id:"custom", name:"Custom Theme", source:"custom" });
  const allThemes = [...themePresets, ...project.savedThemes];
  const save = () => { const name = window.prompt("Theme name", project.theme.name === "Custom Theme" ? "My Theme" : project.theme.name); if(name?.trim()) saveCurrentTheme(name.trim()); };
  return <section className="panel-body theme-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Design system registry</span><h2>Themes</h2></div><Paintbrush size={17}/></div>
    <p className="panel-copy">Theme tokens power native, prompt-imported and template blocks. Save custom themes into this project and reuse them without changing content.</p>
    <div className="theme-grid">{allThemes.map(theme=><div key={theme.id} className={`theme-card-wrap ${project.theme.id===theme.id?"active":""}`}>
      <button className="theme-card" onClick={()=>setTheme(theme)}>
        <div className="theme-swatches"><i style={{background:theme.colors.background}}/><i style={{background:theme.colors.surface}}/><i style={{background:theme.colors.primary}}/><i style={{background:theme.colors.secondary}}/></div>
        <strong>{theme.name}</strong><span>{theme.source === "custom" ? "Saved · " : theme.source === "prompt" ? "Prompt · " : "Preset · "}{theme.radius}</span>
      </button>
      {project.savedThemes.some(item=>item.id===theme.id)&&<button className="theme-delete" title="Delete saved theme" onClick={()=>deleteSavedTheme(theme.id)}><Trash2 size={12}/></button>}
    </div>)}</div>
    <div className="theme-editor">
      <div className="library-group-title">Theme tokens</div>
      {colorFields.map(([key,label])=><label className="theme-color-row" key={key}><span>{label}</span><input type="color" value={normalizeColor(project.theme.colors[key])} onChange={e=>updateColor(key,e.target.value)}/><code>{project.theme.colors[key]}</code></label>)}
      <label className="theme-input-row"><span>Radius</span><input value={project.theme.radius} onChange={e=>update({radius:e.target.value})}/></label>
      <label className="theme-input-row"><span>Shadow</span><input value={project.theme.shadow} onChange={e=>update({shadow:e.target.value})}/></label>
      <label className="theme-input-row"><span>Body font</span><input value={project.theme.typography.body} onChange={e=>update({typography:{...project.theme.typography,body:e.target.value}})}/></label>
      <label className="theme-input-row"><span>Heading font</span><input value={project.theme.typography.heading} onChange={e=>update({typography:{...project.theme.typography,heading:e.target.value}})}/></label>
    </div>
    <div className="theme-action-row"><button className="phase4-secondary" onClick={save}><Save size={14}/>Save theme</button><button className="phase4-primary" onClick={restyleCurrentPage}><RefreshCw size={14}/>Restyle current page</button></div>
    <div className="prompt-safe-note"><Sparkles size={14}/><span>Paste CSS variables or a theme config in Import. Nila Webs can detect theme tokens and add them to this registry.</span></div>
    <div className="theme-registry-note"><Plus size={13}/><span>{themePresets.length} presets · {project.savedThemes.length} saved project theme{project.savedThemes.length===1?"":"s"}</span></div>
  </section>;
}

function normalizeColor(value:string){ return /^#[0-9a-f]{6}$/i.test(value) ? value : "#7c3aed"; }
