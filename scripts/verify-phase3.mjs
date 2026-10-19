import fs from 'node:fs';

const read = path => fs.readFileSync(path, 'utf8');
const checks = [
  ['package version', /\"version\"\s*:\s*\"(?:0\.(?:[5-9]|[1-9][0-9])\.|[1-9][0-9]*\.)/.test(read('package.json'))],
  ['schema v4+', /schemaVersion:\s*[4-9]/.test(read('src/types.ts'))],
  ['component registry', read('src/types.ts').includes('components: SavedComponent[]')],
  ['component save', read('src/store/builder.ts').includes('saveNodeAsComponent')],
  ['component sync', read('src/store/builder.ts').includes('syncComponentFromNode')],
  ['dynamic component library', read('src/components/LibraryPanel.tsx').includes('project.components.map')],
  ['custom html renderer', read('src/components/NodeRenderer.tsx').includes('case "html"')],
  ['advanced form semantics', read('src/components/PropertiesPanel.tsx').includes('Validation pattern')],
  ['accessibility controls', read('src/components/PropertiesPanel.tsx').includes('ARIA label')],
  ['carousel autoplay', read('src/components/NodeRenderer.tsx').includes('node.autoplay')],
  ['export asset rewrite', read('src/lib/exporter.ts').includes('target.components')],
  ['export custom html', read('src/lib/exporter.ts').includes("case 'html'")],
  ['phase 3 complete roadmap', read('docs/ROADMAP.md').includes('Phase 3 — Complete element system ✅')]
];
const failed = checks.filter(([,ok]) => !ok);
for (const [name,ok] of checks) console.log(`${ok ? '✓' : '✗'} ${name}`);
if (failed.length) { console.error(`Phase 3 verification failed: ${failed.map(([name])=>name).join(', ')}`); process.exit(1); }
console.log(`Phase 3 verification passed (${checks.length} checks).`);
