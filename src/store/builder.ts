import { create } from "zustand";
import type { BuilderNode, BuilderPage, BuilderProject, ImportedBlock, NodeStyle, ProjectAsset, ProjectTheme, SavedComponent, Viewport } from "../types";
import { appendNode, cloneNode, findNode, mapNode, moveNode as moveTreeNode, removeNode, reorderNode, uid } from "../lib/nodes";
import { createProjectModel, loadInitialProject, normalizeProject, saveProject } from "../lib/project-storage";
import { reconvertImportedBlock as reconvertBlock } from "../lib/prompt-adapter";
import { buildSiteTemplate } from "../templates/site-templates";

const HISTORY_LIMIT = 60;
const load = (): BuilderProject => loadInitialProject();
const persist = (project: BuilderProject) => saveProject(project);
const snapshot = (project: BuilderProject) => structuredClone(project);

function componentTemplate(node: BuilderNode): BuilderNode {
  const next = structuredClone(node);
  delete next.componentId;
  return next;
}

function replaceComponentInstances(nodes: BuilderNode[], componentId: string, template: BuilderNode): BuilderNode[] {
  return nodes.map(node => {
    if (node.componentId === componentId) {
      const synced = cloneNode(template);
      return { ...synced, id: node.id, componentId, componentName: node.componentName || template.componentName || template.name };
    }
    return { ...node, children: node.children ? replaceComponentInstances(node.children, componentId, template) : node.children };
  });
}

function detachComponentInstances(nodes: BuilderNode[], componentId: string): BuilderNode[] {
  return nodes.map(node => ({
    ...node,
    componentId: node.componentId === componentId ? undefined : node.componentId,
    children: node.children ? detachComponentInstances(node.children, componentId) : node.children
  }));
}

