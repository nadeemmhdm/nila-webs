import { Blocks, Box, Check, Filter, LayoutTemplate, Search, Sparkles, Star, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useBuilder } from "../store/builder";
import { elementLibrary, sectionLibrary } from "../templates/library";
import { phase3ElementLibrary } from "../templates/phase3-elements";
import { suppliedPromptCatalog } from "../templates/prompt-catalog";
import { siteTemplateRegistry } from "../templates/site-templates";
import { catalogItemToNode } from "../lib/prompt-adapter";
import type { LibraryItem } from "../types";
import { cloneNode } from "../lib/nodes";

type Tab = "elements" | "sections" | "templates";
type SourceFilter = "all" | "native" | "prompt" | "project";
const promptComponentKinds = new Set(["accordion","alert","animated-list","animated-text","dock","autocomplete","avatar"]);

export default function LibraryPanel() {
  const [tab, setTab] = useState<Tab>("sections");
  const [query, setQuery] = useState("");
  const [groupFilter,setGroupFilter]=useState("all");
  const [sourceFilter,setSourceFilter]=useState<SourceFilter>("all");
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const { addNode, project, applySiteTemplate, toggleFavoriteLibraryItem } = useBuilder();

  const componentItems: LibraryItem[] = project.components.map(component => ({
    id: `saved-${component.id}`, name: component.name, group: "Components", category: "elements", sourceType:"project", tags:["component","reusable"],
    description: "Linked reusable project component", create: () => ({ ...cloneNode(component.node), componentId: component.id, componentName: component.name })
  }));
  const importedItems: LibraryItem[] = project.importedBlocks.map(block => ({
    id: `imported-${block.id}`, name: block.name, group: block.artifactType === "component" ? "Imported Components" : (block.group || "Imported Prompts"), category: block.artifactType === "component" ? "elements" : "sections", sourceType:"project", tags:[block.detectedKind||"section",block.artifactType||"section",block.animated?"animated":"static"],
    thumbnail:block.thumbnail, description: `Prompt/code adapter · r${block.revision||1}`, sourceId: block.id, create: () => cloneNode(block.node)
  }));
  const suppliedItems: LibraryItem[] = suppliedPromptCatalog.map(item => ({
    id: `prompt-${item.id}`, name: item.name, group: item.group, category: promptComponentKinds.has(item.kind) ? "elements" : "sections", sourceType:"prompt", tags:[item.kind,promptComponentKinds.has(item.kind)?"component":"section",item.animated?"animated":"static"], thumbnail:item.media[0],
    description: `${item.animated ? "Animated " : ""}editable adapter from your supplied Shadcn/React prompt`, sourceId: item.id, create: () => catalogItemToNode(item)
  }));
  const nativeElements=[...elementLibrary,...phase3ElementLibrary].map(item=>({...item,sourceType:"native" as const,tags:[item.group||"element"]}));
  const nativeSections=sectionLibrary.map(item=>({...item,sourceType:"native" as const,tags:[item.group||"section"]}));
  const templateItems:LibraryItem[]=siteTemplateRegistry.map(template=>({id:`site-${template.id}`,name:template.name,group:template.group,category:"templates",description:`${template.description} · ${template.pageCount} pages`,thumbnail:template.thumbnail,tags:template.tags,sourceType:"native"}));
  const source = tab === "elements" ? [...nativeElements, ...componentItems, ...importedItems.filter(item=>item.category==="elements"), ...suppliedItems.filter(item=>item.category==="elements")] : tab === "sections" ? [...nativeSections, ...importedItems.filter(item=>item.category==="sections"), ...suppliedItems.filter(item=>item.category==="sections")] : templateItems;
  const groups=useMemo(()=>["all",...Array.from(new Set(source.map(item=>item.group||"Other"))).sort()],[source]);
  const items = useMemo(() => source.filter(item => {
    const text=`${item.name} ${item.group||""} ${item.description||""} ${(item.tags||[]).join(" ")}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (groupFilter==="all"||(item.group||"Other")===groupFilter) && (sourceFilter==="all"||item.sourceType===sourceFilter) && (!favoritesOnly||project.favoriteLibraryIds.includes(item.id));
  }), [source, query, groupFilter, sourceFilter, favoritesOnly, project.favoriteLibraryIds]);
  const grouped = useMemo(() => Object.entries(items.reduce<Record<string, LibraryItem[]>>((acc, item) => { const key = item.group || "Other"; (acc[key] ||= []).push(item); return acc; }, {})), [items]);

  const drag = (e: React.DragEvent, item: LibraryItem) => {
    if (!item.create) return;
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/nila-library", JSON.stringify({ item: item.create() }));
  };
  const useTemplate=(item:LibraryItem)=>{const id=item.id.replace(/^site-/,"");if(confirm(`Replace this project pages, global navigation and theme with “${item.name}”?`))applySiteTemplate(id);};

  return <section className="panel-body library-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Registry</span><h2>Build</h2></div><Sparkles size={17}/></div>
    <div className="tab-strip">
      <button className={tab === "elements" ? "active" : ""} onClick={() => {setTab("elements");setGroupFilter("all");}}><Box size={14}/>Elements</button>
      <button className={tab === "sections" ? "active" : ""} onClick={() => {setTab("sections");setGroupFilter("all");}}><Blocks size={14}/>Sections</button>
      <button className={tab === "templates" ? "active" : ""} onClick={() => {setTab("templates");setGroupFilter("all");}}><LayoutTemplate size={14}/>Templates</button>
    </div>
    <label className="panel-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${tab}, tags, source…`}/></label>
    <div className="library-filter-bar">
      <label><Filter size={13}/><select value={groupFilter} onChange={e=>setGroupFilter(e.target.value)}>{groups.map(group=><option key={group} value={group}>{group==="all"?"All groups":group}</option>)}</select></label>
      <select value={sourceFilter} onChange={e=>setSourceFilter(e.target.value as SourceFilter)}><option value="all">All sources</option><option value="native">Native</option><option value="prompt">Prompt catalog</option><option value="project">Project</option></select>
      <button className={favoritesOnly?"active":""} onClick={()=>setFavoritesOnly(v=>!v)}><Star size={13} fill={favoritesOnly?"currentColor":"none"}/>Favorites</button>
    </div>
    <div className="library-stats"><span>{items.length} result{items.length===1?"":"s"}</span>{tab==="sections"&&<span>{suppliedPromptCatalog.length} supplied adapters</span>}{tab==="templates"&&<span>{siteTemplateRegistry.reduce((sum,t)=>sum+t.pageCount,0)} template pages</span>}</div>
    <div className="library-scroll">{!grouped.length?<div className="library-empty-filter"><Search size={20}/><strong>No matching blocks</strong><span>Change search, group, source or favorites filter.</span></div>:grouped.map(([group, groupItems]) => <div className="library-group" key={group}><div className="library-group-title">{group}</div><div className="library-grid">{groupItems.map(item => {
      const favorite=project.favoriteLibraryIds.includes(item.id);
      return <article key={item.id} className={`library-card ${tab === "templates" ? "template-card" : ""} ${item.sourceType==="prompt" ? "catalog-card" : ""}`} draggable={!!item.create} onDragStart={e => drag(e, item)} onDoubleClick={() => item.create && addNode(item.create())}>
        <div className={`block-thumb thumb-${slugGroup(item.group||tab)}`} style={item.thumbnail?{backgroundImage:`linear-gradient(180deg,transparent,#05081666),url(${item.thumbnail})`}:undefined}>{!item.thumbnail&&(tab === "elements" ? <Box size={21}/> : tab === "sections" ? <Blocks size={23}/> : <WandSparkles size={23}/>)}</div>
        <button className={`favorite-block ${favorite?"active":""}`} title={favorite?"Remove favorite":"Add favorite"} onClick={e=>{e.stopPropagation();toggleFavoriteLibraryItem(item.id);}}><Star size={13} fill={favorite?"currentColor":"none"}/></button>
        <div className="library-card-source"><span>{item.sourceType||"native"}</span>{item.tags?.includes("animated")&&<i>motion</i>}</div>
        <strong>{item.name}</strong>{item.description && <p>{item.description}</p>}
        {item.sourceId && <span className="source-chip">{item.sourceId}</span>}
        {item.create && <button className="insert-button" onClick={() => addNode(item.create!())}>Add</button>}
        {tab==="templates"&&<button className="insert-button template-use" onClick={()=>useTemplate(item)}><Check size={13}/>Use full site</button>}
      </article>;
    })}</div></div>)}</div>
  </section>;
}

function slugGroup(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
