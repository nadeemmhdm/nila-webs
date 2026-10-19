import { ChevronDown, ChevronUp, Copy, Eye, EyeOff, Layers3, Trash2 } from "lucide-react";
import { getNodeAnywhere, useBuilder } from "../store/builder";
import type { BuilderNode } from "../types";

export default function LayersPanel() {
  const { project, selectedId, setSelected, nudgeNode, duplicateNode, deleteNode, viewport, setNodeHidden } = useBuilder();
  const page = project.pages.find(p => p.id === project.activePageId)!;
  const roots: BuilderNode[] = [
    ...(page.showNavbar ? [project.globalNavbar] : []),
    ...page.nodes,
    ...(page.showFooter ? [project.globalFooter] : [])
  ];
  return <section className="panel-body">
    <div className="panel-heading"><div><span className="panel-kicker">Document tree</span><h2>Layers</h2></div><Layers3 size={17}/></div>
    <p className="panel-copy">Select nested elements precisely. Use arrows to reorder siblings on the current page.</p>
    <div className="layer-tree">{roots.map(node => <LayerRow key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={setSelected} onUp={() => nudgeNode(node.id,-1)} onDown={() => nudgeNode(node.id,1)} onDuplicate={() => duplicateNode(node.id)} onDelete={() => deleteNode(node.id)} viewport={viewport} onHidden={(hidden: boolean) => setNodeHidden(node.id, viewport, hidden)} global={node.type === "navbar" || node.type === "footer"}/>)}</div>
    {selectedId && getNodeAnywhere(project, selectedId)?.meta?.sourceId && <div className="meta-box"><strong>Block source</strong><span>{String(getNodeAnywhere(project, selectedId)?.meta?.sourceId)}</span></div>}
  </section>;
}

function LayerRow({ node, depth, selectedId, onSelect, onUp, onDown, onDuplicate, onDelete, viewport, onHidden, global }: any) {
  const selected = selectedId === node.id;
  return <div className="layer-node">
    <div className={`layer-row ${selected ? "selected" : ""}`} style={{ paddingLeft: 8 + depth * 14 }} onClick={() => onSelect(node.id)}>
      <span className="layer-dot"/><span className="layer-name">{node.name}</span>
      <div className="layer-actions" onClick={e => e.stopPropagation()}>
        <button onClick={onUp}><ChevronUp size={12}/></button><button onClick={onDown}><ChevronDown size={12}/></button>
        <button onClick={() => onHidden(!node.hiddenOn?.[viewport])}>{node.hiddenOn?.[viewport] ? <EyeOff size={12}/> : <Eye size={12}/>}</button>
        {!global && <><button onClick={onDuplicate}><Copy size={12}/></button><button className="danger" onClick={onDelete}><Trash2 size={12}/></button></>}
      </div>
    </div>
    {node.children?.map((child: BuilderNode) => <LayerRow key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} onUp={() => useBuilder.getState().nudgeNode(child.id,-1)} onDown={() => useBuilder.getState().nudgeNode(child.id,1)} onDuplicate={() => useBuilder.getState().duplicateNode(child.id)} onDelete={() => useBuilder.getState().deleteNode(child.id)} viewport={viewport} onHidden={(hidden:boolean) => useBuilder.getState().setNodeHidden(child.id,viewport,hidden)} global={false}/>) }
  </div>;
}
