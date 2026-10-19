import { Film, ImageIcon, Link2, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { createLinkedAsset, createUploadedAsset, deleteAssetBlob, humanFileSize } from "../lib/assets";
import { getNodeAnywhere, useBuilder } from "../store/builder";
import type { AssetKind } from "../types";

export default function AssetsPanel() {
  const { project, addProjectAsset, removeProjectAsset, updateNode, selectedId } = useBuilder();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<AssetKind>("image");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const upload = async (file?: File) => {
    if (!file) return;
    const inferred: AssetKind = file.type.startsWith("video/") ? "video" : "image";
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return alert("Choose an image or video file.");
    setBusy(true);
    try { const asset = await createUploadedAsset(project.id, file, inferred); addProjectAsset(asset); }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const addLink = () => {
    if (!/^https?:\/\//i.test(url.trim())) return alert("Enter a valid http/https media URL.");
    const asset = createLinkedAsset(url, kind);
    addProjectAsset(asset); setUrl("");
  };

  const useAsset = (assetId: string, assetKind: AssetKind) => {
    if (!selectedId) return;
    const node = getNodeAnywhere(project, selectedId);
    if (!node || !["image","video"].includes(node.type)) return alert("Select an image or video element first.");
    if (node.type !== assetKind) return alert(`This is a ${assetKind} asset. Select a ${assetKind} element to use it.`);
    updateNode(node.id, { src: `asset://${assetId}`, ...(assetKind === "image" ? { alt: node.alt || "Project asset" } : {}) });
  };

  const remove = async (id: string, source: "upload" | "url") => {
    if (!confirm("Remove this asset from the project library? Existing elements using it may show as missing.")) return;
    if (source === "upload") await deleteAssetBlob(project.id, id).catch(() => undefined);
    removeProjectAsset(id);
  };

  return <section className="panel-body assets-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Project media</span><h2>Assets</h2></div><Upload size={17}/></div>
    <p className="panel-copy">Upload images/videos or save remote links. Uploaded files are exported into <code>public/assets/</code>.</p>

    <button className="asset-upload-button" disabled={busy} onClick={() => fileRef.current?.click()}><Plus size={14}/>{busy ? "Adding…" : "Upload image / video"}</button>
    <input ref={fileRef} hidden type="file" accept="image/*,video/*" onChange={e => upload(e.target.files?.[0])}/>

    <div className="asset-link-box">
      <div className="asset-kind-switch"><button className={kind === "image" ? "active" : ""} onClick={() => setKind("image")}><ImageIcon size={12}/>Image</button><button className={kind === "video" ? "active" : ""} onClick={() => setKind("video")}><Film size={12}/>Video</button></div>
      <div className="asset-link-row"><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/media.jpg"/><button onClick={addLink} title="Add link"><Link2 size={13}/></button></div>
    </div>

    <div className="asset-list">
      {!project.assets.length && <div className="asset-empty"><ImageIcon size={20}/><strong>No project assets yet</strong><span>Uploaded media stays local to this project until export.</span></div>}
      {project.assets.map(asset => <article className="asset-card" key={asset.id}>
        <div className="asset-icon">{asset.kind === "video" ? <Film size={15}/> : <ImageIcon size={15}/>}</div>
        <div className="asset-info"><strong title={asset.name}>{asset.name}</strong><span>{asset.source === "upload" ? humanFileSize(asset.size) : "Remote link"} · {asset.kind}</span></div>
        <div className="asset-actions">{selectedId && <button onClick={() => useAsset(asset.id, asset.kind)}>Use</button>}<button className="danger" onClick={() => remove(asset.id, asset.source)}><Trash2 size={12}/></button></div>
      </article>)}
    </div>
  </section>;
}
