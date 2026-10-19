import { Boxes, FileStack, Layers3 } from "lucide-react";
import { useBuilder } from "../store/builder";
import LayersPanel from "./LayersPanel";
import LibraryPanel from "./LibraryPanel";
import PagesPanel from "./PagesPanel";

export default function LeftSidebar() {
  const { sidebarTab, setSidebarTab } = useBuilder();
  return <aside className="left-sidebar">
    <div className="activity-tabs">
      <button className={sidebarTab === "library" ? "active" : ""} onClick={() => setSidebarTab("library")} title="Elements and sections"><Boxes size={18}/><span>Build</span></button>
      <button className={sidebarTab === "pages" ? "active" : ""} onClick={() => setSidebarTab("pages")} title="Pages"><FileStack size={18}/><span>Pages</span></button>
      <button className={sidebarTab === "layers" ? "active" : ""} onClick={() => setSidebarTab("layers")} title="Layers"><Layers3 size={18}/><span>Layers</span></button>
    </div>
    <div className="sidebar-content">
      {sidebarTab === "library" && <LibraryPanel/>}
      {sidebarTab === "pages" && <PagesPanel/>}
      {sidebarTab === "layers" && <LayersPanel/>}
    </div>
  </aside>;
}
