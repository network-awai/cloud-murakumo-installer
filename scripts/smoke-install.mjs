#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readlinkSync, rmSync } from 'node:fs';
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
  execFileSync(join(env.MURAKUMO_BIN_DIR, 'murakumo'), ['node', '--help'], { env, timeout: 30000 });
  console.log(result.trim());
} finally {
  rmSync(temp, { recursive: true, force: true });
}
