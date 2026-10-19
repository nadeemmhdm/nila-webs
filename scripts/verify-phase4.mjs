import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const catalog=read('src/templates/prompt-catalog.ts');
const catalogCount=(catalog.match(/"sourceLine":/g)||[]).length;
const renderer=read('src/components/NodeRenderer.tsx');
const exporter=read('src/lib/exporter.ts');
const adapter=read('src/lib/prompt-adapter.ts');
const checks=[
 ['version 0.7+',/\"version\": \"0\.(?:[7-9]|[1-9]\d)\./.test(read('package.json'))],
 ['schema v6+',/schemaVersion:\s*(?:[6-9]|[1-9]\d)/.test(read('src/types.ts'))],
 ['theme schema',read('src/types.ts').includes('interface ProjectTheme')],
 ['prompt adapter',adapter.includes('promptToNode')&&adapter.includes('analyzePromptSource')],
 ['dependency detection',adapter.includes('function dependencies')&&adapter.includes('analysis.dependencies')],
 ['theme detection',adapter.includes('themeFromPromptSource')&&adapter.includes('artifactType')],
 ['safe no eval',!adapter.includes('eval(')],
 ['78 supplied variants',catalogCount===78],
 ['themes activity',read('src/components/LeftSidebar.tsx').includes('ThemePanel')],
 ['import activity',read('src/components/LeftSidebar.tsx').includes('PromptImportPanel')],
 ['catalog library',read('src/components/LibraryPanel.tsx').includes('suppliedPromptCatalog')],
 ['multi page templates',read('src/templates/site-templates.ts').includes('siteTemplateRegistry')],
 ['project imported blocks',read('src/types.ts').includes('importedBlocks: ImportedBlock[]')],
 ['theme canvas vars',read('src/components/Canvas.tsx').includes('themeVars(project.theme)')],
 ['theme export vars',exporter.includes('function themeVars(t:any)')],
 ['dependency manifest',exporter.includes('buildExportManifest')&&exporter.includes('nila.dependencies.json')],
 ['phase 3 shortcuts preserved',read('src/App.tsx').includes('useEditorShortcuts')&&fs.existsSync('src/hooks/useEditorShortcuts.ts')],
 ['sandboxed html editor',renderer.includes('sandbox=""')&&!renderer.includes('dangerouslySetInnerHTML')],
 ['sandboxed html export',exporter.includes("sandbox=''" )&&!exporter.includes('dangerouslySetInnerHTML')],
 ['legacy carousel compatibility',renderer.includes('node.carouselAutoplay')&&exporter.includes('node.carouselAutoplay')],
 ['legacy modal compatibility',renderer.includes('node.modalCloseOnBackdrop')&&exporter.includes('node.modalCloseOnBackdrop')],
 ['phase 4 roadmap complete',read('docs/ROADMAP.md').includes('Phase 4 — Block and template engine ✅')]
];
for(const [name,ok] of checks) console.log(`${ok?'✓':'✗'} ${name}`);
const bad=checks.filter(([,ok])=>!ok);if(bad.length){console.error('Phase 4 verification failed:',bad.map(([n])=>n).join(', '));process.exit(1)}
console.log(`Phase 4 verification passed (${checks.length} checks, ${catalogCount} supplied variants).`);
