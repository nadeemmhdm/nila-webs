# Architecture

## Goals

Nila Webs keeps the editor simple while ensuring exported websites are real source projects instead of screenshots, HTML snapshots, or runtime-dependent embeds.

## Editor stack

- **Desktop shell:** Tauri 2
- **Editor UI:** React 19 + Vite + TypeScript
- **State:** Zustand
- **Export packaging:** JSZip
- **Icons:** Lucide React

## Project model

A project contains pages, one global navbar, one global footer, and a serializable tree of `BuilderNode` objects. Each node has content, base desktop styles, tablet/mobile overrides, animations, link data, metadata and optional children.

## Block registry

`src/templates/library.ts` is the current native registry. Supplied Shadcn blocks are adapted into editable node trees with their source IDs preserved in metadata. This allows a dropped section to remain fully editable instead of becoming a screenshot or opaque iframe.

Future phases will add a component-source adapter for blocks that require complex React logic, WebGL, carousels, or stateful Shadcn components. Those blocks will keep a typed property manifest so the editor can expose safe visual controls without discarding the original implementation.

## Rendering

The editor canvas and exported site resolve the same style model:

1. Desktop/base style.
2. Tablet or mobile overrides when applicable.
3. Visibility for the active breakpoint.
4. Entrance and hover animation metadata.

## Global layout

Navbar and footer are project-level nodes. Pages reference them through `showNavbar` and `showFooter`, so updates propagate across every page automatically.

## Exporter

`src/lib/exporter.ts` generates a clean Vite project with React Router, the serialized site tree, responsive rendering logic, animation CSS and build instructions. The exported site runs independently from the desktop editor.

## Security boundary

The current editor does not execute arbitrary pasted JavaScript. User-supplied source blocks are converted through trusted adapters before appearing in the native library. This intentionally reduces the risk of executing unreviewed code inside the Tauri webview. A future custom-code mode should use an explicit sandbox and permission model rather than direct eval.


## Responsive design system

`BuilderProject.designSystem` is the single project-level source for runtime breakpoints, preview widths, content padding, spacing tokens and typography tokens. Desktop node styles are the base. Tablet resolves as Desktop + Tablet overrides; Mobile resolves as Desktop + Tablet + Mobile overrides. `ensureResponsiveProject` migrates older projects and provides non-destructive inferred defaults for every node, while explicit user overrides always win. The editor canvas and standalone React/Vite exporter use the same cascade and CSS-variable token model.
