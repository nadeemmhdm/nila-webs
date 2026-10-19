import type { BuilderNode, BuilderPage, BuilderProject, QualityAuditResult, SecuritySettings, SiteAuditIssue } from "../types";

export const defaultSecuritySettings: SecuritySettings = {
  enableHeaders: true,
  headersPreset: "balanced",
  contentSecurityPolicy: "default-src 'self'; img-src 'self' https: data: blob:; media-src 'self' https: data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:; font-src 'self' https: data:; frame-src https:; form-action 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests",
  referrerPolicy: "strict-origin-when-cross-origin",
  frameOptions: "SAMEORIGIN",
  permissionsPolicy: "camera=(), microphone=(), geolocation=(), payment=()",
  strictTransportSecurity: "max-age=31536000; includeSubDomains",
  crossOriginOpenerPolicy: "same-origin",
  generateSecurityTxt: false,
  securityContact: "",
  securityPolicyUrl: "",
  securityExpires: "",
  securityAcknowledgments: ""
};

export function normalizeSecuritySettings(raw?: Partial<SecuritySettings>): SecuritySettings {
  return { ...defaultSecuritySettings, ...(raw || {}) };
}

const trimBase = (value = "") => value.trim().replace(/\/+$/, "");
const pageUrl = (project: BuilderProject, page: BuilderPage) => {
  const base = trimBase(project.seo.siteUrl);
  if (!base) return page.path || "/";
  return `${base}${page.path === "/" ? "/" : page.path}`;
};

export function buildRobotsText(project: BuilderProject) {
  if (project.seo.robotsMode === "custom" && project.seo.robotsContent.trim()) return `${project.seo.robotsContent.trim()}\n`;
  const lines = ["User-agent: *", project.seo.index === false ? "Disallow: /" : "Allow: /"];
  if (project.seo.generateSitemap && project.seo.siteUrl) lines.push(`Sitemap: ${trimBase(project.seo.siteUrl)}/sitemap.xml`);
  return `${lines.join("\n")}\n`;
}

export function buildLlmsText(project: BuilderProject) {
  if (project.seo.llmsMode === "custom" && project.seo.llmsContent.trim()) return `${project.seo.llmsContent.trim()}\n`;
  const title = project.seo.siteTitle || project.name;
  const summary = project.seo.description || project.description || `Official information for ${title}.`;
  const topics = project.seo.keyTopics.split(",").map(v => v.trim()).filter(Boolean);
  const lines = [`# ${title}`, "", `> ${summary}`];
  if (topics.length) lines.push("", `Key topics: ${topics.join(", ")}.`);
  if (project.seo.organizationName) lines.push("", `Publisher: ${project.seo.organizationName}.`);
  lines.push("", "## Pages");
  for (const page of project.pages.filter(page => !page.seo?.noIndex)) {
    const note = page.seo?.answerSummary?.trim() || page.seo?.description?.trim() || page.name;
    lines.push(`- [${page.seo?.title || page.name}](${pageUrl(project, page)}): ${note}`);
  }
  lines.push("", "## Guidance", "- Prefer canonical page URLs when citing this site.", "- Treat page content and structured metadata as authoritative only for this site.");
  return `${lines.join("\n")}\n`;
}

export function buildSecurityTxt(project: BuilderProject) {
  const security = project.security;
  if (!security.generateSecurityTxt) return "";
  const lines: string[] = [];
  if (security.securityContact.trim()) lines.push(`Contact: ${security.securityContact.trim()}`);
  if (security.securityExpires.trim()) lines.push(`Expires: ${security.securityExpires.trim()}`);
  if (project.seo.siteUrl) lines.push(`Canonical: ${trimBase(project.seo.siteUrl)}/.well-known/security.txt`);
  if (security.securityPolicyUrl.trim()) lines.push(`Policy: ${security.securityPolicyUrl.trim()}`);
  if (security.securityAcknowledgments.trim()) lines.push(`Acknowledgments: ${security.securityAcknowledgments.trim()}`);
  return lines.length ? `${lines.join("\n")}\n` : "";
}

export function buildSecurityHeaders(project: BuilderProject) {
  const s = project.security;
  if (!s.enableHeaders) return "";
  const headers: Array<[string,string]> = [
    ["Content-Security-Policy", s.contentSecurityPolicy],
    ["Referrer-Policy", s.referrerPolicy],
    ["X-Frame-Options", s.frameOptions],
    ["Permissions-Policy", s.permissionsPolicy],
    ["Strict-Transport-Security", s.strictTransportSecurity],
    ["Cross-Origin-Opener-Policy", s.crossOriginOpenerPolicy],
    ["X-Content-Type-Options", "nosniff"]
  ].filter(([,value]) => !!value?.trim()) as Array<[string,string]>;
  return `/*\n${headers.map(([name,value]) => `  ${name}: ${value}`).join("\n")}\n`;
}

