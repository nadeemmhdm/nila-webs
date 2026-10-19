import type { AssetKind, BuilderProject, ProjectAsset } from "../types";
import { uid } from "./nodes";

const DB_NAME = "nila-webs-assets";
const STORE = "asset-blobs";
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const blobKey = (projectId: string, assetId: string) => `${projectId}:${assetId}`;

export async function putAssetBlob(projectId: string, assetId: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, blobKey(projectId, assetId));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getAssetBlob(projectId: string, assetId: string): Promise<Blob | null> {
  const db = await openDb();
  const result = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(blobKey(projectId, assetId));
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function deleteAssetBlob(projectId: string, assetId: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(blobKey(projectId, assetId));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

function safeFileName(name: string, fallbackExt: string) {
  const lastDot = name.lastIndexOf(".");
  const rawExt = lastDot > -1 ? name.slice(lastDot + 1) : fallbackExt;
  const ext = rawExt.replace(/[^a-z0-9]/gi, "").toLowerCase() || fallbackExt;
  const base = (lastDot > -1 ? name.slice(0, lastDot) : name)
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "asset";
  return `${base}.${ext}`;
}

export async function createUploadedAsset(projectId: string, file: File, kind: AssetKind): Promise<ProjectAsset> {
  const id = uid("asset");
  const fallbackExt = kind === "video" ? "mp4" : "png";
  const original = safeFileName(file.name || `asset.${fallbackExt}`, fallbackExt);
  const dot = original.lastIndexOf(".");
  const fileName = `${original.slice(0, dot)}-${id.slice(-6)}${original.slice(dot)}`;
  await putAssetBlob(projectId, id, file);
  return { id, name: file.name || fileName, fileName, kind, source: "upload", mimeType: file.type, size: file.size, createdAt: new Date().toISOString() };
}

export function createLinkedAsset(url: string, kind: AssetKind, name?: string): ProjectAsset {
  const id = uid("asset");
  let guessed = name || (url.split("/").pop()?.split("?")[0] || `${kind}-link`);
  if (!guessed.trim()) guessed = `${kind}-link`;
  return { id, name: guessed, fileName: safeFileName(guessed, kind === "video" ? "mp4" : "png"), kind, source: "url", url: url.trim(), createdAt: new Date().toISOString() };
}

export function getAssetByRef(project: BuilderProject, src?: string): ProjectAsset | undefined {
  if (!src?.startsWith("asset://")) return undefined;
  return project.assets.find(asset => asset.id === src.slice("asset://".length));
}

export async function resolveAssetRef(project: BuilderProject, src?: string): Promise<{ url: string; revoke?: () => void }> {
  if (!src) return { url: "" };
  const asset = getAssetByRef(project, src);
  if (!asset) return { url: src };
  if (asset.source === "url") return { url: asset.url || "" };
  const blob = await getAssetBlob(project.id, asset.id);
  if (!blob) return { url: "" };
  const url = URL.createObjectURL(blob);
  return { url, revoke: () => URL.revokeObjectURL(url) };
}

export function exportedAssetUrl(asset: ProjectAsset): string {
  return asset.source === "upload" ? `assets/${asset.fileName}` : (asset.url || "");
}

export function humanFileSize(size?: number) {
  if (!size) return "Linked asset";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
