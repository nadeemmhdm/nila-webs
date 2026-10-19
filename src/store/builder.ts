import { create } from "zustand";
import type { BuilderNode, BuilderPage, BuilderProject, NodeStyle, ProjectAsset, Viewport } from "../types";
import { appendNode, cloneNode, findNode, mapNode, moveNode as moveTreeNode, removeNode, reorderNode, uid } from "../lib/nodes";
import { createProjectModel, loadInitialProject, normalizeProject, saveProject } from "../lib/project-storage";

const HISTORY_LIMIT = 60;
const load = (): BuilderProject => loadInitialProject();
const persist = (project: BuilderProject) => saveProject(project);
const snapshot = (project: BuilderProject) => structuredClone(project);

export type SidebarTab = "pages" | "library" | "layers" | "assets";

type State = {
  project: BuilderProject;
  selectedId: string | null;
  viewport: Viewport;
  previewMode: boolean;
  livePreview: boolean;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  sidebarTab: SidebarTab;
  past: BuilderProject[];
  future: BuilderProject[];
  clipboard: BuilderNode | null;

  setSelected: (id: string | null) => void;
  setViewport: (v: Viewport) => void;
  setPreviewMode: (v: boolean) => void;
  setLivePreview: (v: boolean) => void;
  toggleLeft: () => void;
  toggleRight: () => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setProjectName: (name: string) => void;
  setProjectDescription: (description: string) => void;
  addProjectAsset: (asset: ProjectAsset) => void;
  removeProjectAsset: (assetId: string) => void;
  undo: () => void;
  redo: () => void;

  addPage: () => void;
  removePage: (id: string) => void;
  setActivePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  updatePagePath: (id: string, path: string) => void;
  togglePageGlobal: (id: string, key: "showNavbar" | "showFooter", value: boolean) => void;
  replaceCurrentPageNodes: (nodes: BuilderNode[]) => void;

  addNode: (node: BuilderNode, parentId?: string | null) => void;
  moveNode: (id: string, targetParentId?: string | null) => void;
  nudgeNode: (id: string, direction: -1 | 1) => void;
  updateNode: (id: string, patch: Partial<BuilderNode>) => void;
  updateStyle: (id: string, patch: Partial<NodeStyle>) => void;
  setNodeHidden: (id: string, viewport: Viewport, hidden: boolean) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => void;
  copyNode: (id: string) => void;
  pasteNode: (parentId?: string | null) => void;
  syncSymbolInstances: (id: string) => void;
  loadProject: (project: BuilderProject) => void;
  reset: () => void;
};

function commit(s: State, project: BuilderProject, extra: Partial<State> = {}): Partial<State> {
  const next = { ...project, updatedAt: new Date().toISOString() };
  persist(next);
  return { project: next, past: [...s.past.slice(-(HISTORY_LIMIT - 1)), snapshot(s.project)], future: [], ...extra };
}

