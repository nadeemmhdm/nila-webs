import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const pkg = JSON.parse(read('package.json'));
const tauri = JSON.parse(read('src-tauri/tauri.conf.json'));
const cargo = read('src-tauri/Cargo.toml');
const roadmap = read('docs/ROADMAP.md');
const windowsWorkflow = read('.github/workflows/windows-release.yml');
const webWorkflow = read('.github/workflows/web-build.yml');

const checks = [
  ['version 1.5.0', pkg.version === '1.5.0'],
  ['phase10 verifier script', pkg.scripts?.['verify:phase10'] === 'node scripts/verify-phase10.mjs'],
  ['windows tauri build script', pkg.scripts?.['tauri:build:windows'] === 'tauri build --bundles nsis,msi'],
  ['tauri version sync', tauri.version === '1.5.0'],
  ['cargo version sync', /version\s*=\s*"1\.5\.0"/.test(cargo)],
  ['windows bundle active', tauri.bundle?.active === true],
  ['nsis target', Array.isArray(tauri.bundle?.targets) && tauri.bundle.targets.includes('nsis')],
  ['msi target', Array.isArray(tauri.bundle?.targets) && tauri.bundle.targets.includes('msi')],
  ['downgrade protection', tauri.bundle?.windows?.allowDowngrades === false],
  ['webview bootstrapper', tauri.bundle?.windows?.webviewInstallMode?.type === 'downloadBootstrapper'],
  ['sha256 signing prep', String(tauri.bundle?.windows?.digestAlgorithm || '').toLowerCase() === 'sha256'],
  ['windows runner', windowsWorkflow.includes('runs-on: windows-latest')],
  ['nsis and msi build', windowsWorkflow.includes('npm run tauri:build:windows')],
  ['installer existence gate', windowsWorkflow.includes('No NSIS .exe installer found') && windowsWorkflow.includes('No MSI installer found')],
  ['sha256 installer manifest', windowsWorkflow.includes('SHA256SUMS.txt') && windowsWorkflow.includes('Get-FileHash')],
  ['installer artifact upload', windowsWorkflow.includes('actions/upload-artifact@v4') && windowsWorkflow.includes('nila-webs-windows-installers')],
  ['permanent CI phase10 gate', webWorkflow.includes('npm run verify:phase10')],
  ['phase10 roadmap complete', roadmap.includes('Phase 10 — Windows release and hardening ✅') && roadmap.includes('v1.5.0')]
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${name}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`Phase 10 verification failed (${failed}/${checks.length}).`);
  process.exit(1);
}
console.log(`Phase 10 verification passed (${checks.length}/${checks.length}).`);
