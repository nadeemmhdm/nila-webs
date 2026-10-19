import { FilePlus2, Globe2, Trash2 } from "lucide-react";
import { useBuilder } from "../store/builder";

export default function PagesPanel() {
  const { project, addPage, removePage, setActivePage, renamePage, updatePagePath, togglePageGlobal } = useBuilder();
  return <section className="panel-body">
    <div className="panel-heading"><div><span className="panel-kicker">Structure</span><h2>Pages</h2></div><button className="icon-button" onClick={addPage} title="Add page"><FilePlus2 size={16}/></button></div>
    <div className="hint-box"><Globe2 size={15}/><span>New pages automatically inherit the global navbar and footer. Turn either off per page when needed.</span></div>
    <div className="page-list">{project.pages.map(page => <article key={page.id} className={`page-card ${page.id === project.activePageId ? "active" : ""}`} onClick={() => setActivePage(page.id)}>
      <div className="page-card-top"><input className="page-name" value={page.name} onClick={e => e.stopPropagation()} onChange={e => renamePage(page.id, e.target.value)}/>{project.pages.length > 1 && <button className="ghost-danger" onClick={e => { e.stopPropagation(); removePage(page.id); }}><Trash2 size={14}/></button>}</div>
      <label className="mini-field"><span>Path</span><input value={page.path} onClick={e => e.stopPropagation()} onChange={e => updatePagePath(page.id, e.target.value)}/></label>
      <div className="page-switches"><label><input type="checkbox" checked={page.showNavbar} onClick={e => e.stopPropagation()} onChange={e => togglePageGlobal(page.id, "showNavbar", e.target.checked)}/> Navbar</label><label><input type="checkbox" checked={page.showFooter} onClick={e => e.stopPropagation()} onChange={e => togglePageGlobal(page.id, "showFooter", e.target.checked)}/> Footer</label></div>
    </article>)}</div>
  </section>;
}
