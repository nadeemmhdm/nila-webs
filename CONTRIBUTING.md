# Contributing to Nila Webs

Thanks for helping improve the visual builder.

## Development setup

1. Fork or clone the repository.
2. Install Node.js and npm.
3. Run `npm install`.
4. Run `npm run dev` for browser development.
5. Install Tauri 2 prerequisites when working on the desktop shell.

## Pull requests

Keep changes focused. Explain the user-facing behavior, test the affected editor workflow, and include screenshots for UI changes when practical. Run `npm run build` before requesting review.

## Block adapters

New visual blocks should:

- Preserve a stable source ID in `meta.sourceId`.
- Remain editable as node trees when possible.
- Provide responsive defaults.
- Avoid executing untrusted code or remote scripts.
- Export correctly through the React/Vite renderer.
- Add dependencies only when the block genuinely requires them.

## Code style

Use TypeScript, small focused React components, accessible controls, deterministic project serialization and explicit types for new schema fields.
