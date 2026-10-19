import { CheckCircle2, Globe2, Link2, SearchCheck, ShieldCheck } from "lucide-react";
import { auditSite, collectPageAnchors, normalizeAnchor } from "../lib/site-settings";
import { useBuilder } from "../store/builder";
import type { SocialLink } from "../types";

export default function SitePanel() {
  const { project, setSeo, updatePageSeo, updateNode } = useBuilder();
  const active = project.pages.find(page => page.id === project.activePageId) || project.pages[0];
  const audit = auditSite(project);
  const navText = (project.globalNavbar.links || []).map(link => `${link.label} | ${link.href}`).join("\n");
  const setNav = (value: string) => {
    const links: SocialLink[] = value.split("\n").filter(Boolean).map(line => { const [label, ...href] = line.split("|"); return { label: (label || "Link").trim(), href: href.join("|").trim() }; });
    updateNode(project.globalNavbar.id, { links });
  };
  return <section className="panel-body site-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Phase 7</span><h2>Site, Nav & SEO</h2></div><SearchCheck size={18}/></div>
    <div className="seo-score"><strong>{audit.score}</strong><div><b>Site health</b><span>{audit.issues.length ? `${audit.issues.length} issue${audit.issues.length === 1 ? "" : "s"}` : "Ready to publish"}</span></div></div>

    <details open><summary><Globe2 size={14}/> Global SEO</summary>
      <label className="mini-field"><span>Site title</span><input value={project.seo.siteTitle} onChange={e => setSeo({ siteTitle:e.target.value })}/></label>
      <label className="mini-field"><span>Title template</span><input value={project.seo.titleTemplate} onChange={e => setSeo({ titleTemplate:e.target.value })} placeholder="%s | Brand"/></label>
      <label className="mini-field"><span>Default description</span><textarea value={project.seo.description} onChange={e => setSeo({ description:e.target.value })}/></label>
      <label className="mini-field"><span>Site URL</span><input value={project.seo.siteUrl} onChange={e => setSeo({ siteUrl:e.target.value })} placeholder="https://example.com"/></label>
      <label className="mini-field"><span>Language</span><input value={project.seo.language} onChange={e => setSeo({ language:e.target.value })} placeholder="en"/></label>
      <label className="mini-field"><span>Default OG image</span><input value={project.seo.defaultImage} onChange={e => setSeo({ defaultImage:e.target.value })} placeholder="https://.../cover.jpg"/></label>
      <label className="mini-field"><span>Favicon</span><input value={project.seo.favicon} onChange={e => setSeo({ favicon:e.target.value })} placeholder="/favicon.ico or https://..."/></label>
      <div className="page-switches"><label><input type="checkbox" checked={project.seo.index} onChange={e=>setSeo({index:e.target.checked})}/> Index</label><label><input type="checkbox" checked={project.seo.follow} onChange={e=>setSeo({follow:e.target.checked})}/> Follow</label></div>
      <div className="page-switches"><label><input type="checkbox" checked={project.seo.generateSitemap} onChange={e=>setSeo({generateSitemap:e.target.checked})}/> Sitemap</label><label><input type="checkbox" checked={project.seo.generateRobots} onChange={e=>setSeo({generateRobots:e.target.checked})}/> Robots</label></div>
    </details>

    {active && <details open><summary><SearchCheck size={14}/> Current page SEO</summary>
      <label className="mini-field"><span>SEO title</span><input value={active.seo?.title || ""} onChange={e=>updatePageSeo(active.id,{title:e.target.value})}/></label>
      <label className="mini-field"><span>Description</span><textarea value={active.seo?.description || ""} onChange={e=>updatePageSeo(active.id,{description:e.target.value})}/></label>
      <label className="mini-field"><span>OG image override</span><input value={active.seo?.image || ""} onChange={e=>updatePageSeo(active.id,{image:e.target.value})}/></label>
      <label className="mini-field"><span>Canonical URL</span><input value={active.seo?.canonical || ""} onChange={e=>updatePageSeo(active.id,{canonical:e.target.value})}/></label>
      <label className="toggle-line"><input type="checkbox" checked={!!active.seo?.noIndex} onChange={e=>updatePageSeo(active.id,{noIndex:e.target.checked})}/><span>No-index this page</span></label>
    </details>}

    <details open><summary><Link2 size={14}/> Navigation manager</summary>
      <label className="mini-field"><span>Navbar links</span><textarea value={navText} onChange={e=>setNav(e.target.value)} placeholder={'Home | /\nAbout | /about\nContact | #contact'}/></label>
      <div className="site-link-list">{project.pages.map(page => <div key={page.id}><b>{page.name}</b><code>{page.path}</code>{collectPageAnchors(page).map(a=><code key={a.nodeId}>#{normalizeAnchor(a.id)}</code>)}</div>)}</div>
    </details>

    <details open><summary><ShieldCheck size={14}/> Accessibility & SEO audit</summary>
      {!audit.issues.length ? <div className="audit-ok"><CheckCircle2 size={15}/> No blocking issues found.</div> : <div className="audit-list">{audit.issues.map((issue,index)=><div className={`audit-${issue.severity}`} key={`${issue.code}-${index}`}><b>{issue.severity}</b><span>{issue.message}</span></div>)}</div>}
    </details>
  </section>;
}
