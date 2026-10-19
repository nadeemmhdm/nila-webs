import { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import LeftSidebar from "./components/LeftSidebar";
import ProjectsHome from "./components/ProjectsHome";
import PropertiesPanel from "./components/PropertiesPanel";
import SplashScreen from "./components/SplashScreen";
import Topbar from "./components/Topbar";
import { useBuilder } from "./store/builder";
import type { BuilderProject } from "./types";

type AppScreen = "splash" | "projects" | "editor";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("splash");
  const { previewMode, leftCollapsed, rightCollapsed, loadProject, setPreviewMode, setLivePreview } = useBuilder();

  useEffect(() => {
    const timer = window.setTimeout(() => setScreen("projects"), 850);
    return () => window.clearTimeout(timer);
  }, []);

  const openProject = (project: BuilderProject) => {
    loadProject(project);
    setPreviewMode(false);
    setLivePreview(false);
    setScreen("editor");
  };
  const goProjects = () => {
    setPreviewMode(false);
    setLivePreview(false);
    setScreen("projects");
  };

  if (screen === "splash") return <SplashScreen/>;
  if (screen === "projects") return <ProjectsHome onOpen={openProject}/>;

  const gridTemplateColumns = previewMode
    ? "1fr"
    : `${leftCollapsed ? "0px" : "310px"} minmax(0,1fr) ${rightCollapsed ? "0px" : "330px"}`;
  return (
    <div className="app-shell">
      <Topbar onProjects={goProjects}/>
      <div className="builder-layout" style={{ gridTemplateColumns }}>
        {!previewMode && <div className={`panel-slot left-slot ${leftCollapsed ? "collapsed" : ""}`}><LeftSidebar /></div>}
        <Canvas />
        {!previewMode && <div className={`panel-slot right-slot ${rightCollapsed ? "collapsed" : ""}`}><PropertiesPanel /></div>}
      </div>
    </div>
  );
}
