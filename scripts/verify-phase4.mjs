import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const catalog=read('src/templates/prompt-catalog.ts');
const catalogCount=(catalog.match(/"sourceLine":/g)||[]).length;
const checks=[
 ['version 0.6.0',read('package.json').includes('"version": "0.6.0"')],
 ['schema v5',read('src/types.ts').includes('schemaVersion: 5')],
 ['theme schema',read('src/types.ts').includes('interface ProjectTheme')],
 ['prompt adapter',read('src/lib/prompt-adapter.ts').includes('promptToNode')],
 ['safe no eval',!read('src/lib/prompt-adapter.ts').includes('eval(')],
 ['78 supplied variants',catalogCount===78],
 ['themes activity',read('src/components/LeftSidebar.tsx').includes('ThemePanel')],
 ['import activity',read('src/components/LeftSidebar.tsx').includes('PromptImportPanel')],
 ['catalog library',read('src/components/LibraryPanel.tsx').includes('suppliedPromptCatalog')],
 ['project imported blocks',read('src/types.ts').includes('importedBlocks: ImportedBlock[]')],
 ['theme canvas vars',read('src/components/Canvas.tsx').includes('themeVars(project.theme)')],
 ['theme export vars',read('src/lib/exporter.ts').includes("function themeVars(t:any)")],
 ['phase 4 roadmap',read('docs/ROADMAP.md').includes('Phase 4 — Block and template engine 🟣 in progress')]
];
for(const [name,ok] of checks) console.log(`${ok?'✓':'✗'} ${name}`);
const bad=checks.filter(([,ok])=>!ok);if(bad.length){console.error('Phase 4 verification failed:',bad.map(([n])=>n).join(', '));process.exit(1)}
console.log(`Phase 4 verification passed (${checks.length} checks, ${catalogCount} supplied variants).`);
