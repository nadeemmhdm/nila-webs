import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
const types=read('src/types.ts'),storage=read('src/lib/project-storage.ts'),store=read('src/store/builder.ts'),panel=read('src/components/SitePanel.tsx'),sidebar=read('src/components/LeftSidebar.tsx'),props=read('src/components/PropertiesPanel.tsx'),renderer=read('src/components/NodeRenderer.tsx'),site=read('src/lib/site-settings.ts'),exporter=read('src/lib/exporter.ts'),roadmap=read('docs/ROADMAP.md'),css=read('src/styles.css');
const codegen=read('src/lib/react-source-codegen.ts'),exportSource=exporter+codegen;
const checks=[
 ['version 1.0+',Number(pkg.version.split('.')[0])>=1],
 ['schema v9+',/schemaVersion: (9|[1-9][0-9]+)/.test(types)&&/schemaVersion: (9|[1-9][0-9]+)/.test(storage)],
 ['seo schema',types.includes('interface SeoSettings')&&types.includes('interface PageSeo')],
 ['link kinds',types.includes('type LinkKind')&&types.includes('anchorId?: string')],
 ['form providers',types.includes('type FormProvider')&&types.includes('formSuccessMessage')],
 ['site panel',sidebar.includes('SitePanel')&&(panel.includes('Site, Nav & SEO')||panel.includes('Site Quality Center'))],
 ['global seo editing',panel.includes('Global SEO')&&store.includes('setSeo:')],
 ['page seo editing',panel.includes('Current page SEO')&&store.includes('updatePageSeo:')],
 ['navigation manager',panel.includes('Navigation manager')&&panel.includes('Navbar links')],
 ['anchor collection',site.includes('collectPageAnchors')&&props.includes('Anchor ID')],
 ['typed link editor',props.includes('Link type')&&props.includes('LinkTargetEditor')],
 ['preview internal navigation',renderer.includes('handleBuilderLink')&&renderer.includes('setActivePage')],
 ['navbar semantic renderer',renderer.includes('case "navbar"')&&renderer.includes('nw-nav-links')],
 ['form submit runtime',renderer.includes('submitForm')&&renderer.includes('nw-form-status')],
 ['form honeypot',renderer.includes('formHoneypot')&&css.includes('.nw-honeypot')],
 ['site audit',site.includes('auditSite')&&(panel.includes('Accessibility & SEO audit')||panel.includes('legacyAudit'))],
 ['open graph export',exporter.includes('og:title')&&exporter.includes('og:description')],
 ['favicon canonical export',exporter.includes('rel="canonical"')&&exporter.includes('rel="icon"')],
 ['sitemap robots export',exporter.includes('sitemap.xml')&&exporter.includes('robots.txt')],
 ['runtime metadata',exportSource.includes('setMeta')&&exportSource.includes('document.title')],
 ['export link anchor parity',exportSource.includes("href.startsWith('#')")&&exportSource.includes('node.anchorId')],
 ['export form parity',exportSource.includes('submitForm')&&exportSource.includes('formSuccessMessage')],
 ['phase 7 roadmap complete',roadmap.includes('## Phase 7 — Navigation, forms and SEO ✅')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'✓':'✗'} ${name}`);if(!ok)failed++;}if(failed){console.error(`Phase 7 verification failed: ${failed}`);process.exit(1)}console.log(`Phase 7 verification passed (${checks.length}/${checks.length}).`);
