import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
const types=read('src/types.ts');
const motion=read('src/lib/motion.ts');
const renderer=read('src/components/NodeRenderer.tsx');
const props=read('src/components/PropertiesPanel.tsx');
const panel=read('src/components/MotionStudioPanel.tsx');
const sidebar=read('src/components/LeftSidebar.tsx');
const exporter=read('src/lib/exporter.ts');
const css=read('src/styles.css');
const storage=read('src/lib/project-storage.ts');
const roadmap=read('docs/ROADMAP.md');
const checks=[
 ['version 0.9.0',pkg.version==='0.9.0'],
 ['schema v8',types.includes('schemaVersion: 8')&&storage.includes('schemaVersion: 8')],
 ['motion system schema',types.includes('interface MotionSystem')&&types.includes('motionSystem: MotionSystem')],
 ['scroll reveal observer',renderer.includes('IntersectionObserver')&&renderer.includes('motion-pending')],
 ['repeat reveal',renderer.includes('node.motionRepeat')],
 ['parallax runtime',renderer.includes('parallaxY')&&renderer.includes('--nw-parallax-y')],
 ['sticky motion',renderer.includes('node.sticky')&&renderer.includes('stickyTop')],
 ['timeline stagger',renderer.includes('timelineStagger')&&renderer.includes('timelineOrder')],
 ['state transitions',renderer.includes('transitionDuration')&&props.includes('State transition')],
 ['expanded entrance presets',types.includes('"blur-in"')&&css.includes('@keyframes nwBlurIn')],
 ['expanded hover presets',types.includes('"brightness"')&&css.includes('.hover-brightness:hover')],
 ['motion studio panel',sidebar.includes('MotionStudioPanel')&&panel.includes('Motion Studio')],
 ['motion audit',motion.includes('auditMotionProject')&&panel.includes('motion ready')],
 ['reduced motion',css.includes('prefers-reduced-motion')&&renderer.includes('reducedMotion')],
 ['export motion parity',exporter.includes('IntersectionObserver')&&exporter.includes('timelineStagger')&&exporter.includes('--nw-parallax-y')],
 ['motion normalization',motion.includes('normalizeMotionProject')&&storage.includes('normalizeMotionProject')],
 ['phase 6 roadmap complete',roadmap.includes('## Phase 6 — Motion and interaction studio ✅')]
];
let failed=0;for(const [n,ok] of checks){console.log(`${ok?'✓':'✗'} ${n}`);if(!ok)failed++;}if(failed){console.error(`Phase 6 verification failed: ${failed}`);process.exit(1)}console.log(`Phase 6 verification passed (${checks.length}/${checks.length}).`);
