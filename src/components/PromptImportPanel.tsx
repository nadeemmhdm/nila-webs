import { FileCode2, FileUp, Plus, RefreshCw, Save, Sparkles, Trash2, WandSparkles } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { analyzePromptSource, importedBlockFromPrompt, promptToNode } from "../lib/prompt-adapter";
import { cloneNode } from "../lib/nodes";
import { useBuilder } from "../store/builder";
import type { ImportedBlock } from "../types";

export default function PromptImportPanel(){
  const [name,setName]=useState("Imported Shadcn Block");
  const [source,setSource]=useState("");
  const [editingId,setEditingId]=useState<string|null>(null);
  const fileRef=useRef<HTMLInputElement>(null);
  const { project, addNode, addImportedBlock, reconvertImportedBlock, deleteImportedBlock, setTheme, saveCurrentTheme, setSidebarTab }=useBuilder();
  const analysis=useMemo(()=>source.trim()?analyzePromptSource(source,name):null,[source,name]);
  const preview=useMemo(()=>source.trim()&&analysis?.artifactType!=="theme"?promptToNode(source,name):null,[source,name,analysis?.artifactType]);
  const loadFile=async(file?:File)=>{if(!file)return;setSource(await file.text());setEditingId(null);if(name==="Imported Shadcn Block")setName(file.name.replace(/\.[^.]+$/," ").replace(/[-_]+/g," ").trim());};
  const add=()=>{if(!source.trim()||analysis?.artifactType==="theme")return;addNode(promptToNode(source,name));setSidebarTab("layers");};
  const save=()=>{if(!source.trim()||analysis?.artifactType==="theme")return;const existing=editingId?project.importedBlocks.find(item=>item.id===editingId):undefined;addImportedBlock(importedBlockFromPrompt(source,name,existing));setEditingId(null);};
  const saveAndAdd=()=>{if(!source.trim()||analysis?.artifactType==="theme")return;const existing=editingId?project.importedBlocks.find(item=>item.id===editingId):undefined;const block=importedBlockFromPrompt(source,name,existing);addImportedBlock(block);addNode(cloneNode(block.node));setEditingId(null);setSidebarTab("layers");};
  const applyTheme=()=>{if(!analysis?.theme)return;setTheme(analysis.theme);const saveIt=confirm("Theme applied. Save this detected theme to the project theme registry too?");if(saveIt)saveCurrentTheme(analysis.theme.name);setSidebarTab("themes");};
  const edit=(block:ImportedBlock)=>{setEditingId(block.id);setName(block.name);setSource(block.source||"");};
  return <section className="panel-body prompt-import-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Prompt/code compiler</span><h2>Import</h2></div><FileCode2 size={17}/></div>
    <p className="panel-copy">Paste React/TSX/JSX, a Shadcn prompt, CSS variables or theme config. Source is analyzed and converted into safe editable Nila Webs nodes; arbitrary source is never eval'd.</p>
    <label className="prompt-field"><span>Name</span><input value={name} onChange={e=>setName(e.target.value)}/></label>
    <label className="prompt-field"><span>Prompt / code / theme</span><textarea className="prompt-source" value={source} onChange={e=>setSource(e.target.value)} placeholder="Paste a section/component prompt, React component, or CSS/theme tokens here…"/></label>
    <input ref={fileRef} type="file" hidden accept=".txt,.md,.tsx,.ts,.jsx,.js,.css,.json" onChange={e=>loadFile(e.target.files?.[0])}/>
    <button className="phase4-secondary" onClick={()=>fileRef.current?.click()}><FileUp size={14}/>Load source file</button>
    {analysis&&<div className="adapter-preview-card">
      <div><Sparkles size={14}/><strong>{analysis.artifactType==="theme"?(analysis.theme?.name||"Detected theme"):(preview?.name||name)}</strong></div>
      <div className="adapter-chip-row"><span>{analysis.artifactType}</span><span>{analysis.kind}</span>{analysis.animated&&<span>animated</span>}<span>{analysis.texts.length} texts</span><span>{analysis.media.length} media</span></div>
      {preview&&<span>{preview.children?.length||0} top-level editable groups</span>}
      {!!analysis.dependencies.length&&<code>{analysis.dependencies.slice(0,7).join(" · ")}</code>}
      {analysis.theme&&<div className="detected-theme-swatches">{Object.values(analysis.theme.colors).slice(0,6).map((color,i)=><i key={`${color}-${i}`} style={{background:color}}/>)}</div>}
    </div>}
    {analysis?.artifactType==="theme"?<button className="phase4-primary" disabled={!analysis.theme} onClick={applyTheme}><WandSparkles size={14}/>Apply detected theme</button>:<div className="prompt-action-grid"><button className="phase4-secondary" disabled={!source.trim()} onClick={save}><Save size={14}/>{editingId?"Update saved block":"Save to library"}</button><button className="phase4-secondary" disabled={!source.trim()} onClick={add}><Plus size={14}/>Add once</button><button className="phase4-primary" disabled={!source.trim()} onClick={saveAndAdd}><Sparkles size={14}/>{editingId?"Update + add":"Save + add"}</button></div>}

    <div className="imported-blocks-head"><div><span className="panel-kicker">Project registry</span><strong>Saved imports</strong></div><span>{project.importedBlocks.length}</span></div>
    <div className="imported-block-list">{project.importedBlocks.length===0?<div className="empty-imports">Saved prompt/code blocks will appear here.</div>:project.importedBlocks.map(block=><article key={block.id} className={`imported-block-row ${editingId===block.id?"editing":""}`}>
      <div className="imported-thumb" style={block.thumbnail?{backgroundImage:`url(${block.thumbnail})`}:undefined}>{!block.thumbnail&&<FileCode2 size={15}/>}</div>
      <div className="imported-block-copy"><strong>{block.name}</strong><span>{block.detectedKind||"section"} · r{block.revision||1}{block.animated?" · animated":""}</span>{block.dependencies?.length?<code>{block.dependencies.slice(0,3).join(" · ")}</code>:null}</div>
      <div className="imported-block-actions"><button title="Add to canvas" onClick={()=>{addNode(cloneNode(block.node));setSidebarTab("layers");}}><Plus size={13}/></button><button title="Edit source" disabled={!block.source} onClick={()=>edit(block)}><FileCode2 size={13}/></button><button title="Re-convert latest saved source" disabled={!block.source} onClick={()=>reconvertImportedBlock(block.id)}><RefreshCw size={13}/></button><button className="danger" title="Delete saved import" onClick={()=>deleteImportedBlock(block.id)}><Trash2 size={13}/></button></div>
    </article>)}</div>
    <div className="prompt-safe-note"><Sparkles size={14}/><span>Re-convert keeps the same library ID and increments its revision, so saved source can improve as the adapter engine evolves.</span></div>
  </section>;
}
