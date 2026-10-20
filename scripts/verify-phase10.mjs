import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const pkg=JSON.parse(read('package.json'));
const tauri=JSON.parse(read('src-tauri/tauri.conf.json'));
const cargo=read('src-tauri/Cargo.toml');
const caps=read('src-tauri/capabilities/default.json');
const workflow=read('.github/workflows/windows-release.yml');
const roadmap=read('docs/ROADMAP.md');
const recovery=read('src/lib/project-storage.ts');
const checks=[
 ['version 1.5.0',pkg.version==='1.5.0'&&tauri.version==='1.5.0'&&cargo.includes('version = "1.5.0"')],
 ['phase 10 verifier registered',pkg.scripts?.['verify:phase10']==='node scripts/verify-phase10.mjs'],
 ['Windows build command',pkg.scripts?.['build:windows']==='tauri build --bundles nsis,msi'],
 ['NSIS target',tauri.bundle?.targets?.includes('nsis')],
 ['MSI target',tauri.bundle?.targets?.includes('msi')],
 ['Windows icon',tauri.bundle?.icon?.includes('icons/icon.ico')],
 ['safe WebView2 bootstrapper',tauri.bundle?.windows?.webviewInstallMode?.type==='downloadBootstrapper'],
 ['downgrade protection',tauri.bundle?.windows?.allowDowngrades===false],
 ['NSIS install mode',tauri.bundle?.windows?.nsis?.installMode==='both'],
 ['MSI language',tauri.bundle?.windows?.wix?.language==='en-US'],
 ['restricted capability surface',caps.includes('core:default')&&!caps.includes('shell:')&&!caps.includes('fs:')],
 ['strict CSP remains enabled',String(tauri.app?.security?.csp||'').includes("default-src 'self'")],
 ['release profile hardening',cargo.includes('lto = "thin"')&&cargo.includes('codegen-units = 1')&&cargo.includes('panic = "abort"')],
 ['recovery retained',recovery.includes('recovery')||recovery.includes('snapshot')],
 ['Windows CI runner',workflow.includes('runs-on: windows-latest')],
 ['installer artifact upload',workflow.includes("'.exe'")&&workflow.includes("'.msi'")&&workflow.includes('actions/upload-artifact@v4')&&workflow.includes('release/windows/*')],
 ['optional signing preparation',workflow.includes('WINDOWS_CERTIFICATE_BASE64')&&workflow.includes('signtool')],
 ['tag release automation',workflow.includes('gh release')&&workflow.includes("refs/tags/")],
 ['Phase 10 roadmap complete',roadmap.includes('Phase 10 — Windows release and hardening ✅')&&roadmap.includes('v1.5.0')]
];
let failed=0; for(const [name,ok] of checks){console.log(`${ok?'✓':'✗'} ${name}`);if(!ok)failed++;}
if(failed){console.error(`Phase 10 verification failed (${failed}/${checks.length}).`);process.exit(1)}
console.log(`Phase 10 verification passed (${checks.length}/${checks.length}).`);
