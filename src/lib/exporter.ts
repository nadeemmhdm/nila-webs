import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { BuilderNode, BuilderProject, ExportDependencyManifest, ProjectAsset } from "../types";
import { exportedAssetUrl, getAssetBlob } from "./assets";
import { buildLlmsText, buildOrganizationJsonLd, buildPageJsonLd, buildRobotsText, buildSecurityHeaders, buildSecurityTxt, buildVercelSecurityConfig } from "./discoverability";
import { buildReactSourceTextFiles } from "./react-source-codegen";

const json = (v: unknown) => JSON.stringify(v, null, 2);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "nila-webs-site";

export type ReactViteFile = string | Blob;

export async function buildReactViteFiles(project: BuilderProject): Promise<Map<string, ReactViteFile>> {
  const files = new Map<string, ReactViteFile>();
  const exportedProject = structuredClone(project);
  const manifest = buildExportManifest(project);
  const assetFiles = await prepareProjectAssets(project, exportedProject, new Set(manifest.usedAssetIds));
  assetFiles.forEach((value, path) => files.set(path, value));

  files.set("package.json", json({
    name: slug(project.name), private: true, version: "1.0.0", type: "module",
    scripts: { dev: "vite", build: "tsc -b && vite build", preview: "vite preview" },
    dependencies: { react: "^19.0.0", "react-dom": "^19.0.0", "react-router-dom": "^7.0.0" },
    devDependencies: { "@vitejs/plugin-react": "^4.3.0", vite: "^7.0.0", typescript: "^5.7.0", "@types/react": "^19.0.0", "@types/react-dom": "^19.0.0" }
  }));
  files.set("nila.dependencies.json", json(manifest));

  const home = project.pages[0];
  const seoTitle = resolveExportTitle(project, home);
  const seoDescription = home?.seo?.description || project.seo?.description || project.description || "";
  const seoImage = home?.seo?.image || project.seo?.defaultImage || "";
  const canonical = home?.seo?.canonical || absolutePageUrl(project, home?.path || "/");
  const robots = `${project.seo?.index === false || home?.seo?.noIndex ? "noindex" : "index"},${project.seo?.follow === false ? "nofollow" : "follow"}`;
  const jsonLd = [buildOrganizationJsonLd(project), home ? buildPageJsonLd(project, home) : null].filter(Boolean);
  const jsonLdTags = jsonLd.map(data => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g,"\\u003c")}</script>`).join("");
  const twitter = project.seo.twitterSite ? `<meta name="twitter:site" content="${escapeHtml(project.seo.twitterSite)}"/><meta name="twitter:card" content="summary_large_image"/>` : `<meta name="twitter:card" content="summary_large_image"/>`;
  const llmsLink = project.seo.generateLlms ? `<link rel="describedby" href="/llms.txt" type="text/markdown"/>` : "";
  // Vite requires one bootstrap index.html. All actual website pages/sections/components live under src/ as React/TSX.
  files.set("index.html", `<!doctype html><html lang="${escapeHtml(project.seo?.language || "en")}"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><meta name="theme-color" content="${escapeHtml(project.theme?.colors?.background || "#ffffff")}"/><meta name="description" content="${escapeHtml(seoDescription)}"/><meta name="robots" content="${robots}"/><meta property="og:title" content="${escapeHtml(seoTitle)}"/><meta property="og:description" content="${escapeHtml(seoDescription)}"/>${seoImage ? `<meta property="og:image" content="${escapeHtml(seoImage)}"/>` : ""}<meta property="og:type" content="website"/>${twitter}${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}"/>` : ""}${project.seo?.favicon ? `<link rel="icon" href="${escapeHtml(project.seo.favicon)}"/>` : ""}${llmsLink}${jsonLdTags}<title>${escapeHtml(seoTitle)}</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`);
  if (project.seo?.generateSitemap && project.seo.siteUrl) files.set("public/sitemap.xml", buildSitemap(project));
  if (project.seo?.generateRobots) files.set("public/robots.txt", buildRobotsText(project));
  if (project.seo?.generateLlms) files.set("public/llms.txt", buildLlmsText(project));
  if (project.security?.enableHeaders) { files.set("public/_headers", buildSecurityHeaders(project)); files.set("vercel.json", buildVercelSecurityConfig(project)); }
  files.set("public/_redirects", "/* /index.html 200\n");
  const securityTxt = buildSecurityTxt(project); if (securityTxt) files.set("public/.well-known/security.txt", securityTxt);
  files.set("vite.config.ts", `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({ plugins:[react()] });\n`);
  files.set("tsconfig.json", json({ compilerOptions: { target: "ES2022", useDefineForClassFields: true, lib: ["ES2022", "DOM", "DOM.Iterable"], skipLibCheck: true, esModuleInterop: true, allowSyntheticDefaultImports: true, strict: true, module: "ESNext", moduleResolution: "Bundler", resolveJsonModule: true, isolatedModules: true, noEmit: true, jsx: "react-jsx" }, include: ["src"] }));
  files.set("src/main.tsx", `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport { BrowserRouter } from 'react-router-dom';\nimport App from './App';\nimport './styles.css';\nReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);`);
  for (const [path, content] of Object.entries(buildReactSourceTextFiles(exportedProject, manifest))) files.set(path, content);
  files.set("src/styles.css", exportedCss());
  files.set("README.md", `# ${project.name}\n\nGenerated by **Nila Webs** as a real React 19 + Vite + TypeScript source project.\n\n## Source layout\n\n- \`src/pages/\` — one TSX module per website page\n- \`src/sections/\` — editable page sections as React components\n- \`src/components/global/\` — global navbar/footer\n- \`src/components/generated/\` — reusable saved components\n- \`src/imported/\` — safe React adapters created from imported prompt/code\n- \`src/theme/\` — theme, responsive and motion tokens\n- \`src/runtime/\` — interaction/animation renderer used by generated components\n\nThe only HTML file is Vite's required bootstrap \`index.html\`; website pages are not exported as standalone HTML documents. Imported arbitrary source is never executed directly. Nila Webs converts it into safe editable React components and retains source provenance as strings.\n\n## Development\n\n\`npm install\` then \`npm run dev\`.\n\n## Production\n\n\`npm run build\` creates \`dist/\`. BrowserRouter clean URLs are supported by included Cloudflare/Netlify redirects and Vercel rewrites.\n`);
  return files;
}