export function buildVercelSecurityConfig(project: BuilderProject) {
  if (!project.security.enableHeaders) return "";
  const s = project.security;
  const headers = [
    ["Content-Security-Policy", s.contentSecurityPolicy], ["Referrer-Policy", s.referrerPolicy], ["X-Frame-Options", s.frameOptions],
    ["Permissions-Policy", s.permissionsPolicy], ["Strict-Transport-Security", s.strictTransportSecurity], ["Cross-Origin-Opener-Policy", s.crossOriginOpenerPolicy], ["X-Content-Type-Options", "nosniff"]
  ].filter(([,value]) => !!value?.trim()).map(([key,value]) => ({ key, value }));
  return JSON.stringify({ headers: [{ source: "/(.*)", headers }] }, null, 2);
}

function walk(nodes: BuilderNode[], visit: (node: BuilderNode) => void) {
  for (const node of nodes) { visit(node); if (node.children) walk(node.children, visit); }
}

function pageNodes(page: BuilderPage) {
  const nodes: BuilderNode[] = [];
  walk(page.nodes, node => nodes.push(node));
  return nodes;
}

function faqEntries(page: BuilderPage) {
  const out: Array<{ question: string; answer: string }> = [];
  for (const node of pageNodes(page)) if (node.type === "accordion") for (const item of node.items || []) if (item.title && item.body) out.push({ question: item.title, answer: item.body });
  return out;
}

export function buildPageJsonLd(project: BuilderProject, page: BuilderPage) {
  const seo = page.seo;
  const type = seo?.schemaType || "WebPage";
  const url = seo?.canonical || pageUrl(project, page);
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    name: seo?.title || page.name,
    description: seo?.description || project.seo.description,
    url
  };
  const author = seo?.author || project.seo.defaultAuthor;
  if (author) base.author = { "@type": "Person", name: author };
  if (seo?.dateModified) base.dateModified = seo.dateModified;
  if (seo?.image || project.seo.defaultImage) base.image = seo?.image || project.seo.defaultImage;
  if (seo?.entityName) base.about = { "@type": "Thing", name: seo.entityName };
  const citations = (seo?.citations || "").split("\n").map(v => v.trim()).filter(Boolean);
  if (citations.length) base.citation = citations;
  if (type === "FAQPage") {
    const entries = faqEntries(page);
    if (entries.length) base.mainEntity = entries.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } }));
  }
  return base;
}

export function buildOrganizationJsonLd(project: BuilderProject) {
  if (!project.seo.organizationName) return null;
  const data: Record<string, unknown> = { "@context": "https://schema.org", "@type": "Organization", name: project.seo.organizationName };
  if (project.seo.siteUrl) data.url = trimBase(project.seo.siteUrl);
  if (project.seo.organizationLogo) data.logo = project.seo.organizationLogo;
  return data;
}

const score = (max: number, penalties: number[]) => Math.max(0, Math.min(max, max - penalties.reduce((a,b)=>a+b,0)));

