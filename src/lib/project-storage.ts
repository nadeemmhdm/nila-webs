import type { BuilderPage, BuilderProject, ProjectSummary } from "../types";
import { uid } from "./nodes";
import { createDefaultFooter, createDefaultNavbar } from "../templates/library";
import { buildSiteTemplate } from "../templates/site-templates";
import { defaultTheme } from "../templates/themes";
import { defaultDesignSystem, ensureResponsiveProject } from "./design-system";
import { defaultMotionSystem, normalizeMotionProject } from "./motion";
import { defaultPageSeo, defaultSeoSettings, normalizePageSeo, normalizePath, normalizeSeoSettings } from "./site-settings";
import { defaultSecuritySettings, normalizeSecuritySettings } from "./discoverability";

const INDEX_KEY = "nila-webs-project-index-v1";
const ACTIVE_KEY = "nila-webs-active-project-v1";
const LEGACY_KEY = "nila-webs-project-v2";
const keyFor = (id: string) => `nila-webs-project:${id}`;
const recoveryKeyFor = (id: string) => `nila-webs-recovery:${id}`;
const RECOVERY_LIMIT = 12;

export interface ProjectRecoverySnapshot { id: string; projectId: string; createdAt: string; reason: "autosave" | "manual" | "pre-overwrite"; project: BuilderProject; }

export function normalizeProject(raw: Partial<BuilderProject> & Record<string, unknown>): BuilderProject {
  const inputPages = Array.isArray(raw.pages) && raw.pages.length ? raw.pages as BuilderPage[] : [{
    id: uid("page"), name: "Home", path: "/", nodes: [], showNavbar: true, showFooter: true, seo: defaultPageSeo("Home")
  }];
  const pages = inputPages.map(page => ({ ...page, path: normalizePath(page.path), seo: normalizePageSeo(page) }));
  const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString();
  const project: BuilderProject = {
    id: typeof raw.id === "string" && raw.id ? raw.id : uid("project"),
    name: typeof raw.name === "string" && raw.name ? raw.name : "Untitled Project",
    description: typeof raw.description === "string" ? raw.description : "",
    templateId: typeof raw.templateId === "string" ? raw.templateId : "blank",
    pages,
    activePageId: typeof raw.activePageId === "string" && pages.some(p => p.id === raw.activePageId) ? raw.activePageId : pages[0].id,
    globalNavbar: raw.globalNavbar || createDefaultNavbar(),
    globalFooter: raw.globalFooter || createDefaultFooter(),
    assets: Array.isArray(raw.assets) ? raw.assets : [],
    components: Array.isArray(raw.components) ? raw.components : [],
    importedBlocks: Array.isArray(raw.importedBlocks) ? raw.importedBlocks : [],
    theme: raw.theme && typeof raw.theme === "object" ? raw.theme : structuredClone(defaultTheme),
    savedThemes: Array.isArray(raw.savedThemes) ? raw.savedThemes : [],
    favoriteLibraryIds: Array.isArray(raw.favoriteLibraryIds) ? raw.favoriteLibraryIds.filter((id): id is string => typeof id === "string") : [],
    designSystem: raw.designSystem && typeof raw.designSystem === "object" ? { ...structuredClone(defaultDesignSystem), ...(raw.designSystem as any), breakpoints:{...defaultDesignSystem.breakpoints,...((raw.designSystem as any).breakpoints||{})}, contentPadding:{...defaultDesignSystem.contentPadding,...((raw.designSystem as any).contentPadding||{})}, spacing:{...defaultDesignSystem.spacing,...((raw.designSystem as any).spacing||{})}, typography:{...defaultDesignSystem.typography,...((raw.designSystem as any).typography||{})} } : structuredClone(defaultDesignSystem),
    motionSystem: raw.motionSystem && typeof raw.motionSystem === "object" ? { ...structuredClone(defaultMotionSystem), ...(raw.motionSystem as any) } : structuredClone(defaultMotionSystem),
    seo: normalizeSeoSettings(raw.seo as any, typeof raw.name === "string" && raw.name ? raw.name : "Untitled Project"),
    security: normalizeSecuritySettings(raw.security as any),
    createdAt,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : createdAt,
    schemaVersion: 10
  };
  return normalizeMotionProject(ensureResponsiveProject(project));
}

export function createProjectModel(name = "Untitled Project", description = "", templateId = "blank"): BuilderProject {
  const now = new Date().toISOString();
  const built = templateId === "blank" ? undefined : buildSiteTemplate(templateId);
  const home: BuilderPage = { id: uid("page"), name: "Home", path: "/", nodes: [], showNavbar: true, showFooter: true, seo: defaultPageSeo("Home") };
  const pages = built?.pages || [home];
  return {
    id: uid("project"), name: name.trim() || "Untitled Project", description: description.trim(), templateId,
    pages, activePageId: pages[0].id, globalNavbar: built?.globalNavbar || createDefaultNavbar(), globalFooter: built?.globalFooter || createDefaultFooter(), assets: [], components: [], importedBlocks: [],
    theme: built?.theme || structuredClone(defaultTheme), savedThemes: [], favoriteLibraryIds: [], designSystem: structuredClone(defaultDesignSystem), motionSystem: structuredClone(defaultMotionSystem), seo: defaultSeoSettings(name.trim() || "Untitled Project"), security: structuredClone(defaultSecuritySettings),
    createdAt: now, updatedAt: now, schemaVersion: 10
  };
}

export function projectSummary(project: BuilderProject): ProjectSummary {
  return {
    id: project.id, name: project.name, description: project.description || "", templateId: project.templateId || "blank",
    createdAt: project.createdAt, updatedAt: project.updatedAt, pageCount: project.pages.length, assetCount: project.assets.length
  };
}

