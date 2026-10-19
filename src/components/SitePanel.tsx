import { useState } from "react";
import { Bot, CheckCircle2, FileText, Gauge, Globe2, Link2, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import { auditSite, collectPageAnchors, normalizeAnchor } from "../lib/site-settings";
import { auditDiscoverability, buildLlmsText, buildRobotsText, buildSecurityHeaders, buildSecurityTxt, highScoreGuidance } from "../lib/discoverability";
import { useBuilder } from "../store/builder";
import type { SeoSchemaType, SocialLink } from "../types";

const schemaTypes: SeoSchemaType[] = ["WebPage","Article","FAQPage","Product","Service","Organization","LocalBusiness","SoftwareApplication","Person"];
const scoreClass = (score:number) => score >= 90 ? "audit-ok" : score >= 75 ? "audit-warning" : "audit-error";

export default function SitePanel() {
  const { project, setSeo, setSecurity, updatePageSeo, updateNode } = useBuilder();
  const [tab,setTab] = useState<"overview"|"search"|"files"|"security"|"nav">("overview");
  const active = project.pages.find(page => page.id === project.activePageId) || project.pages[0];
  const legacyAudit = auditSite(project);
  const audit = auditDiscoverability(project);
  const navText = (project.globalNavbar.links || []).map(link => `${link.label} | ${link.href}`).join("\n");
  const setNav = (value: string) => {
    const links: SocialLink[] = value.split("\n").filter(Boolean).map(line => { const [label, ...href] = line.split("|"); return { label: (label || "Link").trim(), href: href.join("|").trim() }; });
    updateNode(project.globalNavbar.id, { links });
  };
  const robotsPreview = buildRobotsText(project);
  const llmsPreview = buildLlmsText(project);
  const headersPreview = buildSecurityHeaders(project);
  const securityTxt = buildSecurityTxt(project);
  const categoryIssues = (category:string) => audit.issues.filter(issue => issue.category === category);

  return <section className="panel-body site-panel phase8-site-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Phase 8</span><h2>Site Quality Center</h2></div><Gauge size={18}/></div>
    <div className="quality-score-grid">
      <div className={scoreClass(audit.overall)}><strong>{audit.overall}</strong><span>Overall</span></div>
      <div className={scoreClass(audit.seo)}><strong>{audit.seo}</strong><span>SEO</span></div>
      <div className={scoreClass(audit.aeo)}><strong>{audit.aeo}</strong><span>AEO</span></div>
      <div className={scoreClass(audit.geo)}><strong>{audit.geo}</strong><span>GEO</span></div>
      <div className={scoreClass(audit.security)}><strong>{audit.security}</strong><span>Security</span></div>
    </div>
    <div className="quality-tabs">
      <button className={tab==="overview"?"active":""} onClick={()=>setTab("overview")}>Score</button>
      <button className={tab==="search"?"active":""} onClick={()=>setTab("search")}>SEO · AEO · GEO</button>
      <button className={tab==="files"?"active":""} onClick={()=>setTab("files")}>Files</button>
      <button className={tab==="security"?"active":""} onClick={()=>setTab("security")}>Security</button>
      <button className={tab==="nav"?"active":""} onClick={()=>setTab("nav")}>Nav</button>
    </div>

    {tab === "overview" && <>
      <details open><summary><Sparkles size={14}/> 90+ score guidance</summary>
        <div className="score-guidance">{highScoreGuidance.map((tip,i)=><div key={tip}><b>{i+1}</b><span>{tip}</span></div>)}</div>
      </details>
      <details open><summary><SearchCheck size={14}/> Quality audit</summary>
        {!audit.issues.length ? <div className="audit-ok"><CheckCircle2 size={15}/> All quality checks passed.</div> : <div className="audit-list">{audit.issues.slice(0,30).map((issue,index)=><div className={`audit-${issue.severity}`} key={`${issue.category}-${issue.code}-${index}`}><b>{issue.category?.toUpperCase()}</b><span>{issue.message}</span></div>)}</div>}
      </details>
      <details><summary><ShieldCheck size={14}/> Legacy accessibility audit</summary>
        {!legacyAudit.issues.length ? <div className="audit-ok"><CheckCircle2 size={15}/> No blocking accessibility issues found.</div> : <div className="audit-list">{legacyAudit.issues.map((issue,index)=><div className={`audit-${issue.severity}`} key={`${issue.code}-${index}`}><b>{issue.severity}</b><span>{issue.message}</span></div>)}</div>}
      </details>
    </>}

    {tab === "search" && <>
      <details open><summary><Globe2 size={14}/> Global SEO & entity settings</summary>
        <label className="mini-field"><span>Site title</span><input value={project.seo.siteTitle} onChange={e => setSeo({ siteTitle:e.target.value })}/></label>
        <label className="mini-field"><span>Title template</span><input value={project.seo.titleTemplate} onChange={e => setSeo({ titleTemplate:e.target.value })} placeholder="%s | Brand"/></label>
        <label className="mini-field"><span>Default description</span><textarea value={project.seo.description} onChange={e => setSeo({ description:e.target.value })}/></label>
        <label className="mini-field"><span>Canonical site URL</span><input value={project.seo.siteUrl} onChange={e => setSeo({ siteUrl:e.target.value })} placeholder="https://example.com"/></label>
        <label className="mini-field"><span>Language</span><input value={project.seo.language} onChange={e => setSeo({ language:e.target.value })} placeholder="en"/></label>
        <label className="mini-field"><span>Default OG image</span><input value={project.seo.defaultImage} onChange={e => setSeo({ defaultImage:e.target.value })}/></label>
        <label className="mini-field"><span>Favicon</span><input value={project.seo.favicon} onChange={e => setSeo({ favicon:e.target.value })}/></label>
        <label className="mini-field"><span>Organization / publisher</span><input value={project.seo.organizationName} onChange={e => setSeo({ organizationName:e.target.value })}/></label>
        <label className="mini-field"><span>Organization logo</span><input value={project.seo.organizationLogo} onChange={e => setSeo({ organizationLogo:e.target.value })}/></label>
        <label className="mini-field"><span>Default author / expert</span><input value={project.seo.defaultAuthor} onChange={e => setSeo({ defaultAuthor:e.target.value })}/></label>
        <label className="mini-field"><span>Key topics (comma separated)</span><input value={project.seo.keyTopics} onChange={e => setSeo({ keyTopics:e.target.value })}/></label>
        <label className="mini-field"><span>Twitter/X site handle</span><input value={project.seo.twitterSite} onChange={e => setSeo({ twitterSite:e.target.value })} placeholder="@brand"/></label>
        <div className="page-switches"><label><input type="checkbox" checked={project.seo.index} onChange={e=>setSeo({index:e.target.checked})}/> Index</label><label><input type="checkbox" checked={project.seo.follow} onChange={e=>setSeo({follow:e.target.checked})}/> Follow</label><label><input type="checkbox" checked={project.seo.generateSitemap} onChange={e=>setSeo({generateSitemap:e.target.checked})}/> Sitemap</label></div>
      </details>
      {active && <details open><summary><Bot size={14}/> Current page SEO · AEO · GEO</summary>
        <label className="mini-field"><span>SEO title</span><input value={active.seo?.title || ""} onChange={e=>updatePageSeo(active.id,{title:e.target.value})}/></label>
        <label className="mini-field"><span>Meta description</span><textarea value={active.seo?.description || ""} onChange={e=>updatePageSeo(active.id,{description:e.target.value})}/></label>
        <label className="mini-field"><span>Keywords / topic phrases</span><input value={active.seo?.keywords || ""} onChange={e=>updatePageSeo(active.id,{keywords:e.target.value})}/></label>
        <label className="mini-field"><span>Answer summary (AEO)</span><textarea value={active.seo?.answerSummary || ""} onChange={e=>updatePageSeo(active.id,{answerSummary:e.target.value})} placeholder="Concise direct answer / summary for this page."/></label>
        <label className="mini-field"><span>Primary entity / subject (GEO)</span><input value={active.seo?.entityName || ""} onChange={e=>updatePageSeo(active.id,{entityName:e.target.value})}/></label>
        <label className="mini-field"><span>Schema type</span><select value={active.seo?.schemaType || "WebPage"} onChange={e=>updatePageSeo(active.id,{schemaType:e.target.value as SeoSchemaType})}>{schemaTypes.map(v=><option key={v}>{v}</option>)}</select></label>
        <label className="mini-field"><span>Author / expert</span><input value={active.seo?.author || ""} onChange={e=>updatePageSeo(active.id,{author:e.target.value})}/></label>
        <label className="mini-field"><span>Last modified</span><input type="date" value={active.seo?.dateModified || ""} onChange={e=>updatePageSeo(active.id,{dateModified:e.target.value})}/></label>
        <label className="mini-field"><span>Evidence / citation URLs (one per line)</span><textarea value={active.seo?.citations || ""} onChange={e=>updatePageSeo(active.id,{citations:e.target.value})}/></label>
        <label className="mini-field"><span>OG image override</span><input value={active.seo?.image || ""} onChange={e=>updatePageSeo(active.id,{image:e.target.value})}/></label>
        <label className="mini-field"><span>Canonical URL</span><input value={active.seo?.canonical || ""} onChange={e=>updatePageSeo(active.id,{canonical:e.target.value})}/></label>
        <label className="toggle-line"><input type="checkbox" checked={!!active.seo?.noIndex} onChange={e=>updatePageSeo(active.id,{noIndex:e.target.checked})}/><span>No-index this page</span></label>
      </details>}
      <details><summary><Gauge size={14}/> Category diagnostics</summary>
        {(["seo","aeo","geo"] as const).map(cat=><div className="category-diagnostics" key={cat}><b>{cat.toUpperCase()} {audit[cat]}</b>{categoryIssues(cat).slice(0,12).map((issue,i)=><span key={i}>{issue.message}</span>)}</div>)}
      </details>
    </>}

    {tab === "files" && <>
      <details open><summary><FileText size={14}/> robots.txt manager</summary>
        <div className="page-switches"><label><input type="checkbox" checked={project.seo.generateRobots} onChange={e=>setSeo({generateRobots:e.target.checked})}/> Export robots.txt</label><label><input type="checkbox" checked={project.seo.robotsMode==="custom"} onChange={e=>setSeo({robotsMode:e.target.checked?"custom":"auto"})}/> Custom mode</label></div>
        {project.seo.robotsMode === "custom" && <label className="mini-field"><span>Editable robots.txt</span><textarea className="code-textarea" value={project.seo.robotsContent} onChange={e=>setSeo({robotsContent:e.target.value})}/></label>}
        <label className="mini-field"><span>Export preview</span><textarea className="code-textarea" readOnly value={robotsPreview}/></label>
      </details>
      <details open><summary><Bot size={14}/> llms.txt manager</summary>
        <p className="panel-note">Optional agent guidance file. It does not replace robots.txt and does not guarantee AI citations or rankings.</p>
        <div className="page-switches"><label><input type="checkbox" checked={project.seo.generateLlms} onChange={e=>setSeo({generateLlms:e.target.checked})}/> Export llms.txt</label><label><input type="checkbox" checked={project.seo.llmsMode==="custom"} onChange={e=>setSeo({llmsMode:e.target.checked?"custom":"auto"})}/> Custom mode</label></div>
        {project.seo.llmsMode === "custom" && <label className="mini-field"><span>Editable llms.txt</span><textarea className="code-textarea" value={project.seo.llmsContent} onChange={e=>setSeo({llmsContent:e.target.value})}/></label>}
        <label className="mini-field"><span>Export preview</span><textarea className="code-textarea tall" readOnly value={llmsPreview}/></label>
      </details>
    </>}

    {tab === "security" && <>
      <details open><summary><ShieldCheck size={14}/> Security headers</summary>
        <div className="page-switches"><label><input type="checkbox" checked={project.security.enableHeaders} onChange={e=>setSecurity({enableHeaders:e.target.checked})}/> Export headers</label></div>
        <label className="mini-field"><span>Profile</span><select value={project.security.headersPreset} onChange={e=>setSecurity({headersPreset:e.target.value as any})}><option value="balanced">Balanced</option><option value="strict">Strict</option><option value="custom">Custom</option></select></label>
        <label className="mini-field"><span>Content-Security-Policy</span><textarea className="code-textarea" value={project.security.contentSecurityPolicy} onChange={e=>setSecurity({contentSecurityPolicy:e.target.value})}/></label>
        <label className="mini-field"><span>Referrer-Policy</span><input value={project.security.referrerPolicy} onChange={e=>setSecurity({referrerPolicy:e.target.value})}/></label>
        <label className="mini-field"><span>X-Frame-Options</span><input value={project.security.frameOptions} onChange={e=>setSecurity({frameOptions:e.target.value})}/></label>
        <label className="mini-field"><span>Permissions-Policy</span><input value={project.security.permissionsPolicy} onChange={e=>setSecurity({permissionsPolicy:e.target.value})}/></label>
        <label className="mini-field"><span>HSTS</span><input value={project.security.strictTransportSecurity} onChange={e=>setSecurity({strictTransportSecurity:e.target.value})}/></label>
        <label className="mini-field"><span>Cross-Origin-Opener-Policy</span><input value={project.security.crossOriginOpenerPolicy} onChange={e=>setSecurity({crossOriginOpenerPolicy:e.target.value})}/></label>
        <label className="mini-field"><span>Cloudflare/Netlify _headers preview</span><textarea className="code-textarea tall" readOnly value={headersPreview}/></label>
      </details>
      <details open><summary><FileText size={14}/> security.txt</summary>
        <label className="toggle-line"><input type="checkbox" checked={project.security.generateSecurityTxt} onChange={e=>setSecurity({generateSecurityTxt:e.target.checked})}/><span>Export /.well-known/security.txt</span></label>
        <label className="mini-field"><span>Contact URI</span><input value={project.security.securityContact} onChange={e=>setSecurity({securityContact:e.target.value})} placeholder="mailto:security@example.com"/></label>
        <label className="mini-field"><span>Policy URL</span><input value={project.security.securityPolicyUrl} onChange={e=>setSecurity({securityPolicyUrl:e.target.value})}/></label>
        <label className="mini-field"><span>Expires (ISO 8601)</span><input value={project.security.securityExpires} onChange={e=>setSecurity({securityExpires:e.target.value})} placeholder="2027-12-31T23:59:59Z"/></label>
        <label className="mini-field"><span>Acknowledgments URL</span><input value={project.security.securityAcknowledgments} onChange={e=>setSecurity({securityAcknowledgments:e.target.value})}/></label>
        <label className="mini-field"><span>Preview</span><textarea className="code-textarea" readOnly value={securityTxt}/></label>
      </details>
      <details open><summary><ShieldCheck size={14}/> Security test</summary>
        <div className="category-diagnostics"><b>Security readiness {audit.security}/100</b>{categoryIssues("security").map((issue,i)=><span key={i}>{issue.message}</span>)}</div>
        <p className="panel-note">This is a static project/export audit. Run a live deployed-site header/TLS scan after publishing too.</p>
      </details>
    </>}

    {tab === "nav" && <details open><summary><Link2 size={14}/> Navigation manager</summary>
      <label className="mini-field"><span>Navbar links</span><textarea value={navText} onChange={e=>setNav(e.target.value)} placeholder={'Home | /\nAbout | /about\nContact | #contact'}/></label>
      <div className="site-link-list">{project.pages.map(page => <div key={page.id}><b>{page.name}</b><code>{page.path}</code>{collectPageAnchors(page).map(a=><code key={a.nodeId}>#{normalizeAnchor(a.id)}</code>)}</div>)}</div>
    </details>}
  </section>;
}
