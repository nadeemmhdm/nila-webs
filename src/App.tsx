import Canvas from "./components/Canvas";
import LeftSidebar from "./components/LeftSidebar";
import PropertiesPanel from "./components/PropertiesPanel";
import Topbar from "./components/Topbar";
import { useBuilder } from "./store/builder";

export default function App() {
  const { previewMode, leftCollapsed, rightCollapsed } = useBuilder();
  const gridTemplateColumns = previewMode
    ? "1fr"
    : `${leftCollapsed ? "0px" : "310px"} minmax(0,1fr) ${rightCollapsed ? "0px" : "330px"}`;
  return (
    <div className="app-shell">
      <Topbar />
      <div className="builder-layout" style={{ gridTemplateColumns }}>
        {!previewMode && <div className={`panel-slot left-slot ${leftCollapsed ? "collapsed" : ""}`}><LeftSidebar /></div>}
        <Canvas />
        {!previewMode && <div className={`panel-slot right-slot ${rightCollapsed ? "collapsed" : ""}`}><PropertiesPanel /></div>}
      </div>
    </div>
  );
}