function readIndexRaw(): ProjectSummary[] {
  try {
    const value = localStorage.getItem(INDEX_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeIndex(list: ProjectSummary[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(list.sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))));
}

export function listProjects(): ProjectSummary[] {
  migrateLegacyProject();
  return readIndexRaw().sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveProject(project: BuilderProject): BuilderProject {
  const previous = loadProjectById(project.id);
  if (previous) createRecoverySnapshot(previous, "pre-overwrite");
  const next = normalizeProject({ ...project, updatedAt: new Date().toISOString() });
  localStorage.setItem(keyFor(next.id), JSON.stringify(next));
  localStorage.setItem(ACTIVE_KEY, next.id);
  const list = readIndexRaw();
  const summary = projectSummary(next);
  const index = list.findIndex(item => item.id === next.id);
  if (index >= 0) list[index] = summary; else list.unshift(summary);
  writeIndex(list);
  window.dispatchEvent(new CustomEvent("nila-projects-changed", { detail: summary }));
  return next;
}

export function loadProjectById(id: string): BuilderProject | null {
  try {
    const value = localStorage.getItem(keyFor(id));
    if (!value) return null;
    return normalizeProject(JSON.parse(value));
  } catch { return null; }
}

export function loadInitialProject(): BuilderProject {
  migrateLegacyProject();
  const activeId = localStorage.getItem(ACTIVE_KEY);
  const active = activeId ? loadProjectById(activeId) : null;
  if (active) return active;
  const first = listProjects()[0];
  const existing = first ? loadProjectById(first.id) : null;
  return existing || createProjectModel("Untitled Project");
}

export function deleteProjectFromStorage(id: string) {
  localStorage.removeItem(keyFor(id));
  localStorage.removeItem(recoveryKeyFor(id));
  const list = readIndexRaw().filter(item => item.id !== id);
  writeIndex(list);
  if (localStorage.getItem(ACTIVE_KEY) === id) localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new CustomEvent("nila-projects-changed"));
}

export function duplicateStoredProject(id: string): BuilderProject | null {
  const project = loadProjectById(id);
  if (!project) return null;
  const copy = structuredClone(project);
  const now = new Date().toISOString();
  copy.id = uid("project");
  copy.name = `${project.name} Copy`;
  copy.createdAt = now;
  copy.updatedAt = now;
  copy.assets = [];
  return saveProject(copy);
}

export function importProjectToStorage(raw: BuilderProject): BuilderProject {
  const normalized = normalizeProject(raw as BuilderProject & Record<string, unknown>);
  return saveProject(normalized);
}

export function listProjectRecoverySnapshots(projectId: string): ProjectRecoverySnapshot[] {
  try {
    const raw = localStorage.getItem(recoveryKeyFor(projectId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(item => item && item.projectId === projectId).sort((a,b) => b.createdAt.localeCompare(a.createdAt)) : [];
  } catch { return []; }
}

export function createRecoverySnapshot(project: BuilderProject, reason: ProjectRecoverySnapshot["reason"] = "manual"): ProjectRecoverySnapshot {
  const snapshot: ProjectRecoverySnapshot = { id: uid("recovery"), projectId: project.id, createdAt: new Date().toISOString(), reason, project: structuredClone(project) };
  const current = listProjectRecoverySnapshots(project.id);
  const next = [snapshot, ...current].slice(0, RECOVERY_LIMIT);
  localStorage.setItem(recoveryKeyFor(project.id), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("nila-projects-changed"));
  return snapshot;
}

export function restoreRecoverySnapshot(projectId: string, snapshotId: string): BuilderProject | null {
  const snapshot = listProjectRecoverySnapshots(projectId).find(item => item.id === snapshotId);
  if (!snapshot) return null;
  const restored = normalizeProject({ ...structuredClone(snapshot.project), updatedAt: new Date().toISOString() });
  localStorage.setItem(keyFor(projectId), JSON.stringify(restored));
  localStorage.setItem(ACTIVE_KEY, projectId);
  const list = readIndexRaw();
  const summary = projectSummary(restored);
  const index = list.findIndex(item => item.id === projectId);
  if (index >= 0) list[index] = summary; else list.unshift(summary);
  writeIndex(list);
  window.dispatchEvent(new CustomEvent("nila-projects-changed", { detail: summary }));
  return restored;
}

export function deleteRecoverySnapshot(projectId: string, snapshotId: string) {
  const next = listProjectRecoverySnapshots(projectId).filter(item => item.id !== snapshotId);
  localStorage.setItem(recoveryKeyFor(projectId), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("nila-projects-changed"));
}

export function clearProjectRecovery(projectId: string) {
  localStorage.removeItem(recoveryKeyFor(projectId));
  window.dispatchEvent(new CustomEvent("nila-projects-changed"));
}

export function exportProjectBackup(project: BuilderProject) {
  createRecoverySnapshot(project, "manual");
  const payload = JSON.stringify({ format: "nila-webs-project-backup", version: 1, exportedAt: new Date().toISOString(), project: normalizeProject(project as BuilderProject & Record<string, unknown>) }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "nila-webs-project"}.nila.json`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function parseProjectBackup(text: string): BuilderProject {
  const raw = JSON.parse(text);
  const project = raw?.format === "nila-webs-project-backup" ? raw.project : raw;
  if (!project || typeof project !== "object") throw new Error("Invalid Nila Webs project backup");
  return normalizeProject(project);
}

function migrateLegacyProject() {
  if (localStorage.getItem(INDEX_KEY)) return;
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    const project = normalizeProject(JSON.parse(legacy));
    saveProject(project);
    localStorage.removeItem(LEGACY_KEY);
  } catch { /* ignore malformed legacy state */ }
}
