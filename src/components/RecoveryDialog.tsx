import { Download, History, RotateCcw, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { BuilderProject } from "../types";
import { clearProjectRecovery, createRecoverySnapshot, deleteRecoverySnapshot, exportProjectBackup, listProjectRecoverySnapshots, restoreRecoverySnapshot } from "../lib/project-storage";

export default function RecoveryDialog({ project, onClose, onRestore }:{ project:BuilderProject; onClose:()=>void; onRestore:(project:BuilderProject)=>void }) {
  const [version,setVersion]=useState(0);
  const snapshots=useMemo(()=>listProjectRecoverySnapshots(project.id),[project.id,version]);
  const restore=(id:string)=>{const restored=restoreRecoverySnapshot(project.id,id);if(restored){onRestore(restored);onClose();}};
  return <div className="dialog-backdrop" onMouseDown={e=>e.currentTarget===e.target&&onClose()}><section className="create-project-dialog recovery-dialog">
    <div className="dialog-header"><div><span className="eyebrow">Phase 8 recovery</span><h2>Project recovery</h2><p>Restore an automatic snapshot or download a portable project backup.</p></div><button className="dialog-close" onClick={onClose}><X size={17}/></button></div>
    <div className="recovery-actions"><button onClick={()=>{createRecoverySnapshot(project,"manual");setVersion(v=>v+1)}}><History size={14}/>Create snapshot</button><button onClick={()=>exportProjectBackup(project)}><Download size={14}/>Download .nila.json</button></div>
    <div className="recovery-list">{snapshots.length?snapshots.map(item=><article key={item.id}><div><strong>{new Date(item.createdAt).toLocaleString()}</strong><span>{item.reason.replace("-"," ")} · {item.project.pages.length} pages</span></div><div><button onClick={()=>restore(item.id)}><RotateCcw size={13}/>Restore</button><button className="delete-project" onClick={()=>{deleteRecoverySnapshot(project.id,item.id);setVersion(v=>v+1)}}><Trash2 size={13}/></button></div></article>):<div className="projects-empty"><History size={22}/><h3>No recovery points yet</h3><p>Nila Webs automatically keeps recent copies before project overwrites.</p></div>}</div>
    <footer className="dialog-footer"><button className="cancel-dialog" onClick={()=>{if(confirm("Clear all recovery snapshots for this project?")){clearProjectRecovery(project.id);setVersion(v=>v+1)}}}>Clear recovery</button><button className="create-dialog" onClick={onClose}>Done</button></footer>
  </section></div>;
}
