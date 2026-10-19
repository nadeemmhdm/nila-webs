import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
const types=read('src/types.ts'), storage=read('src/lib/project-storage.ts'), panel=read('src/components/SitePanel.tsx'), discover=read('src/lib/discoverability.ts'), exporter=read('src/lib/exporter.ts'), roadmap=read('docs/ROADMAP.md'), styles=read('src/styles.css'), projects=read('src/components/ProjectsHome.tsx'), recovery=read('src/components/RecoveryDialog.tsx');
const checks=[
 ['version >= 1.3.0',Number(pkg.version.split('.')[0])>1 || (Number(pkg.version.split('.')[0])===1 && Number(pkg.version.split('.')[1])>=3)],
 ['schema v10+',types.includes('schemaVersion: 10')&&storage.includes('schemaVersion: 10')],
 ['quality audit schema',types.includes('QualityAuditResult')&&types.includes('SecuritySettings')],
 ['SEO AEO GEO score UI',panel.includes('SEO · AEO · GEO')&&panel.includes('AEO')&&panel.includes('GEO')],
 ['90+ guidance',panel.includes('90+ score guidance')&&discover.includes('highScoreGuidance')],
 ['JSON-LD and content files',discover.includes('buildPageJsonLd')&&exporter.includes('application/ld+json')&&exporter.includes('public/robots.txt')&&exporter.includes('public/llms.txt')],
 ['security export',discover.includes('buildSecurityHeaders')&&exporter.includes('public/_headers')&&exporter.includes('public/.well-known/security.txt')],
 ['clean React routing',exporter.includes('BrowserRouter')&&!exporter.includes('HashRouter')&&exporter.includes('public/_redirects')],
 ['automatic recovery snapshots',storage.includes('createRecoverySnapshot(previous, "pre-overwrite")')&&storage.includes('RECOVERY_LIMIT = 12')],
 ['restore recovery',storage.includes('restoreRecoverySnapshot')&&recovery.includes('Restore')],
 ['manual snapshot',recovery.includes('Create snapshot')&&storage.includes('reason: ProjectRecoverySnapshot["reason"]')],
 ['portable project backup',storage.includes('nila-webs-project-backup')&&recovery.includes('.nila.json')],
 ['recovery dashboard entry',projects.includes('RecoveryDialog')&&projects.includes('Recovery & backups')],
 ['recovery cleanup',storage.includes('clearProjectRecovery')&&storage.includes('localStorage.removeItem(recoveryKeyFor(id))')],
 ['phase 8 roadmap complete',roadmap.includes('## Phase 8 — Discoverability, security & recovery center ✅')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'✓':'✗'} ${name}`);if(!ok)failed++;}if(failed){console.error(`Phase 8 verification failed: ${failed}`);process.exit(1)}console.log(`Phase 8 verification passed (${checks.length}/${checks.length}).`);
