#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'murakumo-installer-'));
const env = { ...process.env,
  MURAKUMO_INSTALL_DIR: join(temp, 'share'),
  MURAKUMO_BIN_DIR: join(temp, 'bin') };
try {
  const result = execFileSync('sh', [join(root, 'install.sh')], { env, encoding: 'utf8', timeout: 120000 });
  const link = readlinkSync(join(env.MURAKUMO_BIN_DIR, 'murakumo'));
  if (link !== join(env.MURAKUMO_INSTALL_DIR, 'current/murakumo')) throw new Error('Unexpected launcher link');
  const moduleText = readFileSync(join(env.MURAKUMO_INSTALL_DIR, 'current/nixos-node.nix'), 'utf8');
  assert.match(moduleText, /claimResponder\.enable/);
  assert.match(moduleText, /--idle-only/);
  const help = execFileSync(join(env.MURAKUMO_BIN_DIR, 'murakumo'), ['node', '--help'],
    { env, encoding: 'utf8', timeout: 30000 });
  for (const required of ['node qualify', 'node earnings', 'node payout', '--idle-only']) {
    assert.ok(help.includes(required), `Pinned node release does not support ${required}`);
  }
  console.log(result.trim());
} finally {
  rmSync(temp, { recursive: true, force: true });
}
