# Windows Release

Nila Webs v1.5.0 ships as both an NSIS setup executable and a WiX MSI package. Windows builds run on `windows-latest`, verify Phase 10, compile the web editor, build both installers, optionally Authenticode-sign them when repository certificate secrets are configured, generate SHA-256 checksums, and upload the installer artifact.

## Signing preparation

Configure repository secrets `WINDOWS_CERTIFICATE_BASE64` and `WINDOWS_CERTIFICATE_PASSWORD` to sign release installers. Without them, CI deliberately emits unsigned installers rather than hiding signing status.

## Updater strategy

For v1.5.0 the application does not auto-download code. GitHub Releases is the authoritative update channel. An automatic updater should only be enabled after provisioning a stable HTTPS update endpoint plus long-lived update-signing keys and rollback policy.

## Installer behavior

The NSIS installer allows current-user or per-machine installation. The MSI is generated in en-US. WebView2 uses the download bootstrapper when required. Downgrades are blocked by default.
