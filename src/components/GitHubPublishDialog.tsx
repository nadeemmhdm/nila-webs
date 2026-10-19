import { ExternalLink, Github, LockKeyhole, UploadCloud, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { BuilderProject } from "../types";
import { publishReactViteToGitHub } from "../lib/github-publisher";
import type { ExportCssMode } from "../lib/exporter";

const repoSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-|-$/g, "") || "nila-webs-site";

export default function GitHubPublishDialog({ project, onClose, defaultCssMode = "css" }: { project: BuilderProject; onClose: () => void; defaultCssMode?: ExportCssMode }) {
  const saved = (() => { try { return JSON.parse(localStorage.getItem("nila-webs.github-target") || "{}"); } catch { return {}; } })();
  const [owner, setOwner] = useState(saved.owner || "");
  const [repo, setRepo] = useState(saved.repo || repoSlug(project.name));
  const [branch, setBranch] = useState(saved.branch || "main");
  const [message, setMessage] = useState(`Publish ${project.name} from Nila Webs`);
  const [token, setToken] = useState("");
  const [createIfMissing, setCreateIfMissing] = useState(true);
  const [privateRepo, setPrivateRepo] = useState(false);
  const [cssMode, setCssMode] = useState<ExportCssMode>(defaultCssMode);
  const [status, setStatus] = useState("Ready to publish a full React + Vite source project.");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ repositoryUrl:string; commitSha:string; branch:string; fileCount:number } | null>(null);

  useEffect(() => {
    localStorage.setItem("nila-webs.github-target", JSON.stringify({ owner, repo, branch }));
  }, [owner, repo, branch]);

  const publish = async () => {
    setBusy(true); setResult(null);
    try {
      const published = await publishReactViteToGitHub(project, { token, owner, repo, branch, commitMessage: message, createIfMissing, privateRepo, cssMode }, setStatus);
      setResult(published); setStatus(`Published ${published.fileCount} files to ${published.branch}.`); setToken("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "GitHub publish failed.");
    } finally { setBusy(false); }
  };

  return <div className="publish-backdrop" onMouseDown={e => { if (e.currentTarget === e.target && !busy) onClose(); }}>
    <section className="publish-dialog" role="dialog" aria-modal="true" aria-label="Publish to GitHub">
      <div className="publish-head"><div><Github size={20}/><div><strong>Publish React + Vite to GitHub</strong><span>Push the generated real source project directly to a repository with compulsory watermark + provenance preflight.</span></div></div><button onClick={onClose} disabled={busy} aria-label="Close"><X size={18}/></button></div>
      <div className="publish-grid">
        <label>Owner<input value={owner} onChange={e=>setOwner(e.target.value)} placeholder="github-username"/></label>
        <label>Repository<input value={repo} onChange={e=>setRepo(e.target.value)} placeholder="my-website"/></label>
        <label>Branch<input value={branch} onChange={e=>setBranch(e.target.value)} placeholder="main"/></label>
        <label className="wide">Commit message<input value={message} onChange={e=>setMessage(e.target.value)}/></label>
        <label>CSS profile<select value={cssMode} onChange={e=>setCssMode(e.target.value as ExportCssMode)}><option value="css">Standard CSS</option><option value="tailwind4">Tailwind CSS 4</option></select></label><label className="wide">GitHub token<input type="password" value={token} onChange={e=>setToken(e.target.value)} autoComplete="off" placeholder="Fine-grained PAT with repository Contents write access"/></label>
      </div>
      <div className="publish-options"><label><input type="checkbox" checked={createIfMissing} onChange={e=>setCreateIfMissing(e.target.checked)}/> Create repository when missing</label><label><input type="checkbox" checked={privateRepo} onChange={e=>setPrivateRepo(e.target.checked)}/> Private repository</label></div>
      <div className="publish-security"><LockKeyhole size={15}/><span>The token stays only in this dialog's memory and is cleared after a successful publish. It is never saved to the project or local storage.</span></div>
      <div className={`publish-status ${result ? "success" : ""}`}>{status}{result && <a href={result.repositoryUrl} target="_blank" rel="noreferrer">Open repository <ExternalLink size={13}/></a>}</div>
      <div className="publish-actions"><button onClick={onClose} disabled={busy}>Cancel</button><button className="primary-action" disabled={busy || !token.trim() || !owner.trim() || !repo.trim()} onClick={publish}><UploadCloud size={15}/>{busy ? "Publishing…" : "Publish source"}</button></div>
    </section>
  </div>;
}
