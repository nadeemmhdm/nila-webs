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
Completed in v0.8.0. Desktop is the default/base preview, with configurable Tablet and Mobile preview widths plus runtime mobile/tablet breakpoints. Every existing, imported, reusable-component and template node passes through the shared responsive engine; Tablet inherits Desktop and Mobile inherits Desktop + Tablet before applying local overrides.

## Phase 6 — Motion and interaction studio ✅
Completed in v0.9.0. Adds a project Motion Studio, IntersectionObserver scroll reveal, expanded entrance/hover presets, timeline sequencing, parallax, sticky nodes, easing/state transitions, reduced-motion modes, and editor/export parity.

## Phase 7 — Navigation, forms and SEO ✅
Completed in v1.0.0. Adds navigation/link management, form integrations, global/per-page SEO, Open Graph, canonical controls, sitemap, robots, metadata and accessibility audits.

## Phase 8 — Discoverability, security & recovery center ✅
Completed in v1.3.0. Includes SEO/AEO/GEO/security quality scoring, robots.txt and optional llms.txt, JSON-LD, security headers, security.txt, clean routing, real React/Vite source export, ZIP/GitHub publishing and device-local recovery snapshots/backups.

## Phase 9 — Production export pipeline ✅
Completed in v1.4.0. Production exports enforce visible/source/metadata provenance, SHA-256 manifests, dependency pruning, Standard CSS or Tailwind CSS 4, deployment presets and export diagnostics.

## Phase 10 — Windows release and hardening ✅
Completed in v1.5.0. Adds synchronized desktop release versioning, Windows application branding, NSIS EXE and WiX MSI installers, WebView2 bootstrapper handling, downgrade protection, current-user/per-machine install choice, optimized Rust release profile, strict CSP/capability validation, device-local crash recovery retention, optional Authenticode signing preparation, SHA-256 installer checksums, Windows GitHub Actions QA, installer artifacts, and tag-driven public release automation. Automatic in-app updating remains intentionally disabled until a trusted HTTPS update endpoint and long-lived signing keys are configured; GitHub Releases is the authoritative update channel for v1.5.0.
