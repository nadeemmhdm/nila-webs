import type { CSSProperties, DragEvent } from "react";
import { MousePointer2 } from "lucide-react";
import { useBuilder } from "../store/builder";
import NodeRenderer from "./NodeRenderer";
import { themeVars } from "../templates/themes";

export default function Canvas() {
  const { project, viewport, previewMode, livePreview, addNode, moveNode, setSelected } = useBuilder();
  const page = project.pages.find(p => p.id === project.activePageId)!;
  const drop = (e: DragEvent) => {
    e.preventDefault();
    const library = e.dataTransfer.getData("application/nila-library");
    const moving = e.dataTransfer.getData("application/nila-node");
    if (library) { const { item } = JSON.parse(library); addNode(item, null); }
    else if (moving) moveNode(moving, null);
  };
  const readOnly = previewMode || livePreview;
  return <main className={`workspace ${previewMode ? "full-preview" : ""}`} onClick={() => !readOnly && setSelected(null)}>
    {!previewMode && <div className="canvas-toolbar"><span>{page.name}</span><span className="canvas-path">{page.path}</span>{livePreview && <span className="live-pill"><MousePointer2 size={12}/> Live interactions</span>}</div>}
    <div className={`canvas-frame ${viewport} ${readOnly ? "interactive" : "editing"}`} onDragOver={e => !readOnly && e.preventDefault()} onDrop={drop}>
      <div className="site-canvas" style={themeVars(project.theme) as CSSProperties}>
        {page.showNavbar && <NodeRenderer node={project.globalNavbar} readOnly={readOnly}/>} 
        <div className="page-body">
          {page.nodes.length === 0 && !readOnly ? <div className="canvas-empty"><div className="empty-icon">＋</div><strong>Drop a section or element here</strong><span>Double-click blocks in the library for fast insertion, or drag them onto the page.</span></div> : page.nodes.map(node => <NodeRenderer key={node.id} node={node} readOnly={readOnly}/>) }
        </div>
        {page.showFooter && <NodeRenderer node={project.globalFooter} readOnly={readOnly}/>} 
      </div>
    </div>
  </main>;
}
