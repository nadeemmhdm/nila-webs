# Nila Webs

**Nila Webs** is a Windows-first drag-and-drop website builder that combines a MIT App Inventor-style visual workflow with real React + Vite output. Build multi-page websites from elements and reusable sections, preview interactions live, customize responsive styles, then export a standalone source project that can be hosted anywhere.

## Current build — v1.2.0 (Real React/Vite source export milestone)

- Tauri 2 Windows desktop shell with React 19 + Vite + TypeScript editor.
- Splash screen followed by a dedicated **Projects** dashboard.
- Project creation flow with required name, optional description, **Blank** default, and starter-template selection.
- Recent projects plus an all-projects library with search and reopen/delete actions.
- MIT App Inventor/Figma-style **Build / Pages / Layers / Assets / Themes / Import** workspace.
- Collapsible left and right sidebars.
- Desktop, tablet and mobile canvas sizes.
- Per-breakpoint style overrides and visibility controls.
- Full preview mode plus **Live** interaction mode while the editor remains open.
- Drag-and-drop and click-to-insert elements/sections.
- Nested containers, cards and forms.
- Layer tree, selection, reorder controls, duplicate, copy, delete and visibility.
- Undo/redo history.
- Multi-page routing with page paths.
- Global navbar/footer inherited by new pages, with per-page opt-out.
- Internal page links and external links.
- Entrance and hover animations.
- Editable project JSON import/export.
- Project asset library with image/video uploads and remote media links.
- Uploaded media is persisted in IndexedDB and referenced without bloating project JSON.
- Exported uploaded media is written to `public/assets/`; external URLs stay external.
- Standalone React + Vite website ZIP export.
- Initial ShadcnSpace-inspired section adapters and uploaded starter-template adapters.

- Phase 3 complete element system with advanced text/actions/media/forms/data/interactive/advanced blocks.
- Linked reusable project components: save a selected block as a component, insert linked instances, sync changes across instances, detach, or delete the definition.
- Advanced form semantics: email/password/number/date/time/URL/search fields, required state, name/value, pattern, min/max length, textarea rows, file accept/multiple, and form action/method.
- Stateful Tabs, Accordion, Modal and Carousel components work in Live/Preview mode and exported React/Vite sites; Carousel supports autoplay, interval and dots.
- Custom HTML and code blocks plus Alert, Avatar, Progress, Breadcrumb and Rating elements.
- Accessibility controls for ARIA label, role, tooltip/title and tab index, with image/frame accessibility warnings.
- Complex visual editors for table caption/rows, carousel slides/assets, social/breadcrumb links and reusable components.
- Phase 3 regression verifier runs in CI before the production TypeScript/Vite build.


- Phase 6 Motion Studio with scroll reveal, parallax, sticky elements, child timeline stagger/order, transition easing, expanded entrance/hover presets and reduced-motion controls.
- Motion behavior is shared by Live/Preview and standalone React/Vite exports.

- Phase 7 Site / Nav / SEO workspace with page/anchor/external/email/phone links, navbar link manager and element anchor IDs.
- Endpoint-based form submission with browser validation, success/error states and honeypot support.
- Global + per-page SEO, Open Graph, favicon/canonical settings, sitemap.xml/robots.txt export and site accessibility/SEO audit.
- Phase 4 Prompt Adapter Engine converts pasted Shadcn/React/TSX prompts into safe editable builder nodes without executing arbitrary code.
- 78 user-supplied prompt/catalog variants are indexed in the Sections library with extracted copy, media and animation hints.
- Project theme system with preset palettes, typography, radius/shadow tokens, live CSS variables and current-page restyling.
- Prompt/code files can be loaded from `.txt`, `.md`, `.tsx`, `.ts`, `.jsx` or `.js`, added to canvas, or saved into the project block library.
- Theme tokens are preserved in standalone React/Vite exports.

