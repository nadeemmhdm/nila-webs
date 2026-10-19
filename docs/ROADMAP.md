# Nila Webs — 10 Phase Roadmap

## Phase 1 — Core visual builder ✅
Desktop shell, React/Vite editor, multi-page model, global navbar/footer, base properties, initial sections, editable project file and React/Vite export.

## Phase 2 — Professional workspace & editor UX 🟣 in progress
Splash/boot experience, projects dashboard, recent/all projects, blank/template project creation, MIT App Inventor-style activity bar, collapsible panels, Layers tree, Assets library, image/video upload or URL sources, live interactions, full preview, responsive properties, visibility per breakpoint, undo/redo, copy/duplicate, nested drag-and-drop and improved editor UI. Uploaded project media exports to `public/assets/`.

## Phase 3 — Complete element system ✅
Completed in v0.5.0. Includes advanced form controls and validation semantics, badges/lists/navigation/media/data elements, embeds/maps, table editor, tabs, accordion, modal, autoplay carousel, social links, custom HTML/code, alert/avatar/progress/breadcrumb/rating, accessibility properties, and project-level reusable linked components with save/insert/sync/detach/delete workflows. Export parity and a Phase 3 CI regression verifier are included.

## Phase 4 — Block and template engine ✅
Completed in v0.7.0. The safe family-aware prompt/code compiler converts supplied Shadcn/React/TSX/CSS inputs into editable sections, components or themes without executing arbitrary code. All 78 supplied variants are indexed in the searchable registry with visual thumbnails, source/group filters and favorites. Phase 4 also includes saved/re-convertible imports with revisions, saved themes, five multi-page site templates, reusable component integration, dependency-aware pruned React/Vite export and `nila.dependencies.json` provenance manifests.

## Phase 5 — Responsive design system ✅
Completed in v0.8.0. Desktop is the default/base preview, with configurable Tablet and Mobile preview widths plus runtime mobile/tablet breakpoints. Every existing, imported, reusable-component and template node passes through the shared responsive engine; Tablet inherits Desktop and Mobile inherits Desktop + Tablet before applying local overrides. Phase 5 adds automatic responsive defaults, overflow-safe component CSS, responsive health auditing/auto-fix, breakpoint/page-padding controls, spacing and typography scales, reusable CSS variable tokens, custom body/heading font stacks, responsive theme parity, per-breakpoint visibility/override reset, reduced-motion preference support and responsive React/Vite export parity.

## Phase 6 — Motion and interaction studio ✅
Completed in v0.9.0. Adds a project Motion Studio, IntersectionObserver scroll reveal with repeat/threshold controls, expanded entrance/hover presets, child timeline sequencing and reverse order, clamped parallax, sticky nodes, configurable easing/state transitions, project motion defaults/auditing, and reduced-motion modes. Editor Live/Preview and exported React/Vite sites use the same motion model.

## Phase 7 — Navigation, forms and SEO
Visual link manager, anchors, menus, form integrations, validation, metadata, Open Graph, favicon, sitemap, robots and accessibility checks.

## Phase 8 — Native project folders & recovery
Native Windows file dialogs, optional project folders, font assets, backup/recovery, autosave versions and strict project-folder access boundaries. Phase 2 already provides the browser/WebView IndexedDB media library and `public/assets/` export pipeline.

## Phase 9 — Production export pipeline
Dependency resolver, shadcn-compatible generated structure, Tailwind 4 export option, build validation, deployment presets and export diagnostics.

## Phase 10 — Windows release and hardening
Installer, code signing preparation, updater strategy, performance profiling, crash recovery, security review, final QA and public release automation.
