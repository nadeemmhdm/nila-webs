import { ArrowRight, CalendarDays, FilePlus2, FolderOpen, LayoutTemplate, MoreHorizontal, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createProjectModel, deleteProjectFromStorage, listProjects, loadProjectById, saveProject } from "../lib/project-storage";
import { deleteAssetBlob } from "../lib/assets";
import { siteTemplateRegistry } from "../templates/site-templates";
import type { BuilderProject, ProjectSummary } from "../types";

export default function ProjectsHome({ onOpen }: { onOpen: (project: BuilderProject) => void }) {
  const [projects, setProjects] = useState<ProjectSummary[]>(() => listProjects());
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const refresh = () => setProjects(listProjects());
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("nila-projects-changed", handler);
    return () => window.removeEventListener("nila-projects-changed", handler);
  }, []);

  const filtered = useMemo(() => projects.filter(project => `${project.name} ${project.description || ""}`.toLowerCase().includes(search.toLowerCase())), [projects, search]);
  const recent = projects.slice(0, 4);
  const openProject = (id: string) => { const project = loadProjectById(id); if (project) onOpen(project); };
  const remove = async (id: string) => { if (!confirm("Delete this Nila Webs project from this device?")) return; const project = loadProjectById(id); if (project) await Promise.all(project.assets.filter(a => a.source === "upload").map(a => deleteAssetBlob(project.id, a.id).catch(() => undefined))); deleteProjectFromStorage(id); refresh(); };

  return <main className="projects-screen">
    <header className="projects-topbar">
      <div className="projects-brand"><div className="brand-mark"><span>NW</span></div><div><strong>Nila Webs</strong><span>Visual website workspace</span></div></div>
      <button className="create-project-top" onClick={() => setCreateOpen(true)}><Plus size={15}/>Create project</button>
    </header>

    <section className="projects-content">
      <div className="projects-hero">
        <div><span className="eyebrow">Workspace</span><h1>Build, edit and export real websites.</h1><p>Create from a blank canvas or start from a reusable template. Every project stays editable and can export as React + Vite.</p></div>
        <button className="hero-create" onClick={() => setCreateOpen(true)}><FilePlus2 size={18}/><span><strong>New project</strong><small>Blank is selected by default</small></span><ArrowRight size={16}/></button>
      </div>

      {!!recent.length && <section className="project-section"><div className="section-title"><div><span className="eyebrow">Continue building</span><h2>Recent projects</h2></div></div><div className="project-grid recent-grid">{recent.map(project => <ProjectCard key={project.id} project={project} onOpen={() => openProject(project.id)} onDelete={() => remove(project.id)}/>)}</div></section>}

      <section className="project-section all-projects-section">
        <div className="section-title"><div><span className="eyebrow">Library</span><h2>All projects</h2></div><label className="projects-search"><Search size={14}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"/></label></div>
        {!filtered.length ? <div className="projects-empty"><div className="projects-empty-icon"><LayoutTemplate size={24}/></div><h3>{projects.length ? "No matching projects" : "Create your first website"}</h3><p>{projects.length ? "Try another project name or description." : "Choose blank or a starter template and begin editing visually."}</p><button onClick={() => setCreateOpen(true)}><Plus size={14}/>Create project</button></div> : <div className="project-grid">{filtered.map(project => <ProjectCard key={project.id} project={project} onOpen={() => openProject(project.id)} onDelete={() => remove(project.id)}/>)}</div>}
      </section>
    </section>

    {createOpen && <CreateProjectDialog onClose={() => setCreateOpen(false)} onCreate={project => { setCreateOpen(false); refresh(); onOpen(project); }}/>} 
  </main>;
}

function ProjectCard({ project, onOpen, onDelete }: { project: ProjectSummary; onOpen: () => void; onDelete: () => void }) {
  return <article className="project-card-home" onDoubleClick={onOpen}>
    <div className="project-preview-tile"><div className="preview-nav"/><div className="preview-copy"><i/><i/><i/></div><div className="preview-grid"><i/><i/><i/></div></div>
    <div className="project-card-meta"><div className="project-card-title"><div><strong>{project.name}</strong><span>{project.description || "No description"}</span></div><div className="project-menu"><button title="Project options"><MoreHorizontal size={15}/></button><button className="delete-project" title="Delete project" onClick={e => { e.stopPropagation(); onDelete(); }}><Trash2 size={13}/></button></div></div>
      <div className="project-stats"><span><CalendarDays size={11}/>{formatDate(project.updatedAt)}</span><span>{project.pageCount} page{project.pageCount === 1 ? "" : "s"}</span><span>{project.assetCount} assets</span></div>
      <button className="open-project-button" onClick={onOpen}><FolderOpen size={13}/>Open project<ArrowRight size={13}/></button>
    </div>
  </article>;
}

function CreateProjectDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (project: BuilderProject) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState("blank");
  const templates = [{ id: "blank", name: "Blank Project", description: "Start with an empty page and the global navbar/footer.", pageCount: 1, thumbnail: "" }, ...siteTemplateRegistry.map(item => ({ id: item.id, name: item.name, description: item.description, pageCount: item.pageCount, thumbnail: item.thumbnail || "" }))];
  const create = () => {
    if (!name.trim()) return alert("Enter a project name.");
    const project = createProjectModel(name, description, templateId);
    onCreate(saveProject(project));
  };
  return <div className="dialog-backdrop" onMouseDown={e => e.currentTarget === e.target && onClose()}><section className="create-project-dialog">
    <div className="dialog-header"><div><span className="eyebrow">New workspace</span><h2>Create project</h2><p>Name your site, add an optional description and choose a starting point.</p></div><button className="dialog-close" onClick={onClose}><X size={17}/></button></div>
    <div className="dialog-form"><label><span>Project name <b>*</b></span><input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Interman Website"/></label><label><span>Description <em>optional</em></span><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What are you building?"/></label></div>
    <div className="template-picker"><div className="template-picker-head"><div><span>Start from</span><strong>{templates.find(t => t.id === templateId)?.name}</strong></div><small>Blank is default</small></div><div className="template-choice-grid">{templates.map((template, index) => <button key={template.id} className={`template-choice ${templateId === template.id ? "selected" : ""}`} onClick={() => setTemplateId(template.id)}><div className={`template-choice-preview variant-${index % 4}`} style={template.thumbnail?{backgroundImage:`linear-gradient(180deg,transparent,#02061766),url(${template.thumbnail})`}:undefined}><LayoutTemplate size={20}/><span>{template.pageCount} page{template.pageCount===1?"":"s"}</span></div><div><strong>{template.name}</strong><span>{template.description}</span></div>{templateId === template.id && <i className="selected-dot"/>}</button>)}</div></div>
    <footer className="dialog-footer"><button className="cancel-dialog" onClick={onClose}>Cancel</button><button className="create-dialog" onClick={create}><Plus size={14}/>Create project</button></footer>
  </section></div>;
}

function formatDate(value: string) {
  try { return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
  catch { return "Recently edited"; }
}
