# Nila Webs

**Nila Webs** is a Windows-first drag-and-drop website builder that combines a MIT App Inventor-style visual workflow with real React + Vite output. Build multi-page websites from elements and reusable sections, preview interactions live, customize responsive styles, then export a standalone source project that can be hosted anywhere.

## Current build — v0.3.0 (Phase 2 workspace + assets)

- Tauri 2 Windows desktop shell with React 19 + Vite + TypeScript editor.
- Splash screen followed by a dedicated **Projects** dashboard.
- Project creation flow with required name, optional description, **Blank** default, and starter-template selection.
- Recent projects plus an all-projects library with search and reopen/delete actions.
- MIT App Inventor/Figma-style **Build / Pages / Layers / Assets** workspace.
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

## Included visual elements

Heading, text, button, image, video, icon, input, textarea, select, label, form, card, container, section, spacer and divider.

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

See [`docs/ROADMAP.md`](docs/ROADMAP.md). Phase 1 is complete; Phase 2 now includes the project workspace, startup flow and first production asset pipeline in addition to the editor UX work.

## Contributing and security

Read [`CONTRIBUTING.md`](CONTRIBUTING.md), [`SECURITY.md`](SECURITY.md), and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) before contributing.

## Third-party material

Some starter concepts and block adapters are derived from user-supplied MIT-licensed ShadcnSpace templates. Attribution and license notes are in [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

## License

Nila Webs source is available under the MIT License. See [`LICENSE`](LICENSE).
