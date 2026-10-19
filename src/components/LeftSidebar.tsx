import { Boxes, FileCode2, FileStack, Images, Layers3, Palette } from "lucide-react";
import { useBuilder } from "../store/builder";
import AssetsPanel from "./AssetsPanel";
import LayersPanel from "./LayersPanel";
import LibraryPanel from "./LibraryPanel";
import PagesPanel from "./PagesPanel";
import PromptImportPanel from "./PromptImportPanel";
import ThemePanel from "./ThemePanel";

export default function LeftSidebar() {
  const { sidebarTab, setSidebarTab } = useBuilder();
  return <aside className="left-sidebar">
    <div className="activity-tabs">
      <button className={sidebarTab === "library" ? "active" : ""} onClick={() => setSidebarTab("library")} title="Elements and sections"><Boxes size={18}/><span>Build</span></button>
      <button className={sidebarTab === "pages" ? "active" : ""} onClick={() => setSidebarTab("pages")} title="Pages"><FileStack size={18}/><span>Pages</span></button>
      <button className={sidebarTab === "layers" ? "active" : ""} onClick={() => setSidebarTab("layers")} title="Layers"><Layers3 size={18}/><span>Layers</span></button>
      <button className={sidebarTab === "assets" ? "active" : ""} onClick={() => setSidebarTab("assets")} title="Project assets"><Images size={18}/><span>Assets</span></button>
      <button className={sidebarTab === "themes" ? "active" : ""} onClick={() => setSidebarTab("themes")} title="Theme system"><Palette size={18}/><span>Themes</span></button>
      <button className={sidebarTab === "import" ? "active" : ""} onClick={() => setSidebarTab("import")} title="Import prompt/code"><FileCode2 size={18}/><span>Import</span></button>
    </div>
    <div className="sidebar-content">
      {sidebarTab === "library" && <LibraryPanel/>}
      {sidebarTab === "pages" && <PagesPanel/>}
      {sidebarTab === "layers" && <LayersPanel/>}
      {sidebarTab === "assets" && <AssetsPanel/>}
      {sidebarTab === "themes" && <ThemePanel/>}
      {sidebarTab === "import" && <PromptImportPanel/>}
    </div>
  </aside>;
}
