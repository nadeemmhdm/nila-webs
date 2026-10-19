import type { BuilderProject } from "../types";
import { buildReactViteFiles, type ExportCssMode, type ReactViteFile } from "./exporter";

export interface GitHubPublishOptions {
  token: string;
  owner: string;
  repo: string;
  branch?: string;
  commitMessage?: string;
  createIfMissing?: boolean;
  privateRepo?: boolean;
  cssMode?: ExportCssMode;
}

export interface GitHubPublishResult {
  repositoryUrl: string;
  commitSha: string;
  branch: string;
  fileCount: number;
}

type Progress = (message: string) => void;

const api = "https://api.github.com";
const enc = encodeURIComponent;

async function gh<T>(url: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  if (!response.ok) {
    const text = await response.text();
    let message = text;
    try { message = JSON.parse(text)?.message || text; } catch { /* keep raw */ }
    const error = new Error(`GitHub ${response.status}: ${message}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function fileToGitBlob(file: ReactViteFile) {
  if (typeof file === "string") return { content: file, encoding: "utf-8" as const };
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const size = 0x8000;
  for (let i = 0; i < bytes.length; i += size) binary += String.fromCharCode(...bytes.subarray(i, i + size));
  return { content: btoa(binary), encoding: "base64" as const };
}

async function mapLimit<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>) {
  const out = new Array<R>(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length || 1) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      out[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return out;
}

export async function publishReactViteToGitHub(project: BuilderProject, options: GitHubPublishOptions, onProgress: Progress = () => {}): Promise<GitHubPublishResult> {
  const token = options.token.trim();
  const owner = options.owner.trim();
  const repo = options.repo.trim();
  const branch = (options.branch || "main").trim() || "main";
  if (!token || !owner || !repo) throw new Error("GitHub token, owner and repository name are required.");

  onProgress("Generating watermarked React + Vite source files with provenance preflight…");
  const files = await buildReactViteFiles(project, { cssMode: options.cssMode || "css" });
  const entries = [...files.entries()];

  let repository: any;
  try {
    repository = await gh<any>(`${api}/repos/${enc(owner)}/${enc(repo)}`, token);
  } catch (error) {
    const status = (error as Error & { status?: number }).status;
    if (status !== 404 || !options.createIfMissing) throw error;
    const me = await gh<any>(`${api}/user`, token);
    if (String(me.login).toLowerCase() !== owner.toLowerCase()) throw new Error("Creating a missing repository is only supported for the authenticated GitHub account owner.");
    onProgress("Creating GitHub repository…");
    repository = await gh<any>(`${api}/user/repos`, token, { method: "POST", body: JSON.stringify({ name: repo, private: !!options.privateRepo, auto_init: false }) });
  }

  onProgress(`Uploading ${entries.length} generated source files…`);
  const treeEntries = await mapLimit(entries, 4, async ([path, file], index) => {
    onProgress(`Uploading ${index + 1}/${entries.length}: ${path}`);
    const payload = await fileToGitBlob(file);
    const blob = await gh<any>(`${api}/repos/${enc(owner)}/${enc(repo)}/git/blobs`, token, { method: "POST", body: JSON.stringify(payload) });
    return { path, mode: "100644", type: "blob", sha: blob.sha };
  });

  let parentSha: string | undefined;
  let baseTreeSha: string | undefined;
  let refExists = false;
  try {
    const ref = await gh<any>(`${api}/repos/${enc(owner)}/${enc(repo)}/git/ref/heads/${enc(branch)}`, token);
    refExists = true;
    parentSha = ref.object.sha;
    const commit = await gh<any>(`${api}/repos/${enc(owner)}/${enc(repo)}/git/commits/${parentSha}`, token);
    baseTreeSha = commit.tree.sha;
  } catch (error) {
    const status = (error as Error & { status?: number }).status;
    if (status !== 404 && status !== 409) throw error;
  }

  onProgress("Creating repository tree…");
  const tree = await gh<any>(`${api}/repos/${enc(owner)}/${enc(repo)}/git/trees`, token, {
    method: "POST",
    body: JSON.stringify({ ...(baseTreeSha ? { base_tree: baseTreeSha } : {}), tree: treeEntries })
  });
  const commit = await gh<any>(`${api}/repos/${enc(owner)}/${enc(repo)}/git/commits`, token, {
    method: "POST",
    body: JSON.stringify({ message: options.commitMessage?.trim() || `Publish ${project.name} from Nila Webs`, tree: tree.sha, parents: parentSha ? [parentSha] : [] })
  });

  if (refExists) {
    await gh(`${api}/repos/${enc(owner)}/${enc(repo)}/git/refs/heads/${enc(branch)}`, token, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
  } else {
    await gh(`${api}/repos/${enc(owner)}/${enc(repo)}/git/refs`, token, { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }) });
  }

  onProgress("GitHub publish complete.");
  return { repositoryUrl: repository.html_url || `https://github.com/${owner}/${repo}`, commitSha: commit.sha, branch, fileCount: entries.length };
}