export async function exportReactVite(project: BuilderProject) {
  const zip = new JSZip();
  const files = await buildReactViteFiles(project);
  for (const [path, content] of files) zip.file(path, content);
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${slug(project.name)}.zip`);
}

function allRootNodes(project: BuilderProject) {
  return [project.globalNavbar, project.globalFooter, ...project.pages.flatMap(page => page.nodes)];
}

function walkNode(node: BuilderNode, visit: (node: BuilderNode) => void) {
  visit(node);
  node.children?.forEach(child => walkNode(child, visit));
}

export function buildExportManifest(project: BuilderProject): ExportDependencyManifest {
  const usedSourceIds = new Set<string>();
  const sourceDependencies = new Set<string>();
  const usedComponentIds = new Set<string>();
  const usedAssetIds = new Set<string>();
  const visit = (node: BuilderNode) => {
    if (node.componentId) usedComponentIds.add(node.componentId);
    const sourceId = typeof node.meta?.sourceId === "string" ? node.meta.sourceId : undefined;
    if (sourceId) usedSourceIds.add(sourceId);
    const deps = typeof node.meta?.dependencies === "string" ? node.meta.dependencies.split("|").map(v => v.trim()).filter(Boolean) : [];
    deps.forEach(dep => sourceDependencies.add(dep));
    const refs = [node.src, ...(node.slides || []).map(slide => slide.src)].filter((ref): ref is string => !!ref && ref.startsWith("asset://"));
    refs.forEach(ref => usedAssetIds.add(ref.slice("asset://".length)));
  };
  allRootNodes(project).forEach(node => walkNode(node, visit));
  let changed = true;
  while (changed) {
    changed = false;
    for (const component of project.components || []) {
      if (!usedComponentIds.has(component.id)) continue;
      const before = usedComponentIds.size;
      walkNode(component.node, visit);
      if (usedComponentIds.size !== before) changed = true;
    }
  }
  return {
    generatedBy: "Nila Webs", schemaVersion: 1, projectId: project.id,
    usedSourceIds: [...usedSourceIds].sort(), sourceDependencies: [...sourceDependencies].sort(),
    runtimeDependencies: ["react", "react-dom", "react-router-dom"],
    usedComponentIds: [...usedComponentIds].sort(), usedAssetIds: [...usedAssetIds].sort()
  };
}

async function prepareProjectAssets(source: BuilderProject, target: BuilderProject, usedAssetIds: Set<string>) {
  const files = new Map<string, Blob | string>();
  files.set("public/assets/.gitkeep", "");
  const byId = new Map<string, ProjectAsset>();
  for (const asset of source.assets || []) {
    byId.set(asset.id, asset);
    if (!usedAssetIds.has(asset.id)) continue;
    if (asset.source === "upload") {
      const blob = await getAssetBlob(source.id, asset.id).catch(() => null);
      if (blob) files.set(`public/assets/${asset.fileName}`, blob);
    }
  }
  const rewriteRef = (ref?: string) => {
    if (!ref?.startsWith("asset://")) return ref;
    const asset = byId.get(ref.slice("asset://".length));
    return asset ? exportedAssetUrl(asset) : ref;
  };
  const rewrite = (node: BuilderNode): BuilderNode => ({
    ...node, src: rewriteRef(node.src), children: node.children?.map(rewrite),
    slides: node.slides?.map(slide => ({ ...slide, src: rewriteRef(slide.src) || slide.src }))
  });
  target.globalNavbar = rewrite(target.globalNavbar);
  target.globalFooter = rewrite(target.globalFooter);
  target.pages = target.pages.map(page => ({ ...page, nodes: page.nodes.map(rewrite) }));
  target.components = (target.components || []).map(component => ({ ...component, node: rewrite(component.node) }));
  target.importedBlocks = (target.importedBlocks || []).map(block => ({ ...block, node: rewrite(block.node) }));
  target.assets = (target.assets || []).filter(asset => usedAssetIds.has(asset.id));
  target.favoriteLibraryIds = [];
  return files;
}

function escapeHtml(s: string) { return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]!)); }

function absolutePageUrl(project: BuilderProject, path: string) {
  const base = (project.seo?.siteUrl || "").replace(/\/+$/, "");
  if (!base) return "";
  return `${base}${path === "/" ? "/" : path}`;
}

function resolveExportTitle(project: BuilderProject, page?: BuilderProject["pages"][number]) {
  const title = page?.seo?.title || page?.name || project.seo?.siteTitle || project.name;
  const template = project.seo?.titleTemplate || "%s";
  return template.includes("%s") ? template.replace("%s", title) : `${title} | ${template}`;
}

function buildSitemap(project: BuilderProject) {
  const urls = project.pages.filter(page => !page.seo?.noIndex).map(page => `  <url><loc>${escapeHtml(absolutePageUrl(project,page.path))}</loc>${page.seo?.dateModified ? `<lastmod>${escapeHtml(page.seo.dateModified)}</lastmod>` : ""}</url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}


