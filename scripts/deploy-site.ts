import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

/**
 * Publie le site vitrine sur GitHub Pages, branche `gh-pages` du dépôt.
 *   npm run site:deploy
 * 1. build du site dans site-dist/
 * 2. copie dans un dossier temporaire, commit unique, push forcé sur origin/gh-pages
 * La branche gh-pages ne contient que le site compilé : la forcer est sans risque
 * pour le code, qui vit sur les autres branches.
 */

const root = path.resolve(import.meta.dirname, '..');
const run = (cmd: string, cwd = root) => execSync(cmd, { cwd, stdio: 'inherit' });
const out = (cmd: string, cwd = root) => execSync(cmd, { cwd, encoding: 'utf8' }).trim();

// Publie sur tous les dépôts distants configurés (ex. origin = Fantiflex, mine = fork personnel).
const remotes = out('git remote').split(/\s+/).filter(Boolean).map((name) => ({ name, url: out(`git remote get-url ${name}`) }));
const sourceSha = out('git rev-parse --short HEAD');
const sourceBranch = out('git rev-parse --abbrev-ref HEAD');

console.log('Build du site…');
run('npm run site:build');

const dist = path.join(root, 'site-dist');
if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('site-dist/index.html introuvable');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'legriot-pages-'));
fs.cpSync(dist, tmp, { recursive: true });
// Pas de traitement Jekyll ; 404 = index pour les liens profonds.
fs.writeFileSync(path.join(tmp, '.nojekyll'), '');
fs.copyFileSync(path.join(tmp, 'index.html'), path.join(tmp, '404.html'));

run('git init -q -b gh-pages', tmp);
run('git add -A', tmp);
run(`git commit -q -m "site: build depuis ${sourceBranch}@${sourceSha}"`, tmp);
for (const r of remotes) {
  console.log(`Publication sur ${r.name} (${r.url})…`);
  run(`git push -f "${r.url}" gh-pages:gh-pages`, tmp);
}
fs.rmSync(tmp, { recursive: true, force: true });

console.log('\nPublié sur la branche gh-pages.');
for (const r of remotes) {
  const m = r.url.match(/github\.com[/:]([^/]+)\/([^/.]+)/);
  if (m) console.log(`  https://${m[1].toLowerCase()}.github.io/${m[2]}/`);
}
console.log('(une à deux minutes de délai ; GitHub Pages doit être activé sur chaque dépôt)');