- Phase 5 responsive design system: Desktop default preview plus configurable Tablet/Mobile preview widths and runtime breakpoints.
- Shared responsive cascade: Tablet inherits Desktop; Mobile inherits Desktop + Tablet, then applies Mobile overrides.
- Automatic responsive defaults cover native elements, supplied prompt blocks, reusable components, imported code blocks and multi-page templates.
- Responsive health audit with one-click Auto-fix All and overflow-risk reporting.
- Project-level spacing, typography, page-padding, container-width and breakpoint tokens exported as CSS variables.
- Per-element responsive visibility, breakpoint overrides, reset controls and spacing/type token quick-apply.
- Theme and design-system tokens remain consistent in editor, Live/Preview modes and exported React/Vite sites.
- Family-aware adapters cover the supplied pricing, portfolio, feature, about, team, testimonial, services, CTA, contact, FAQ, blog, newsletter, logo cloud, gallery, bento, auth, timeline, cookie, animation, dock, autocomplete and avatar families.
- Sections/Components/Templates registry includes visual thumbnails, source/group filters, persistent favorites and motion badges.
- Imported prompt/code blocks retain source, revision and hash metadata and can be edited, updated and re-converted safely.
- Five multi-page full-site templates can create complete projects directly from the project creation flow.
- Export is dependency-aware and prunes unused project assets/components while writing `nila.dependencies.json` provenance metadata.

## Included visual elements

Heading, text, text link, badge, ordered/unordered list, button, social links, breadcrumb, image, video, avatar, icon, carousel, embed/iFrame, map, text/email/password/number/date/time/URL/search input variants, textarea, select, checkbox, radio group, switch, range, file input, label, form, table, progress, rating, alert, tabs, accordion, modal, custom HTML, code block, linked component group, card, container, section, spacer and divider.

## Included section families

Hero, pricing, portfolio, feature, about, team, testimonial, services, CTA, contact, FAQ, blog, newsletter, logo cloud, gallery, bento, authentication, timelines, cookie consent, navbar and footer. More supplied blocks will be added through the same registry.

## Run the editor

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Run as a Windows desktop application

Install the Tauri 2 prerequisites for Windows (Rust toolchain, Microsoft C++ Build Tools, and WebView2), then run:

```bash
npm install
npm run tauri:dev
```

Production desktop build:

```bash
npm run tauri:build
```

## Exported sites

Use **Export React/Vite** inside the builder. Nila Webs writes a standalone React project containing the page tree and runtime renderer. The exported project does not depend on the Nila Webs desktop app.

```bash
npm install
npm run build
```

Deploy the generated `dist/` directory to a static host. Exported sites use hash routing to avoid requiring server rewrite rules.

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). The editor stores websites as a serializable node tree, while the renderer and exporter consume the same project schema. This keeps visual editing and generated output aligned.

## 10-phase roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md). Phases 1, 3 and 4 are complete. Phase 2 already delivered the project workspace, startup flow and production asset pipeline; later phases continue the responsive design-system, interaction, SEO, native-storage, export and Windows-release roadmap.

## Contributing and security

Read [`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md), and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) before contributing.

## Third-party material

Some starter concepts and block adapters are derived from user-supplied MIT-licensed ShadcnSpace templates. Attribution and license notes are in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## License

Nila Webs source is available under the MIT License. See [`LICENSE`](LICENSE).


## Real React + Vite Source Output

Nila Webs now exports finished websites as a real source tree rather than a data-driven `site.json` bundle. Multi-page projects generate `src/pages/`, top-level page blocks generate `src/sections/`, reusable components generate `src/components/generated/`, imported prompt/code adapters generate `src/imported/`, and theme/motion/responsive tokens generate `src/theme/`. The only HTML document is Vite's required bootstrap `index.html`; website pages themselves are React/TSX modules.

Finished projects can be downloaded as a ZIP or published directly to an existing/new GitHub repository through the GitHub button in the editor. GitHub tokens are held only in dialog memory and are not persisted.

## Phase 8 — Discoverability & Security Center
SEO/AEO/GEO scoring, editable robots.txt and llms.txt, JSON-LD entity metadata, security headers, RFC 9116 security.txt, clean URL export presets and publish-readiness audits.
