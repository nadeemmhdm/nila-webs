import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
const types=read('src/types.ts'), storage=read('src/lib/project-storage.ts'), panel=read('src/components/SitePanel.tsx'), discover=read('src/lib/discoverability.ts'), exporter=read('src/lib/exporter.ts'), roadmap=read('docs/ROADMAP.md'), styles=read('src/styles.css');
const checks=[
 ['version >= 1.1.0',Number(pkg.version.split('.')[0])>1 || (Number(pkg.version.split('.')[0])===1 && Number(pkg.version.split('.')[1])>=1)],
 ['schema v10',types.includes('schemaVersion: 10')&&storage.includes('schemaVersion: 10')],
 ['quality audit schema',types.includes('QualityAuditResult')&&types.includes('SecuritySettings')],
 ['SEO AEO GEO score UI',panel.includes('SEO · AEO · GEO')&&panel.includes('AEO')&&panel.includes('GEO')],
 ['90+ guidance',panel.includes('90+ score guidance')&&discover.includes('highScoreGuidance')],
 ['answer summary entity metadata',types.includes('answerSummary')&&types.includes('entityName')&&types.includes('citations')],
 ['JSON-LD',discover.includes('buildPageJsonLd')&&exporter.includes('application/ld+json')],
 ['organization schema',discover.includes('buildOrganizationJsonLd')&&types.includes('organizationName')],
 ['robots manager',panel.includes('robots.txt manager')&&discover.includes('buildRobotsText')&&exporter.includes('public/robots.txt')],
 ['llms manager',panel.includes('llms.txt manager')&&discover.includes('buildLlmsText')&&exporter.includes('public/llms.txt')],
 ['llms describedby',exporter.includes('rel="describedby"')],
 ['sitemap lastmod',exporter.includes('<lastmod>')],
 ['security headers',discover.includes('buildSecurityHeaders')&&panel.includes('Content-Security-Policy')&&exporter.includes('public/_headers')],
 ['vercel security config',discover.includes('buildVercelSecurityConfig')&&exporter.includes('vercel.json')],
 ['security.txt',discover.includes('buildSecurityTxt')&&exporter.includes('public/.well-known/security.txt')],
 ['security test',panel.includes('Security test')&&discover.includes('mixed-content')&&discover.includes('custom-html')],
 ['clean BrowserRouter export',exporter.includes('BrowserRouter')&&!exporter.includes('HashRouter')],
 ['static host redirects',exporter.includes('public/_redirects')],
 ['quality center css',styles.includes('quality-score-grid')&&styles.includes('quality-tabs')],
 ['phase 8 milestone roadmap',roadmap.includes('## Phase 8 — Discoverability & security center 🟣 in progress')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'✓':'✗'} ${name}`);if(!ok)failed++;}if(failed){console.error(`Phase 8 verification failed: ${failed}`);process.exit(1)}console.log(`Phase 8 verification passed (${checks.length}/${checks.length}).`);
