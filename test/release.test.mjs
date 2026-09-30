import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
test('published installer and lock describe one immutable release', () => {
  const script = readFileSync(resolve(root, 'install.sh'));
  const lock = JSON.parse(readFileSync(resolve(root, 'release-lock.json')));
  assert.match(lock.commit, /^[0-9a-f]{40}$/);
  if (lock.channel === 'preview') {
    assert.match(lock.sourceRef, /^origin\/[A-Za-z0-9._/-]+$/);
    assert.notEqual(lock.sourceRef, 'origin/main');
  } else {
    assert.equal(lock.channel, undefined);
    assert.equal(lock.sourceRef, undefined);
  }
  assert.equal(createHash('sha256').update(script).digest('hex'), lock.installerSha256);
  assert.ok(script.includes(`https://raw.githubusercontent.com/${lock.source}/${lock.commit}/release`));
  assert.ok(script.includes(`const hashes=${JSON.stringify(lock.hashes)};`));
  const version = createHash('sha256').update(JSON.stringify(lock.hashes)).digest('hex').slice(0, 16);
  assert.ok(script.includes(`release-${version}`));
  assert.ok(!script.includes('/main/release'));
});