function exportedCss() { return `*{box-sizing:border-box}html,body,#root{margin:0;min-height:100%}body{background:var(--nw-background,#fff);color:var(--nw-text,#111827)}.nw-site{min-height:100vh;background:var(--nw-background,#fff);color:var(--nw-text,#111827);font-family:var(--nw-font-body,Inter,ui-sans-serif,system-ui,sans-serif)}.nw-site h1,.nw-site h2,.nw-site h3,.nw-site h4,.nw-site h5,.nw-site h6{font-family:var(--nw-font-heading,Inter,ui-sans-serif,system-ui,sans-serif)}img,video{max-width:100%;display:block}a{text-decoration:none;color:inherit}button,input,textarea,select{font:inherit}.nw-button{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .25s ease,box-shadow .25s ease,filter .25s ease}.nw-node{transition-property:transform,box-shadow,filter,opacity}.motion-scroll.motion-pending[class*=\"anim-\"]:not(.anim-none){opacity:0!important;animation:none!important}.motion-always.anim-fade-up,.motion-always.anim-fade-down,.motion-always.anim-fade-in,.motion-always.anim-slide-left,.motion-always.anim-slide-right,.motion-always.anim-slide-up,.motion-always.anim-slide-down,.motion-always.anim-zoom-in,.motion-always.anim-zoom-out,.motion-always.anim-rotate-in,.motion-always.anim-blur-in{animation-iteration-count:infinite;animation-direction:alternate}.motion-disabled{animation:none!important;translate:none!important}.has-parallax{translate:0 var(--nw-parallax-y,0px);will-change:translate}.hover-rotate:hover{transform:rotate(1.5deg) scale(1.01)}.hover-press:active{transform:translateY(1px) scale(.985)}.hover-brightness:hover{filter:brightness(1.08)}.hover-lift:hover{transform:translateY(-4px)}.hover-scale:hover{transform:scale(1.025)}.hover-glow:hover{box-shadow:0 16px 48px rgba(124,58,237,.22)!important}.hover-tilt:hover{transform:rotate(-1deg) scale(1.01)}.anim-fade-up{animation-name:nwFadeUp;animation-fill-mode:both}.anim-fade-down{animation-name:nwFadeDown;animation-fill-mode:both}.anim-fade-in{animation-name:nwFadeIn;animation-fill-mode:both}.anim-slide-left{animation-name:nwSlideLeft;animation-fill-mode:both}.anim-slide-right{animation-name:nwSlideRight;animation-fill-mode:both}.anim-slide-up{animation-name:nwSlideUp;animation-fill-mode:both}.anim-slide-down{animation-name:nwSlideDown;animation-fill-mode:both}.anim-zoom-in{animation-name:nwZoomIn;animation-fill-mode:both}.anim-zoom-out{animation-name:nwZoomOut;animation-fill-mode:both}.anim-rotate-in{animation-name:nwRotateIn;animation-fill-mode:both}.anim-blur-in{animation-name:nwBlurIn;animation-fill-mode:both}.anim-float{animation:nwFloat 4s ease-in-out infinite}.anim-pulse{animation:nwPulse 2.4s ease-in-out infinite}.anim-bounce-soft{animation:nwBounce 2.2s ease-in-out infinite}@keyframes nwFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}@keyframes nwFadeDown{from{opacity:0;transform:translateY(-24px)}to{opacity:1;transform:none}}@keyframes nwFadeIn{from{opacity:0}to{opacity:1}}@keyframes nwSlideLeft{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:none}}@keyframes nwSlideRight{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:none}}@keyframes nwSlideUp{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:none}}@keyframes nwSlideDown{from{opacity:0;transform:translateY(-34px)}to{opacity:1;transform:none}}@keyframes nwZoomIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}@keyframes nwZoomOut{from{opacity:0;transform:scale(1.06)}to{opacity:1;transform:scale(1)}}@keyframes nwRotateIn{from{opacity:0;transform:rotate(-4deg) scale(.96)}to{opacity:1;transform:none}}@keyframes nwBlurIn{from{opacity:0;filter:blur(14px);transform:translateY(8px)}to{opacity:1;filter:blur(0);transform:none}}@keyframes nwFloat{50%{transform:translateY(-8px)}}@keyframes nwPulse{50%{opacity:.68;transform:scale(.985)}}@keyframes nwBounce{50%{transform:translateY(-5px)}}.nw-link{cursor:pointer;text-decoration:underline;text-underline-offset:3px}.nw-badge{display:inline-flex;align-items:center}.nw-check-control,.nw-switch-row,.nw-range,.nw-file-input{display:flex;align-items:center;gap:9px}.nw-radio-group{padding:0;border:0}.nw-radio-group legend{font-weight:650;margin-bottom:8px}.nw-radio-group label{display:flex;align-items:center;gap:8px;margin:6px 0}.nw-switch{width:42px;height:24px;border:0;border-radius:999px;background:#cbd5e1;padding:3px;display:flex;transition:.2s}.nw-switch span{width:18px;height:18px;border-radius:50%;background:white;box-shadow:0 1px 4px #0003;transition:.2s}.nw-switch.on{background:#7c3aed}.nw-switch.on span{transform:translateX(18px)}.nw-range input{flex:1}.nw-list{list-style-position:outside}.nw-embed iframe,.nw-html-block iframe{display:block}.nw-html-block{position:relative;background:transparent}.nw-table-wrap{overflow:auto}.nw-table-wrap table{width:100%;border-collapse:collapse}.nw-table-wrap caption{text-align:left;font-weight:700;padding:0 0 10px}.nw-table-wrap th,.nw-table-wrap td{padding:12px 14px;border-bottom:1px solid #e5e7eb;text-align:left}.nw-table-wrap th{font-size:.82em;text-transform:uppercase;letter-spacing:.05em;color:#64748b}.nw-table-wrap.striped tbody tr:nth-child(even){background:color-mix(in srgb,var(--nw-surface,#f8fafc) 88%,var(--nw-primary,#7c3aed) 12%)}.nw-table-wrap.compact th,.nw-table-wrap.compact td{padding:7px 10px}.nw-tabs{overflow:hidden}.nw-tab-list{display:flex;gap:6px;border-bottom:1px solid #e5e7eb;padding:4px}.nw-tab-list button{border:0;background:transparent;padding:9px 13px;border-radius:8px;cursor:pointer}.nw-tab-list button.active{background:#111827;color:white}.nw-tab-panel{padding:18px}.nw-accordion-item+.nw-accordion-item{border-top:1px solid #e5e7eb}.nw-accordion-item>button{width:100%;border:0;background:transparent;padding:15px 17px;display:flex;justify-content:space-between;align-items:center;text-align:left;cursor:pointer;color:inherit}.nw-accordion-panel{padding:0 17px 17px;color:#64748b}.nw-modal-trigger{border:0;background:#111827;color:white;padding:11px 18px;border-radius:10px;cursor:pointer}.nw-modal-backdrop{position:fixed;inset:0;z-index:9999;background:#020617aa;display:grid;place-items:center;padding:24px}.nw-modal-dialog{position:relative;width:min(560px,94vw);max-height:86vh;overflow:auto;background:white;color:#111827;border-radius:18px;padding:28px;box-shadow:0 30px 100px #0008}.nw-modal-close{position:absolute;right:12px;top:12px;width:32px;height:32px;border:0;border-radius:50%;cursor:pointer}.nw-carousel{position:relative}.nw-carousel-image{width:100%;height:100%;object-fit:cover}.nw-carousel-caption{position:absolute;left:18px;bottom:18px;background:#020617b8;color:white;padding:7px 11px;border-radius:8px}.nw-carousel-prev,.nw-carousel-next{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;border:0;border-radius:50%;background:#fffde8;cursor:pointer;font-size:24px}.nw-carousel-prev{left:12px}.nw-carousel-next{right:12px}.nw-carousel-dots{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;gap:5px}.nw-carousel-dots i{width:6px;height:6px;border-radius:50%;background:#ffffff77}.nw-carousel-dots i.active{background:white}.nw-socials{display:flex;gap:10px;flex-wrap:wrap}.nw-socials a{padding:8px 12px;border:1px solid #e5e7eb;border-radius:999px}.nw-symbol{position:relative}.nw-avatar{display:grid;place-items:center}.nw-avatar img{width:100%;height:100%;object-fit:cover}.nw-code{white-space:pre-wrap;font-family:Consolas,"Liberation Mono",monospace}.nw-alert-info{background:#eff6ff!important;color:#1e3a8a!important;border-color:#bfdbfe!important}.nw-alert-success{background:#ecfdf5!important;color:#065f46!important;border-color:#a7f3d0!important}.nw-alert-warning{background:#fffbeb!important;color:#92400e!important;border-color:#fde68a!important}.nw-alert-danger{background:#fef2f2!important;color:#991b1b!important;border-color:#fecaca!important}.nw-progress{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px}.nw-progress progress{width:100%;accent-color:#7c3aed}.nw-rating{letter-spacing:2px}.nw-breadcrumb{align-items:center;flex-wrap:wrap}.nw-breadcrumb span{display:inline-flex;align-items:center;gap:8px}.nw-breadcrumb i{font-style:normal;opacity:.45}.nw-html>*:first-child{margin-top:0}.nw-html>*:last-child{margin-bottom:0}.nw-nav-links{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.nw-nav-links a{text-decoration:none;color:inherit}.nw-nav-links a:hover{text-decoration:underline;text-underline-offset:4px}.nw-honeypot{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}.nw-form-status{margin-top:10px;padding:10px 12px;border-radius:9px;background:#eff6ff}.nw-form-status.success{background:#ecfdf5;color:#15803d}.nw-form-status.error{background:#fef2f2;color:#b91c1c}@media(max-width:1023px){.nw-node{max-width:100%}.nw-tab-list{overflow-x:auto}.nw-table-wrap{overflow-x:auto}}@media(max-width:639px){.nw-nav-links{gap:10px;font-size:14px}.nw-progress{grid-template-columns:1fr}.nw-modal-backdrop{padding:12px}.nw-modal-dialog{width:100%!important;padding:20px}.nw-carousel-caption{left:10px;right:10px;bottom:10px}.nw-socials{gap:7px}.nw-breadcrumb{font-size:13px}.nw-tab-list button{white-space:nowrap}}[data-nw-motion="reduce"] .nw-node{animation:none!important;transition-duration:.01ms!important;translate:none!important}@media(prefers-reduced-motion:reduce){[data-nw-motion="respect"] .nw-node{animation:none!important;transition-duration:.01ms!important;translate:none!important}}`; }