export function auditDiscoverability(project: BuilderProject): QualityAuditResult {
  const issues: SiteAuditIssue[] = [];
  const add = (category: SiteAuditIssue["category"], severity: SiteAuditIssue["severity"], code: string, message: string, points: number, pageId?: string, nodeId?: string) => issues.push({ category, severity, code, message, points, pageId, nodeId });
  const seoPen: number[] = [], aeoPen: number[] = [], geoPen: number[] = [], secPen: number[] = [];
  const penalize = (category: "seo"|"aeo"|"geo"|"security", points: number, severity: SiteAuditIssue["severity"], code: string, message: string, pageId?: string, nodeId?: string) => {
    ({ seo: seoPen, aeo: aeoPen, geo: geoPen, security: secPen }[category]).push(points); add(category, severity, code, message, points, pageId, nodeId);
  };

  if (!project.seo.siteTitle.trim()) penalize("seo", 15, "error", "site-title", "Add a site title.");
  if (project.seo.description.trim().length < 70) penalize("seo", 8, "warning", "site-description", "Write a useful default description (roughly 70–160 characters).");
  if (!/^https:\/\//i.test(project.seo.siteUrl)) penalize("seo", 8, "warning", "https-site-url", "Set the canonical site URL with HTTPS.");
  if (!project.seo.favicon.trim()) penalize("seo", 4, "info", "favicon", "Add a favicon.");
  if (!project.seo.generateSitemap) penalize("seo", 5, "warning", "sitemap", "Enable sitemap.xml generation.");
  if (!project.seo.generateRobots) penalize("seo", 4, "warning", "robots", "Enable robots.txt generation.");
  if (!project.seo.defaultImage.trim()) penalize("seo", 4, "info", "og-image", "Add a default social/Open Graph image.");
  if (!project.seo.organizationName.trim()) penalize("geo", 6, "warning", "organization", "Define the publishing organization/entity.");
  if (!project.seo.keyTopics.trim()) penalize("geo", 8, "warning", "topics", "Add clear key topics for entity/topic consistency.");
  if (!project.seo.generateLlms) penalize("geo", 2, "info", "llms", "Optionally generate llms.txt for agent-friendly site guidance.");
  if (!project.seo.defaultAuthor.trim()) penalize("geo", 5, "info", "author", "Add a default author/expert identity where appropriate.");

  for (const page of project.pages) {
    const pseo = page.seo;
    if (!pseo?.title?.trim()) penalize("seo", 8, "error", "page-title", `${page.name}: add an SEO title.`, page.id);
    else if (pseo.title.length > 65) penalize("seo", 2, "info", "title-length", `${page.name}: title is long; review SERP truncation.`, page.id);
    if (!pseo?.description?.trim()) penalize("seo", 6, "warning", "page-description", `${page.name}: add a meta description.`, page.id);
    if (!pseo?.canonical?.trim() && project.seo.siteUrl) penalize("seo", 1, "info", "canonical-auto", `${page.name}: canonical will be auto-derived; explicit override is optional.`, page.id);
    if (!pseo?.answerSummary?.trim()) penalize("aeo", 7, "warning", "answer-summary", `${page.name}: add a concise answer summary for question/answer engines.`, page.id);
    else if (pseo.answerSummary.length < 40) penalize("aeo", 2, "info", "answer-short", `${page.name}: answer summary could be more complete.`, page.id);
    if (!pageNodes(page).some(n => n.type === "heading")) penalize("aeo", 8, "warning", "heading", `${page.name}: add a clear main heading.`, page.id);
    if (!pageNodes(page).some(n => n.type === "accordion" || n.type === "list" || n.type === "table")) penalize("aeo", 4, "info", "scannable", `${page.name}: add structured/scannable content such as FAQ, list, or table.`, page.id);
    if (!pseo?.schemaType) penalize("geo", 5, "warning", "schema", `${page.name}: select a structured-data type.`, page.id);
    if (!pseo?.entityName?.trim()) penalize("geo", 5, "info", "entity", `${page.name}: define the primary entity/topic.`, page.id);
    if (!pseo?.dateModified?.trim()) penalize("geo", 3, "info", "freshness", `${page.name}: add a last-modified date when content freshness matters.`, page.id);
    if (!pseo?.citations?.trim()) penalize("geo", 3, "info", "citations", `${page.name}: add source/citation URLs for evidence-backed content where relevant.`, page.id);
  }

  if (!project.security.enableHeaders) penalize("security", 20, "error", "security-headers", "Enable export security headers.");
  if (!project.security.contentSecurityPolicy.trim()) penalize("security", 18, "error", "csp", "Configure Content-Security-Policy.");
  if (!project.security.strictTransportSecurity.trim()) penalize("security", 8, "warning", "hsts", "Configure HSTS for HTTPS deployments.");
  if (!project.security.referrerPolicy.trim()) penalize("security", 5, "warning", "referrer-policy", "Configure Referrer-Policy.");
  if (!project.security.permissionsPolicy.trim()) penalize("security", 5, "warning", "permissions-policy", "Configure Permissions-Policy.");
  if (project.security.generateSecurityTxt && !project.security.securityContact.trim()) penalize("security", 8, "error", "security-contact", "security.txt requires a Contact URI.");
  if (!project.security.generateSecurityTxt) penalize("security", 2, "info", "security-txt", "Consider publishing /.well-known/security.txt for vulnerability reporting.");

  const scanNode = (node: BuilderNode) => {
    const urls = [node.href, node.src, node.formAction, ...(node.links || []).map(v=>v.href)].filter(Boolean) as string[];
    for (const url of urls) if (/^http:\/\//i.test(url)) penalize("security", 5, "warning", "mixed-content", `${node.name}: insecure HTTP URL detected.`, undefined, node.id);
    if (node.type === "html" && node.html?.trim()) penalize("security", 3, "info", "custom-html", `${node.name}: custom HTML should be reviewed before publishing.`, undefined, node.id);
    node.children?.forEach(scanNode);
  };
  scanNode(project.globalNavbar); scanNode(project.globalFooter); project.pages.forEach(page => page.nodes.forEach(scanNode));

  const seo = score(100, seoPen), aeo = score(100, aeoPen), geo = score(100, geoPen), security = score(100, secPen);
  return { seo, aeo, geo, security, overall: Math.round((seo + aeo + geo + security) / 4), issues };
}

export const highScoreGuidance = [
  "Use unique page titles and useful descriptions; keep crawl/index settings intentional.",
  "Publish a valid sitemap and robots.txt, and use HTTPS canonical URLs.",
  "Give each important page a concise answer summary plus a clear main heading.",
  "Use JSON-LD structured data that accurately matches visible page content.",
  "Keep organization, author, entity names, topics, dates and claims consistent across pages.",
  "Support important claims with first-party evidence or credible citation URLs where appropriate.",
  "Keep content current; freshness and citation visibility matter for AI answer systems.",
  "Enable a sensible CSP and standard security headers; remove mixed-content HTTP resources.",
  "Treat llms.txt as optional agent guidance, not a ranking guarantee or replacement for robots.txt."
];
