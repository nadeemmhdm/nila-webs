import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const types = read("src/types.ts");
const renderer = read("src/components/NodeRenderer.tsx");
const properties = read("src/components/PropertiesPanel.tsx");
const elements = read("src/templates/phase3-elements.ts");
const exporter = read("src/lib/exporter.ts");
const store = read("src/store/builder.ts");
const shortcuts = read("src/hooks/useEditorShortcuts.ts");

const checks = [
  ["advanced node types", types.includes('"html"') && types.includes("carouselAutoplay") && types.includes("symbolSyncKey")],
  ["safe html renderer", renderer.includes('case "html"') && renderer.includes('sandbox=""')],
  ["advanced form validation", renderer.includes("minLength={node.minLength}") && properties.includes("Form & validation")],
  ["accessibility controls", properties.includes("Accessibility") && renderer.includes('"aria-label": node.ariaLabel')],
  ["synced symbols", store.includes("syncSymbolInstances") && properties.includes("Sync instances")],
  ["carousel behavior", renderer.includes("carouselAutoplay") && properties.includes("Carousel behavior")],
  ["export parity", exporter.includes("case 'html'") && exporter.includes("node.carouselAutoplay") && exporter.includes("node.inputType")],
  ["keyboard shortcuts", shortcuts.includes('key === "x"') && shortcuts.includes('key === "d"')],
  ["element registry", elements.includes('"Safe HTML"') && elements.includes("symbolSyncKey")]
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
