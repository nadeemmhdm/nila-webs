# Security Policy

## Supported versions

Security fixes are applied to the latest development branch until stable releases are published.

## Reporting a vulnerability

Please use GitHub's private security-reporting / Security Advisory flow for this repository when available. Do **not** publish secrets, exploit details, personal data, tokens, or private project files in a public issue. If private reporting is unavailable, open a minimal public issue asking for a private contact channel without including sensitive details.

## Security principles

- Nila Webs must never store API keys, passwords, access tokens, or credentials in source control.
- Arbitrary pasted JavaScript is not executed directly inside the Tauri webview. Complex external blocks must pass through reviewed adapters or a future sandbox.
- Project files are local-first. Future filesystem access should be limited to user-selected project folders and explicit native capabilities.
- Exported sites must not contain editor-only state, local paths, or secrets.
- External media URLs are treated as untrusted content.
- The Tauri CSP should remain restrictive; expand it only for documented features.

## Dependency updates

React, Vite, Tauri, Rust crates and npm dependencies should be reviewed regularly for advisories. CI must build the web editor for every pull request.
