# Nila Webs

Windows-first drag-and-drop React + Vite website builder built with Tauri, React, TypeScript and Vite.

## Status

Nila Webs has completed the 10-phase roadmap through v1.5.0. It includes a professional visual builder, reusable components, prompt/code-to-block conversion, responsive design, motion, navigation/forms/SEO, SEO/AEO/GEO/security tooling, project recovery, production React/Vite export, ZIP/GitHub publishing, provenance protection, and hardened Windows installers.

## Windows Release

Phase 10 ships Nila Webs as both NSIS `.exe` and WiX `.msi` installers. Windows CI validates the desktop bundle, preserves strict CSP and restricted Tauri capabilities, supports optional Authenticode signing when certificate secrets are configured, generates SHA-256 installer checksums, and publishes installer artifacts. GitHub Releases is the authoritative update channel for v1.5.0.

## Development

```bash
npm install
npm run dev
```

## Production Web Build

```bash
npm run build
```

## Windows Desktop Build

```bash
npm run build:windows
```

## Verification

```bash
npm run verify:phase10
```

## License

MIT
