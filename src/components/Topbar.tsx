import { Download, Eye, EyeOff, FolderKanban, Import, Monitor, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Play, Redo2, RotateCcw, Save, Smartphone, Tablet, Undo2, Zap } from "lucide-react";
import { useRef } from "react";
import { exportReactVite } from "../lib/exporter";
import { importProjectToStorage } from "../lib/project-storage";
import { useBuilder } from "../store/builder";

export default function Topbar({ onProjects }: { onProjects: () => void }) {
  const { project, setProjectName, viewport, setViewport, previewMode, setPreviewMode, livePreview, setLivePreview, leftCollapsed, rightCollapsed, toggleLeft, toggleRight, past, future, undo, redo, loadProject, reset } = useBuilder();
  const fileRef = useRef<HTMLInputElement>(null);
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(project,null,2)], { type:"application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${slug(project.name)}.nila.json`; a.click(); URL.revokeObjectURL(a.href);
  };
  const importJson = (file?:File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const imported = importProjectToStorage(JSON.parse(String(reader.result))); loadProject(imported); } catch { alert("Invalid Nila Webs project file"); } }; reader.readAsText(file); };
  return <header className="topbar">
    <div className="brand-area"><button className="projects-back-button" onClick={onProjects} title="Back to projects"><FolderKanban size={15}/></button><div className="brand-mark"><Zap size={17}/></div><div className="brand-copy"><strong>Nila Webs</strong><span>Visual React + Vite builder</span></div><input className="project-name-input" value={project.name} onChange={e => setProjectName(e.target.value)} aria-label="Project name"/></div>
    <div className="center-tools">
      {!previewMode && <button className="tiny-icon" onClick={toggleLeft} title="Toggle left sidebar">{leftCollapsed?<PanelLeftOpen size={16}/>:<PanelLeftClose size={16}/>}</button>}
      <div className="viewport-switcher"><button className={viewport === "desktop" ? "active" : ""} onClick={() => setViewport("desktop")} title="Desktop"><Monitor size={16}/></button><button className={viewport === "tablet" ? "active" : ""} onClick={() => setViewport("tablet")} title="Tablet"><Tablet size={16}/></button><button className={viewport === "mobile" ? "active" : ""} onClick={() => setViewport("mobile")} title="Mobile"><Smartphone size={16}/></button></div>
      {!previewMode && <button className="tiny-icon" onClick={toggleRight} title="Toggle properties">{rightCollapsed?<PanelRightOpen size={16}/>:<PanelRightClose size={16}/>}</button>}
      <div className="history-tools"><button disabled={!past.length} onClick={undo} title="Undo"><Undo2 size={15}/></button><button disabled={!future.length} onClick={redo} title="Redo"><Redo2 size={15}/></button></div>
    </div>
    <div className="top-actions">
      {!previewMode && <button className={livePreview ? "active-live" : ""} onClick={() => setLivePreview(!livePreview)}><Play size={15}/>{livePreview ? "Live on" : "Live"}</button>}
      <button onClick={() => setPreviewMode(!previewMode)}>{previewMode?<EyeOff size={15}/>:<Eye size={15}/>} {previewMode?"Exit preview":"Preview"}</button>
      {!previewMode && <><button className="icon-only-action" onClick={() => fileRef.current?.click()} title="Import project"><Import size={15}/></button><input ref={fileRef} hidden type="file" accept=".json,.nila.json" onChange={e => importJson(e.target.files?.[0])}/><button className="icon-only-action" onClick={exportJson} title="Save editable project"><Save size={15}/></button><button className="primary-action" onClick={() => exportReactVite(project)}><Download size={15}/>Export React/Vite</button><button className="icon-only-action" title="Reset project" onClick={() => confirm("Reset this Nila Webs project?") && reset()}><RotateCcw size={15}/></button></>}
    </div>
  </header>;
}
const slug=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"nila-webs-site";
