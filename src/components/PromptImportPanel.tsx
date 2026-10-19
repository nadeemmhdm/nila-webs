import { FileCode2, FileUp, Plus, Save, Sparkles } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { importedBlockFromPrompt, promptToNode } from "../lib/prompt-adapter";
import { useBuilder } from "../store/builder";

export default function PromptImportPanel(){
  const [name,setName]=useState("Imported Shadcn Block");
  const [source,setSource]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);
  const { addNode, addImportedBlock, setSidebarTab }=useBuilder();
  const preview=useMemo(()=>source.trim()?promptToNode(source,name):null,[source,name]);
  const loadFile=async(file?:File)=>{if(!file)return;setSource(await file.text());if(name==="Imported Shadcn Block")setName(file.name.replace(/\.[^.]+$/,"").replace(/[-_]+/g," "));};
  const add=()=>{if(!source.trim())return;addNode(promptToNode(source,name));setSidebarTab("layers");};
  const save=()=>{if(!source.trim())return;addImportedBlock(importedBlockFromPrompt(source,name));};
  const saveAndAdd=()=>{if(!source.trim())return;const block=importedBlockFromPrompt(source,name);addImportedBlock(block);addNode(structuredClone(block.node));setSidebarTab("layers");};
  return <section className="panel-body prompt-import-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Prompt adapter</span><h2>Import code</h2></div><FileCode2 size={17}/></div>
    <p className="panel-copy">Paste the Shadcn/React prompt or TSX you send to Nila Webs. The adapter extracts editable copy, media, layout intent and animation hints instead of executing arbitrary code.</p>
    <label className="prompt-field"><span>Block name</span><input value={name} onChange={e=>setName(e.target.value)}/></label>
    <label className="prompt-field"><span>Prompt / React / TSX</span><textarea className="prompt-source" value={source} onChange={e=>setSource(e.target.value)} placeholder="Paste your Shadcn block prompt or React component code here…"/></label>
    <input ref={fileRef} type="file" hidden accept=".txt,.md,.tsx,.ts,.jsx,.js" onChange={e=>loadFile(e.target.files?.[0])}/>
    <button className="phase4-secondary" onClick={()=>fileRef.current?.click()}><FileUp size={14}/>Load prompt/code file</button>
    {preview&&<div className="adapter-preview-card"><div><Sparkles size={14}/><strong>{preview.name}</strong></div><span>{preview.children?.length||0} top-level editable groups</span><code>{String(preview.meta?.sourceId||"prompt-adapter")}</code></div>}
    <div className="prompt-action-grid"><button className="phase4-secondary" disabled={!source.trim()} onClick={add}><Plus size={14}/>Add to canvas</button><button className="phase4-secondary" disabled={!source.trim()} onClick={save}><Save size={14}/>Save block</button></div>
    <button className="phase4-primary" disabled={!source.trim()} onClick={saveAndAdd}><Sparkles size={14}/>Save + add editable block</button>
    <div className="prompt-safe-note"><FileCode2 size={14}/><span>No eval/runtime execution. Imported code is normalized into Nila Webs nodes, then exported as normal React/Vite markup.</span></div>
  </section>;
}
