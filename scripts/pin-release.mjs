#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [commit, source] = process.argv.slice(2);
if (!/^[0-9a-f]{40}$/.test(commit ?? '') || !source) {
  console.error('Usage: node scripts/pin-release.mjs <40-char murakumo commit> <murakumo checkout>');
  process.exit(2);
}
const git = (...args) => execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' });
try {
  git('merge-base', '--is-ancestor', commit, 'origin/main');
} catch {
  console.error('Release commit must be reachable from the fetched origin/main.');
  process.exit(1);
}
const files = ['node.mjs', 'package.json', 'package-lock.json'];
const hashes = Object.fromEntries(files.map((name) => {
  const bytes = execFileSync('git', ['-C', source, 'show', `${commit}:release/${name}`]);
  return [name, createHash('sha256').update(bytes).digest('hex')];
}));
const template = readFileSync(resolve(root, 'install.sh.in'), 'utf8');
for (const marker of ['__HASHES__', '__VERSION__', '__RELEASE_COMMIT__']) {
  if (!template.includes(marker)) throw new Error(`Missing template marker ${marker}`);
}
const installer = template
  .replace('__HASHES__', JSON.stringify(hashes))
  .replace('__VERSION__', hashes['node.mjs'].slice(0, 16))
  .replace('__RELEASE_COMMIT__', commit);
writeFileSync(resolve(root, 'install.sh'), installer);
writeFileSync(resolve(root, 'release-lock.json'), JSON.stringify({
  source: 'kotoba-lang/murakumo', commit, hashes,
  installerSha256: createHash('sha256').update(installer).digest('hex'),
}, null, 2) + '\n');
console.log(`Pinned ${commit} (${hashes['node.mjs'].slice(0, 16)})`);
