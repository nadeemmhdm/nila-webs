import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const types = read("src/types.ts");
const renderer = read("src/components/NodeRenderer.tsx");
const properties = read("src/components/PropertiesPanel.tsx");
const elements = read("src/templates/phase3-elements.ts");
const exporter = read("src/lib/exporter.ts");
const codegen = read("src/lib/react-source-codegen.ts");
const store = read("src/store/builder.ts");
const shortcuts = read("src/hooks/useEditorShortcuts.ts");

const hasLegacySymbolSync = store.includes("syncSymbolInstances") && properties.includes("Sync instances");
const hasComponentRegistrySync = store.includes("syncComponentFromNode") && store.includes("replaceComponentInstances") && properties.includes("Sync changes");
const hasCarouselControls = renderer.includes("carouselAutoplay") && renderer.includes("carouselInterval") && properties.includes("CarouselEditor");
const hasAdvancedRegistry = elements.includes('"Custom HTML"') && elements.includes('"Component Group"') && elements.includes("createPhase3Element");

const checks = [
  ["advanced node types", types.includes('"html"') && types.includes("carouselAutoplay") && types.includes("symbolSyncKey")],
  ["safe html renderer", renderer.includes('case "html"') && renderer.includes('sandbox=""')],
  ["advanced form validation", renderer.includes("minLength={node.minLength}") && properties.includes("Form & validation")],
  ["accessibility controls", properties.includes("Accessibility") && renderer.includes('"aria-label": node.ariaLabel')],
  ["synced reusable components", hasLegacySymbolSync || hasComponentRegistrySync],
  ["carousel behavior", hasCarouselControls],
  ["export parity", (exporter+codegen).includes("case 'html'") && (exporter+codegen).includes("node.carouselAutoplay") && (exporter+codegen).includes("node.inputType")],
  ["keyboard shortcuts", shortcuts.includes('key === "x"') && shortcuts.includes('key === "d"')],
  ["element registry", hasAdvancedRegistry]
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "✓" : "✗"} ${name}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`Phase 3 regression failed: ${failed} check(s).`);
  process.exit(1);
}
console.log(`Phase 3 regression passed: ${checks.length}/${checks.length}.`);
