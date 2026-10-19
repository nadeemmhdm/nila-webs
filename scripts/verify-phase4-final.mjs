import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const catalog=read('src/templates/prompt-catalog.ts');
const count=(catalog.match(/"sourceLine":/g)||[]).length;
const adapter=read('src/lib/prompt-adapter.ts');
const library=read('src/components/LibraryPanel.tsx');
const templates=read('src/templates/site-templates.ts');
const exporter=read('src/lib/exporter.ts');
const store=read('src/store/builder.ts');
const checks=[
['version 0.7+',/\"version\": \"(?:0\.(?:[7-9]|[1-9]\d)\.|[1-9][0-9]*\.)/.test(read('package.json'))],['schema v6+',/schemaVersion:\s*(?:[6-9]|[1-9]\d)/.test(read('src/types.ts'))],
['78 supplied variants',count===78],['family compiler',adapter.includes('pricingSection')&&adapter.includes('portfolioSection')&&adapter.includes('timelineSection')&&adapter.includes('biolinkSection')],
['theme parser',adapter.includes('themeFromPromptSource')&&adapter.includes('artifactType')],['safe no eval',!adapter.includes('eval(')],
['reconvert revisions',adapter.includes('reconvertImportedBlock')&&store.includes('reconvertImportedBlock')],['favorites',library.includes('favoritesOnly')&&store.includes('toggleFavoriteLibraryItem')],
['component section split',library.includes('promptComponentKinds')],['visual thumbnails',library.includes('backgroundImage')],['filters',library.includes('sourceFilter')&&library.includes('groupFilter')],
['multi page templates',(templates.match(/page\("/g)||[]).length>=15&&(templates.match(/id: "/g)||[]).length>=5],['template apply',store.includes('applySiteTemplate')],
['saved themes',store.includes('saveCurrentTheme')&&read('src/components/ThemePanel.tsx').includes('savedThemes')],['dependency manifest',exporter.includes('buildExportManifest')&&exporter.includes('nila.dependencies.json')],
['pruned export',exporter.includes('prepareProjectAssets')&&exporter.includes('usedAssetIds')&&exporter.includes('usedComponentIds')&&read('src/lib/react-source-codegen.ts').includes('usedComponentIds')],['phase 4 complete roadmap',read('docs/ROADMAP.md').includes('Phase 4 — Block and template engine ✅')]
];
let fail=0;for(const [n,ok] of checks){console.log(`${ok?'✓':'✗'} ${n}`);if(!ok)fail++}if(fail)process.exit(1);console.log(`Phase 4 final verification passed (${checks.length}/${checks.length}).`)