export type SidebarTab = "pages" | "library" | "layers" | "assets" | "themes" | "import";

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
  setTheme: (theme: ProjectTheme) => void;
  saveCurrentTheme: (name?: string) => void;
  deleteSavedTheme: (themeId: string) => void;
  restyleCurrentPage: () => void;
  toggleFavoriteLibraryItem: (itemId: string) => void;
  addImportedBlock: (block: ImportedBlock) => void;
  reconvertImportedBlock: (blockId: string) => void;
  deleteImportedBlock: (blockId: string) => void;
  applySiteTemplate: (templateId: string) => void;
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
  saveNodeAsComponent: (id: string, name?: string) => void;
  syncComponentFromNode: (id: string) => void;
  detachComponent: (id: string) => void;
  deleteComponent: (componentId: string) => void;
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
  setTheme: theme => set(s => commit(s, { ...s.project, theme: structuredClone(theme) })),
  saveCurrentTheme: name => set(s => {
    const now = Date.now().toString(36);
    const saved: ProjectTheme = { ...structuredClone(s.project.theme), id: s.project.theme.id.startsWith("saved-") ? s.project.theme.id : `saved-${now}`, name: (name || s.project.theme.name || "Saved Theme").trim(), source: "custom" };
    return commit(s, { ...s.project, theme: saved, savedThemes: [...s.project.savedThemes.filter(t => t.id !== saved.id), saved] });
  }),
  deleteSavedTheme: themeId => set(s => commit(s, { ...s.project, savedThemes: s.project.savedThemes.filter(t => t.id !== themeId) })),
  restyleCurrentPage: () => set(s => {
    const theme = s.project.theme;
    const restyle = (nodes: BuilderNode[]): BuilderNode[] => nodes.map(node => {
      const next = { ...node, style: { ...node.style }, children: node.children ? restyle(node.children) : node.children };
      if (node.type === "section") { next.style.background = "var(--nw-background)"; next.style.color = "var(--nw-text)"; }
      if (["card","container","form","modal","tabs","accordion","table"].includes(node.type)) { if (node.style.background !== "transparent") next.style.background = "var(--nw-surface)"; next.style.borderColor = "var(--nw-border)"; }
      if (node.type === "heading") next.style.color = "var(--nw-text)";
      if (["text","label","list"].includes(node.type)) next.style.color = "var(--nw-muted)";
      if (node.type === "button") { next.style.background = "var(--nw-primary)"; next.style.color = "var(--nw-primary-text)"; }
      if (node.type === "link") next.style.color = "var(--nw-primary)";
      if (node.style.borderRadius && node.style.borderRadius !== "0px") next.style.borderRadius = "var(--nw-radius)";
      if (node.style.boxShadow && node.style.boxShadow !== "none") next.style.boxShadow = "var(--nw-shadow)";
      return next;
    });
    const pages = s.project.pages.map(page => page.id === s.project.activePageId ? { ...page, nodes: restyle(page.nodes) } : page);
    return commit(s, { ...s.project, pages, theme });
  }),
  toggleFavoriteLibraryItem: itemId => set(s => {
    const favorites = s.project.favoriteLibraryIds.includes(itemId) ? s.project.favoriteLibraryIds.filter(id => id !== itemId) : [...s.project.favoriteLibraryIds, itemId];
    return commit(s, { ...s.project, favoriteLibraryIds: favorites });
  }),
  addImportedBlock: block => set(s => commit(s, { ...s.project, importedBlocks: [...s.project.importedBlocks.filter(item => item.id !== block.id), block] })),
  reconvertImportedBlock: blockId => set(s => {
    const block = s.project.importedBlocks.find(item => item.id === blockId);
    if (!block?.source) return s;
    const updated = reconvertBlock(block);
    return commit(s, { ...s.project, importedBlocks: s.project.importedBlocks.map(item => item.id === blockId ? updated : item) });
  }),
  deleteImportedBlock: blockId => set(s => commit(s, { ...s.project, importedBlocks: s.project.importedBlocks.filter(item => item.id !== blockId) })),
  applySiteTemplate: templateId => set(s => {
    const built = buildSiteTemplate(templateId);
    if (!built) return s;
    const pages = built.pages.map(page => ({ ...page, nodes: page.nodes.map(cloneNode) }));
    return commit(s, { ...s.project, templateId, pages, activePageId: pages[0].id, globalNavbar: built.globalNavbar, globalFooter: built.globalFooter, theme: structuredClone(built.theme) }, { selectedId: null });
  }),

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
  saveNodeAsComponent: (id, name) => set(s => {
    const source = getNodeAnywhere(s.project, id);
    if (!source) return s;
    const now = new Date().toISOString();
    const componentId = source.componentId || uid("component");
    const componentName = (name || source.componentName || source.name || "Component").trim();
    const definition: SavedComponent = { id: componentId, name: componentName, node: componentTemplate(source), createdAt: now, updatedAt: now };
    const components = [...s.project.components.filter(item => item.id !== componentId), definition];
    let project = { ...s.project, components };
    if (findNode([project.globalNavbar], id)) project = { ...project, globalNavbar: mapNode([project.globalNavbar], id, n => ({ ...n, componentId, componentName }))[0] };
    else if (findNode([project.globalFooter], id)) project = { ...project, globalFooter: mapNode([project.globalFooter], id, n => ({ ...n, componentId, componentName }))[0] };
    else project = { ...project, pages: project.pages.map(page => ({ ...page, nodes: mapNode(page.nodes, id, n => ({ ...n, componentId, componentName })) })) };
    return commit(s, project);
  }),
  syncComponentFromNode: id => set(s => {
    const source = getNodeAnywhere(s.project, id);
    if (!source?.componentId) return s;
    const componentId = source.componentId;
    const template = componentTemplate(source);
    const existing = s.project.components.find(item => item.id === componentId);
    const now = new Date().toISOString();
    const component: SavedComponent = { id: componentId, name: source.componentName || existing?.name || source.name, node: template, createdAt: existing?.createdAt || now, updatedAt: now };
    const project = {
      ...s.project,
      components: [...s.project.components.filter(item => item.id !== componentId), component],
      globalNavbar: replaceComponentInstances([s.project.globalNavbar], componentId, template)[0],
      globalFooter: replaceComponentInstances([s.project.globalFooter], componentId, template)[0],
      pages: s.project.pages.map(page => ({ ...page, nodes: replaceComponentInstances(page.nodes, componentId, template) }))
    };
    return commit(s, project, { selectedId: id });
  }),
  detachComponent: id => set(s => {
    const source = getNodeAnywhere(s.project, id);
    if (!source?.componentId) return s;
    let project = s.project;
    if (findNode([project.globalNavbar], id)) project = { ...project, globalNavbar: mapNode([project.globalNavbar], id, n => ({ ...n, componentId: undefined }))[0] };
    else if (findNode([project.globalFooter], id)) project = { ...project, globalFooter: mapNode([project.globalFooter], id, n => ({ ...n, componentId: undefined }))[0] };
    else project = { ...project, pages: project.pages.map(page => ({ ...page, nodes: mapNode(page.nodes, id, n => ({ ...n, componentId: undefined })) })) };
    return commit(s, project);
  }),
  deleteComponent: componentId => set(s => commit(s, {
    ...s.project,
    components: s.project.components.filter(item => item.id !== componentId),
    globalNavbar: detachComponentInstances([s.project.globalNavbar], componentId)[0],
    globalFooter: detachComponentInstances([s.project.globalFooter], componentId)[0],
    pages: s.project.pages.map(page => ({ ...page, nodes: detachComponentInstances(page.nodes, componentId) }))
  })),
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