export const useBuilder = create<State>((set, get) => ({
  project: load(), selectedId: null, viewport: "desktop", previewMode: false, livePreview: false,
  leftCollapsed: false, rightCollapsed: false, sidebarTab: "library", past: [], future: [], clipboard: null,

  setSelected: selectedId => set({ selectedId }),
  setViewport: viewport => set({ viewport }),
  setPreviewMode: previewMode => set({ previewMode, selectedId: previewMode ? null : get().selectedId }),
  setLivePreview: livePreview => set({ livePreview, selectedId: livePreview ? null : get().selectedId }),
  toggleLeft: () => set(s => ({ leftCollapsed: !s.leftCollapsed })),
  toggleRight: () => set(s => ({ rightCollapsed: !s.rightCollapsed })),
  setSidebarTab: sidebarTab => set({ sidebarTab, leftCollapsed: false }),
  setProjectName: name => set(s => commit(s, { ...s.project, name })),
  setProjectDescription: description => set(s => commit(s, { ...s.project, description })),
  addProjectAsset: asset => set(s => commit(s, { ...s.project, assets: [...s.project.assets.filter(a => a.id !== asset.id), asset] })),
  removeProjectAsset: assetId => set(s => commit(s, { ...s.project, assets: s.project.assets.filter(a => a.id !== assetId) })),

  undo: () => set(s => {
    const previous = s.past.at(-1); if (!previous) return s;
    persist(previous);
    return { project: snapshot(previous), past: s.past.slice(0, -1), future: [snapshot(s.project), ...s.future].slice(0, HISTORY_LIMIT), selectedId: null };
  }),
  redo: () => set(s => {
    const next = s.future[0]; if (!next) return s;
    persist(next);
    return { project: snapshot(next), past: [...s.past, snapshot(s.project)].slice(-HISTORY_LIMIT), future: s.future.slice(1), selectedId: null };
  }),

  addPage: () => set(s => {
    const number = s.project.pages.length + 1;
    const page: BuilderPage = { id: uid("page"), name: `Page ${number}`, path: `/page-${number}`, nodes: [], showNavbar: true, showFooter: true };
    return commit(s, { ...s.project, pages: [...s.project.pages, page], activePageId: page.id }, { selectedId: null });
  }),
  removePage: id => set(s => {
    if (s.project.pages.length === 1) return s;
    const pages = s.project.pages.filter(p => p.id !== id);
    return commit(s, { ...s.project, pages, activePageId: s.project.activePageId === id ? pages[0].id : s.project.activePageId }, { selectedId: null });
  }),
  setActivePage: activePageId => set(s => ({ project: { ...s.project, activePageId }, selectedId: null })),
  renamePage: (id, name) => set(s => commit(s, { ...s.project, pages: s.project.pages.map(p => p.id === id ? { ...p, name } : p) })),
  updatePagePath: (id, path) => set(s => {
    const normalized = path === "/" ? "/" : `/${path.replace(/^\/+/, "").replace(/\s+/g, "-")}`;
    return commit(s, { ...s.project, pages: s.project.pages.map(p => p.id === id ? { ...p, path: normalized } : p) });
  }),
  togglePageGlobal: (id, key, value) => set(s => commit(s, { ...s.project, pages: s.project.pages.map(p => p.id === id ? { ...p, [key]: value } : p) })),
  replaceCurrentPageNodes: nodes => set(s => commit(s, { ...s.project, pages: s.project.pages.map(p => p.id === s.project.activePageId ? { ...p, nodes: nodes.map(cloneNode) } : p) }, { selectedId: null })),

  addNode: (node, parentId = null) => set(s => {
    if (node.type === "navbar") return commit(s, { ...s.project, globalNavbar: node }, { selectedId: node.id });
    if (node.type === "footer") return commit(s, { ...s.project, globalFooter: node }, { selectedId: node.id });
    const pages = s.project.pages.map(p => p.id === s.project.activePageId ? { ...p, nodes: appendNode(p.nodes, parentId, node) } : p);
    return commit(s, { ...s.project, pages }, { selectedId: node.id });
  }),
  moveNode: (id, targetParentId = null) => set(s => {
    const pages = s.project.pages.map(p => p.id === s.project.activePageId ? { ...p, nodes: moveTreeNode(p.nodes, id, targetParentId) } : p);
    return commit(s, { ...s.project, pages }, { selectedId: id });
  }),
  nudgeNode: (id, direction) => set(s => {
    const pages = s.project.pages.map(p => p.id === s.project.activePageId ? { ...p, nodes: reorderNode(p.nodes, id, direction) } : p);
    return commit(s, { ...s.project, pages }, { selectedId: id });
  }),
  updateNode: (id, patch) => set(s => {
    let project = s.project;
    if (findNode([project.globalNavbar], id)) project = { ...project, globalNavbar: mapNode([project.globalNavbar], id, n => ({ ...n, ...patch }))[0] };
    else if (findNode([project.globalFooter], id)) project = { ...project, globalFooter: mapNode([project.globalFooter], id, n => ({ ...n, ...patch }))[0] };
    else project = { ...project, pages: project.pages.map(p => ({ ...p, nodes: mapNode(p.nodes, id, n => ({ ...n, ...patch })) })) };
    return commit(s, project);
  }),
  updateStyle: (id, patch) => {
    const s = get(); const node = getNodeAnywhere(s.project, id); if (!node) return;
    if (s.viewport === "desktop") s.updateNode(id, { style: { ...node.style, ...patch } });
    else s.updateNode(id, { responsive: { ...(node.responsive || {}), [s.viewport]: { ...(node.responsive?.[s.viewport] || {}), ...patch } } });
  },
  setNodeHidden: (id, viewport, hidden) => {
    const node = getNodeAnywhere(get().project, id); if (!node) return;
    get().updateNode(id, { hiddenOn: { ...(node.hiddenOn || {}), [viewport]: hidden } });
  },
  deleteNode: id => set(s => {
    if (findNode([s.project.globalNavbar], id) || findNode([s.project.globalFooter], id)) return s;
    const pages = s.project.pages.map(p => ({ ...p, nodes: removeNode(p.nodes, id) }));
    return commit(s, { ...s.project, pages }, { selectedId: s.selectedId === id ? null : s.selectedId });
  }),
  duplicateNode: id => {
    const s = get(); const page = s.project.pages.find(p => p.id === s.project.activePageId); const node = page && findNode(page.nodes, id);
    if (node) s.addNode(cloneNode(node));
  },
  copyNode: id => {
    const node = getNodeAnywhere(get().project, id); if (node) set({ clipboard: cloneNode(node) });
  },
  pasteNode: (parentId = null) => { const clip = get().clipboard; if (clip) get().addNode(cloneNode(clip), parentId); },
  syncSymbolInstances: id => set(s => {
    const source = getNodeAnywhere(s.project, id);
    if (!source || source.type !== "symbol") return s;
    const syncKey = source.symbolSyncKey || uid("symbol-sync");
    const sourceWithKey: BuilderNode = { ...source, symbolSyncKey: syncKey };
    const syncTree = (nodes: BuilderNode[]): BuilderNode[] => nodes.map(node => {
      if (node.id === source.id) return sourceWithKey;
      const sameSymbol = node.type === "symbol" && ((node.symbolSyncKey && node.symbolSyncKey === syncKey) || (!node.symbolSyncKey && node.componentName === source.componentName));
      if (sameSymbol) {
        return {
          ...node,
          componentName: source.componentName,
          symbolSyncKey: syncKey,
          style: structuredClone(source.style),
          responsive: structuredClone(source.responsive || {}),
          hiddenOn: structuredClone(source.hiddenOn || {}),
          animation: source.animation,
          hoverAnimation: source.hoverAnimation,
          animationDuration: source.animationDuration,
          animationDelay: source.animationDelay,
          children: source.children?.map(cloneNode)
        };
      }
      return { ...node, children: node.children ? syncTree(node.children) : node.children };
    });
    const pages = s.project.pages.map(page => ({ ...page, nodes: syncTree(page.nodes) }));
    return commit(s, { ...s.project, pages }, { selectedId: id });
  }),
  loadProject: project => { const normalized = normalizeProject(project as BuilderProject & Record<string, unknown>); persist(normalized); set({ project: normalized, selectedId: null, past: [], future: [] }); },
  reset: () => {
    const current = get().project;
    const fresh = createProjectModel(current.name, current.description || "", "blank");
    const project: BuilderProject = { ...fresh, id: current.id, createdAt: current.createdAt };
    persist(project); set({ project, selectedId: null, past: [], future: [] });
  }
}));

export function getNodeAnywhere(project: BuilderProject, id: string): BuilderNode | undefined {
  return findNode([project.globalNavbar], id) || findNode([project.globalFooter], id) || project.pages.map(p => findNode(p.nodes, id)).find(Boolean);
}
