import { Paintbrush, RefreshCw, Sparkles } from "lucide-react";
import { useBuilder } from "../store/builder";
import { themePresets } from "../templates/themes";
import type { ProjectTheme, ThemeColors } from "../types";

const colorFields: Array<[keyof ThemeColors,string]> = [
  ["background","Background"],["surface","Surface"],["text","Text"],["muted","Muted"],["primary","Primary"],["secondary","Secondary"],["border","Border"]
];

export default function ThemePanel(){
  const { project, setTheme, restyleCurrentPage } = useBuilder();
  const updateColor = (key:keyof ThemeColors,value:string) => setTheme({ ...project.theme, id:"custom", name:"Custom Theme", colors:{...project.theme.colors,[key]:value} });
  const update = (patch:Partial<ProjectTheme>) => setTheme({ ...project.theme, ...patch, id:"custom", name:"Custom Theme" });
  return <section className="panel-body theme-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Design system</span><h2>Themes</h2></div><Paintbrush size={17}/></div>
    <p className="panel-copy">Theme tokens power prompt-imported blocks and can restyle the current page without changing its content.</p>
    <div className="theme-grid">{themePresets.map(theme=><button key={theme.id} className={`theme-card ${project.theme.id===theme.id?"active":""}`} onClick={()=>setTheme(theme)}>
      <div className="theme-swatches"><i style={{background:theme.colors.background}}/><i style={{background:theme.colors.surface}}/><i style={{background:theme.colors.primary}}/><i style={{background:theme.colors.secondary}}/></div>
      <strong>{theme.name}</strong><span>{theme.radius} radius</span>
    </button>)}</div>
    <div className="theme-editor">
      <div className="library-group-title">Theme tokens</div>
      {colorFields.map(([key,label])=><label className="theme-color-row" key={key}><span>{label}</span><input type="color" value={project.theme.colors[key]} onChange={e=>updateColor(key,e.target.value)}/><code>{project.theme.colors[key]}</code></label>)}
      <label className="theme-input-row"><span>Radius</span><input value={project.theme.radius} onChange={e=>update({radius:e.target.value})}/></label>
      <label className="theme-input-row"><span>Body font</span><input value={project.theme.typography.body} onChange={e=>update({typography:{...project.theme.typography,body:e.target.value}})}/></label>
      <label className="theme-input-row"><span>Heading font</span><input value={project.theme.typography.heading} onChange={e=>update({typography:{...project.theme.typography,heading:e.target.value}})}/></label>
    </div>
    <button className="phase4-primary" onClick={restyleCurrentPage}><RefreshCw size={14}/>Restyle current page</button>
    <div className="prompt-safe-note"><Sparkles size={14}/><span>Theme-aware imported blocks use CSS variables, so later palette changes stay live in preview and export.</span></div>
  </section>;
}
