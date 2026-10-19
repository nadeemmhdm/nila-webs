import type { BuilderNode, BuilderPage, BuilderProject, PageSeo, SeoSettings, SiteAuditIssue, SiteAuditResult } from "../types";

export const defaultSeoSettings = (name = "Nila Webs Site"): SeoSettings => ({
  siteTitle: name,
  titleTemplate: `%s | ${name}`,
  description: "",
  siteUrl: "",
  language: "en",
  defaultImage: "",
  favicon: "",
  index: true,
  follow: true,
  generateSitemap: true,
  generateRobots: true
});

export const defaultPageSeo = (name = "Page"): PageSeo => ({ title: name, description: "", image: "", canonical: "", noIndex: false });

export function normalizeSeoSettings(raw: Partial<SeoSettings> | undefined, name: string): SeoSettings {
  return { ...defaultSeoSettings(name), ...(raw || {}) };
}

export function normalizePageSeo(page: Partial<BuilderPage>): PageSeo {
  return { ...defaultPageSeo(page.name || "Page"), ...(page.seo || {}) };
}

export function normalizePath(path: string) {
  const trimmed = (path || "/").trim();
  if (trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

export function normalizeAnchor(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function resolveSeoTitle(project: BuilderProject, page: BuilderPage) {
  const pageTitle = page.seo?.title?.trim() || page.name;
  const template = project.seo.titleTemplate || "%s";
  return template.includes("%s") ? template.replace("%s", pageTitle) : `${pageTitle} | ${template}`;
}

export function collectPageAnchors(page: BuilderPage) {
  const anchors: Array<{ id: string; nodeId: string; name: string }> = [];
  const walk = (node: BuilderNode) => {
    if (node.anchorId) anchors.push({ id: node.anchorId, nodeId: node.id, name: node.name });
    node.children?.forEach(walk);
  };
  page.nodes.forEach(walk);
  return anchors;
}

function allNodes(project: BuilderProject) {
  const out: BuilderNode[] = [];
  const walk = (node: BuilderNode) => { out.push(node); node.children?.forEach(walk); };
  walk(project.globalNavbar); walk(project.globalFooter); project.pages.forEach(page => page.nodes.forEach(walk));
  return out;
}

export function auditSite(project: BuilderProject): SiteAuditResult {
  const issues: SiteAuditIssue[] = [];
  const add = (severity: SiteAuditIssue["severity"], code: string, message: string, pageId?: string, nodeId?: string) => issues.push({ severity, code, message, pageId, nodeId });
  const paths = new Map<string, string>();
  const anchors = new Set<string>();
  const duplicateAnchors = new Set<string>();

  for (const page of project.pages) {
    const normalized = normalizePath(page.path);
    if (paths.has(normalized)) add("error", "duplicate-path", `Duplicate page path: ${normalized}`, page.id);
    paths.set(normalized, page.id);
    if (!page.seo?.title?.trim()) add("warning", "seo-title", `${page.name}: add an SEO title.`, page.id);
    if (!page.seo?.description?.trim()) add("warning", "seo-description", `${page.name}: add a meta description.`, page.id);
    for (const anchor of collectPageAnchors(page)) {
      const key = `${page.id}:${anchor.id}`;
      if (anchors.has(key)) duplicateAnchors.add(key); else anchors.add(key);
    }
  }
  duplicateAnchors.forEach(key => add("error", "duplicate-anchor", `Duplicate anchor id: ${key.split(":").slice(1).join(":")}`));

  if (!project.seo.siteTitle.trim()) add("error", "site-title", "Site title is empty.");
  if (!project.seo.description.trim()) add("warning", "site-description", "Add a default site description.");
  if (!project.seo.favicon.trim()) add("info", "favicon", "Add a favicon URL or exported asset path.");
  if (project.seo.siteUrl && !/^https?:\/\//i.test(project.seo.siteUrl)) add("warning", "site-url", "Site URL should start with http:// or https://.");

  for (const node of allNodes(project)) {
    if ((node.type === "image" || node.type === "avatar") && node.src && !node.alt?.trim()) add("warning", "image-alt", `${node.name}: missing alt text.`, undefined, node.id);
    if ((node.type === "button" || node.type === "link") && !node.content?.trim()) add("error", "link-label", `${node.name}: interactive link has no visible label.`, undefined, node.id);
    if ((node.type === "button" || node.type === "link") && !node.href?.trim()) add("warning", "link-target", `${node.name}: link target is empty.`, undefined, node.id);
    if (["input","textarea","select","checkbox","radio","range","file"].includes(node.type) && !node.nameAttr?.trim()) add("warning", "field-name", `${node.name}: add a form field name.`, undefined, node.id);
    if (node.type === "form" && node.formProvider !== "none" && !node.formAction?.trim()) add("error", "form-endpoint", `${node.name}: submission provider requires an endpoint.`, undefined, node.id);
  }
  const errors = issues.filter(i => i.severity === "error").length;
  const warnings = issues.filter(i => i.severity === "warning").length;
  return { score: Math.max(0, Math.min(100, 100 - errors * 12 - warnings * 4)), issues };
}
