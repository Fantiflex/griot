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

const remote = out('git remote get-url origin');
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
run(`git push -f "${remote}" gh-pages:gh-pages`, tmp);
fs.rmSync(tmp, { recursive: true, force: true });

console.log('\nPublié sur la branche gh-pages.');
console.log('Adresse : https://fantiflex.github.io/griot/ (une à deux minutes de délai)');
