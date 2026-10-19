import { Blocks, Box, LayoutTemplate, Search, Sparkles, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useBuilder } from "../store/builder";
import { elementLibrary, sectionLibrary, siteTemplateLibrary } from "../templates/library";
import { phase3ElementLibrary } from "../templates/phase3-elements";
import type { LibraryItem } from "../types";

type Tab = "elements" | "sections" | "templates";

export default function LibraryPanel() {
  const [tab, setTab] = useState<Tab>("sections");
  const [query, setQuery] = useState("");
  const { addNode, replaceCurrentPageNodes } = useBuilder();
  const source = tab === "elements" ? [...elementLibrary, ...phase3ElementLibrary] : tab === "sections" ? sectionLibrary : siteTemplateLibrary;
  const items = useMemo(() => source.filter(item => `${item.name} ${item.group || ""} ${item.description || ""}`.toLowerCase().includes(query.toLowerCase())), [source, query]);
  const grouped = useMemo(() => Object.entries(items.reduce<Record<string, LibraryItem[]>>((acc, item) => { const key = item.group || "Other"; (acc[key] ||= []).push(item); return acc; }, {})), [items]);

  const drag = (e: React.DragEvent, item: LibraryItem) => {
    if (!item.create) return;
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/nila-library", JSON.stringify({ item: item.create() }));
  };
  const useTemplate = (item: LibraryItem) => {
    if (!item.createPageNodes) return;
    if (confirm(`Replace this page with the ${item.name}?`)) replaceCurrentPageNodes(item.createPageNodes());
  };

  return <section className="panel-body library-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Visual library</span><h2>Build</h2></div><Sparkles size={17}/></div>
    <div className="tab-strip">
      <button className={tab === "elements" ? "active" : ""} onClick={() => setTab("elements")}><Box size={14}/>Elements</button>
      <button className={tab === "sections" ? "active" : ""} onClick={() => setTab("sections")}><Blocks size={14}/>Sections</button>
      <button className={tab === "templates" ? "active" : ""} onClick={() => setTab("templates")}><LayoutTemplate size={14}/>Templates</button>
    </div>
    <label className="panel-search"><Search size={15}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${tab}…`}/></label>
    <div className="library-scroll">{grouped.map(([group, groupItems]) => <div className="library-group" key={group}><div className="library-group-title">{group}</div><div className="library-grid">{groupItems.map(item => <article
      key={item.id}
      className={`library-card ${tab === "templates" ? "template-card" : ""}`}
      draggable={!!item.create}
      onDragStart={e => drag(e, item)}
      onDoubleClick={() => item.create && addNode(item.create())}
    >
      <div className="block-thumb">{tab === "elements" ? <Box size={21}/> : tab === "sections" ? <Blocks size={23}/> : <WandSparkles size={23}/>}</div>
      <strong>{item.name}</strong>{item.description && <p>{item.description}</p>}
      {item.sourceId && <span className="source-chip">{item.sourceId}</span>}
      {item.create && <button className="insert-button" onClick={() => addNode(item.create!())}>Add</button>}
      {item.createPageNodes && <button className="insert-button template-use" onClick={() => useTemplate(item)}>Use template</button>}
    </article>)}</div></div>)}</div>
  </section>;
}
