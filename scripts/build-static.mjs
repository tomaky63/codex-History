/**
 * Static build orchestrator for GitHub Pages.
 *
 * 1. `src/app/admin` を `_admin_excluded_during_build` に退避 (Next.js は `_` 始まりを routing 除外)
 * 2. Prisma → `public/data/*.json` を生成 (scripts/generate-static-data.mjs)
 * 3. `next build` (= static export) を実行し `out/` を書き出す
 * 4. finally: admin ディレクトリを必ず元に戻す
 */
import { spawnSync } from 'node:child_process';
import { existsSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(dirname(__filename));

const ADMIN_DIR   = join(ROOT, 'src', 'app', 'admin');
const ADMIN_PARK  = join(ROOT, 'src', 'app', '_admin_excluded_during_build');

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
    cwd: ROOT,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} exited with code ${result.status}`);
  }
}

function parkAdmin() {
  if (existsSync(ADMIN_DIR)) {
    if (existsSync(ADMIN_PARK)) {
      throw new Error(`${ADMIN_PARK} already exists; aborting to avoid data loss.`);
    }
    renameSync(ADMIN_DIR, ADMIN_PARK);
    console.log('[build-static] admin を一時退避しました');
  }
}

function restoreAdmin() {
  if (existsSync(ADMIN_PARK)) {
    renameSync(ADMIN_PARK, ADMIN_DIR);
    console.log('[build-static] admin を元の位置に戻しました');
  }
}

async function main() {
  parkAdmin();
  try {
    console.log('[build-static] Prisma から静的 JSON を生成します');
    run('npx', ['tsx', 'scripts/generate-static-data.mjs']);

    console.log('[build-static] next build を実行します');
    run('npx', ['next', 'build']);
  } finally {
    restoreAdmin();
  }
}

main().catch(err => {
  console.error('[build-static] 失敗:', err);
  process.exit(1);
});
