import fs from "node:fs";
const read=p=>fs.readFileSync(p,"utf8");
const pkg=read("package.json"),types=read("src/types.ts"),design=read("src/lib/design-system.ts"),store=read("src/store/builder.ts"),canvas=read("src/components/Canvas.tsx"),topbar=read("src/components/Topbar.tsx"),props=read("src/components/PropertiesPanel.tsx"),theme=read("src/components/ThemePanel.tsx"),renderer=read("src/components/NodeRenderer.tsx"),exporter=read("src/lib/exporter.ts"),storage=read("src/lib/project-storage.ts"),roadmap=read("docs/ROADMAP.md"),styles=read("src/styles.css")+read("src/phase4.css");
const codegen=read("src/lib/react-source-codegen.ts"),exportSource=exporter+codegen;
const checks=[
 ["version 0.8+",/"version": "(?:0\.[89]\.0|1\.)/.test(pkg)],
 ["schema v7+",/schemaVersion: (?:[7-9]|[1-9][0-9]+);/.test(types)&&types.includes('interface DesignSystem')],
 ["desktop default",store.includes('viewport: "desktop"')&&store.includes('viewport: "desktop", past: []')],
 ["three previews",topbar.includes('>Desktop</span>')&&topbar.includes('>Tablet</span>')&&topbar.includes('>Mobile</span>')],
 ["configurable preview widths",canvas.includes('previewWidth(project.designSystem,viewport)')&&topbar.includes('previewTablet')&&topbar.includes('previewMobile')],
 ["cascade responsive styles",design.includes('...(node.responsive?.tablet || {})')&&design.includes('...(node.responsive?.mobile || {})')],
 ["automatic responsive nodes",design.includes('ensureResponsiveNode')&&design.includes('gridColumns')&&design.includes('flexDirection')],
 ["project migration responsive",storage.includes('defaultDesignSystem')&&storage.includes('ensureResponsiveProject(project)')],
 ["new blocks responsive",store.includes('ensureResponsiveNode(node, s.project.designSystem)')],
 ["responsive reset",props.includes('Reset {viewport} overrides')&&props.includes('clearResponsiveOverrides')],
 ["responsive health",theme.includes('Responsive health')&&theme.includes('Auto-fix all')&&theme.includes('auditResponsiveProject')],
 ["spacing tokens",types.includes('spacing: { xs:string')&&theme.includes('Spacing scale')],
 ["typography tokens",types.includes('typography: { xs:string')&&theme.includes('Typography scale')],
 ["all renderer nodes share resolver",renderer.includes('const style = toCss(resolveStyle(node, viewport));')],
 ["themes share responsive vars",canvas.includes('designSystemVars(project.designSystem,viewport)')],
 ["export dynamic breakpoints",exportSource.includes('d.mobileMax??639')&&exportSource.includes('d.tabletMax??1023')],
 ["export cascade parity",exportSource.includes("node.responsive?.tablet||{}),...(node.responsive?.mobile||{})")],
 ["export design tokens",exportSource.includes('function designVars')&&exportSource.includes("'--nw-space-md'" )],
 ["mobile component hardening",exporter.includes('@media(max-width:639px)')&&exporter.includes('.nw-tab-list button{white-space:nowrap}')&&styles.includes('@container (max-width:640px)')],
 ["preview width preserved",!styles.includes('.workspace.full-preview .canvas-frame{width:100%!important')],
 ["phase 5 roadmap complete",roadmap.includes('## Phase 5 — Responsive design system ✅')]
];
let failed=0;for(const [name,ok] of checks){console.log(`${ok?'✓':'✗'} ${name}`);if(!ok)failed++;}if(failed){console.error(`Phase 5 verification failed: ${failed} check(s).`);process.exit(1)}console.log(`Phase 5 verification passed (${checks.length}/${checks.length}).`);
