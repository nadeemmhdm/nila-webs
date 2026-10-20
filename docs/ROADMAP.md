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

## Phase 7 — Navigation, forms and SEO ✅
Completed in v1.0.0. Adds the Site / Nav / SEO workspace, typed page/anchor/external/email/phone link targets, project navbar link management, element anchors, endpoint-based form integrations with validation/status/honeypot support, global and per-page SEO metadata, Open Graph, favicon/canonical controls, sitemap.xml and robots.txt generation, runtime page metadata updates, and a combined SEO/accessibility audit. Editor preview and standalone React/Vite export share navigation, anchors, forms and metadata behavior.

## Phase 8 — Discoverability, security & recovery center ✅
Completed in v1.3.0. Includes the unified SEO/AEO/GEO/security quality center, 90+ score guidance, robots.txt and optional llms.txt managers, JSON-LD, sitemap freshness, security headers, RFC 9116 security.txt, clean BrowserRouter hosting presets, real React/Vite source generation, ZIP/GitHub publishing, and device-local project recovery. Nila Webs now keeps bounded pre-overwrite snapshots, supports manual recovery points, restore/delete/clear workflows, and portable `.nila.json` project backups.

## Phase 9 — Production export pipeline ✅
Completed in v1.4.0. Production exports now enforce a three-layer Nila Webs provenance policy: a responsive visible watermark, generated-source watermark headers, and generator/build metadata. ZIP and direct GitHub publishing use the same preflighted file map. Exports include SHA-256 tamper-evident provenance, dependency pruning, Standard CSS or Tailwind CSS 4 via the official Vite plugin, Cloudflare/Netlify/Vercel deployment presets, and production export diagnostics before packaging or publishing.

## Phase 10 — Windows release and hardening ✅
Completed and hardened in v1.6.0. Nila Webs ships through a Windows-native Tauri 2 release pipeline with both NSIS `.exe` and WiX `.msi` installers, downgrade protection, WebView2 bootstrap handling, SHA-256 installer checksums, Windows build verification, downloadable CI artifacts, and direct GitHub Release asset attachment. The release configuration keeps the least-privilege desktop capability and hardened CSP from earlier phases, synchronizes app versions across Node/Tauri/Rust manifests, and permanently verifies release readiness in CI.
