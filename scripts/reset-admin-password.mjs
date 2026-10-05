#!/usr/bin/env node
/**
 * Reset password admin (D1) secara AMAN.
 *
 * Password diketik interaktif dan TIDAK disimpan di mana pun selain sebagai hash.
 * Hash memakai skema yang sama dengan aplikasi:
 *   pbkdf2_sha256$100000$<salt_base64>$<derived_base64>
 *
 * Usage:
 *   node scripts/reset-admin-password.mjs
 *
 * Opsi (opsional):
 *   --email <email>     Target user (default: admin@devscope.my.id)
 *   --db-name <name>    Nama D1 database (default: baca dari wrangler.toml)
 *   --local             Target D1 local (default: remote)
 *   --yes               Skip konfirmasi
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';

const PASSWORD_SCHEME = 'pbkdf2_sha256';
const PASSWORD_ITERATIONS = 100_000;
const DERIVED_BITS = 256;

function parseArgs(argv) {
  const out = { email: 'admin@devscope.my.id', dbName: '', local: false, yes: false };
  for (let i = 0; i < argv.length; i += 1) {
    const t = String(argv[i] ?? '');
    if (t === '--email') { out.email = String(argv[i + 1] ?? '').trim(); i += 1; continue; }
    if (t === '--db-name') { out.dbName = String(argv[i + 1] ?? '').trim(); i += 1; continue; }
    if (t === '--local') { out.local = true; continue; }
    if (t === '--yes') { out.yes = true; continue; }
    if (t === '--help' || t === '-h') {
      console.log('Usage: node scripts/reset-admin-password.mjs [--email <email>] [--db-name <name>] [--local] [--yes]');
      process.exit(0);
    }
  }
  return out;
}

function readDbNameFromWrangler() {
  try {
    const content = readFileSync(resolve('wrangler.toml'), 'utf8');
    const m = content.match(/database_name\s*=\s*"([^"]+)"/);
    return m ? m[1] : '';
  } catch {
    return '';
  }
}

function toBase64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PASSWORD_ITERATIONS },
    key,
    DERIVED_BITS
  );
  const derived = new Uint8Array(bits);
  return `${PASSWORD_SCHEME}$${PASSWORD_ITERATIONS}$${toBase64(salt)}$${toBase64(derived)}`;
}

function askHidden(question) {
  return new Promise((resolvePromise) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const stdin = process.stdin;
    const onData = (char) => {
      const s = char.toString();
      if (s === '\n' || s === '\r' || s === '\u0004') return;
      // Redraw prompt without echoing the typed character
      process.stdout.clearLine?.(0);
      process.stdout.cursorTo?.(0);
      process.stdout.write(question);
    };
    process.stdout.write(question);
    stdin.on('data', onData);
    rl.question('', (answer) => {
      stdin.removeListener('data', onData);
      rl.close();
      process.stdout.write('\n');
      resolvePromise(answer);
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dbName = args.dbName || readDbNameFromWrangler();
  if (!dbName) {
    console.error('❌ Tidak bisa menentukan nama database D1. Pakai --db-name <name>.');
    process.exit(1);
  }

  const email = args.email.trim().toLowerCase();
  console.log(`\n🔐 Reset password untuk: ${email}`);
  console.log(`   Database: ${dbName} (${args.local ? 'LOCAL' : 'REMOTE'})\n`);

  const p1 = await askHidden('Password baru: ');
  const p2 = await askHidden('Ulangi password: ');

  if (p1 !== p2) {
    console.error('❌ Password tidak sama. Dibatalkan.');
    process.exit(1);
  }
  if (p1.length < 8 || p1.length > 128) {
    console.error('❌ Password harus 8-128 karakter.');
    process.exit(1);
  }

  const hash = await hashPassword(p1);
  // hash tidak mengandung tanda kutip tunggal, jadi aman di SQL literal
  if (hash.includes("'")) {
    console.error('❌ Hash mengandung karakter tak terduga. Dibatalkan.');
    process.exit(1);
  }

  if (!args.yes) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const ans = await new Promise((r) => rl.question(`Lanjut update DB ${args.local ? 'LOCAL' : 'REMOTE'}? (y/N) `, r));
    rl.close();
    if (!/^y(es)?$/i.test(ans.trim())) {
      console.log('Dibatalkan.');
      process.exit(0);
    }
  }

  const dir = mkdtempSync(join(tmpdir(), 'mf-reset-'));
  const sqlFile = join(dir, 'update.sql');
  const sql = `UPDATE users SET password_hash = '${hash}', updated_at = CURRENT_TIMESTAMP WHERE lower(email) = '${email}';\nSELECT email, display_name, CASE WHEN password_hash IS NULL THEN 'NO' ELSE 'YES' END AS has_pw FROM users WHERE lower(email) = '${email}';\n`;
  writeFileSync(sqlFile, sql, 'utf8');

  try {
    const cliArgs = ['wrangler', 'd1', 'execute', dbName, '--file', sqlFile];
    if (!args.local) cliArgs.push('--remote');
    else cliArgs.push('--local');
    console.log('\n⏳ Menjalankan wrangler d1 execute...\n');
    const res = spawnSync('npx', ['--no-install', ...cliArgs], { stdio: 'inherit' });
    if (res.status !== 0) {
      console.error(`\n❌ wrangler keluar dengan kode ${res.status}.`);
      process.exit(res.status ?? 1);
    }
    console.log('\n✅ Password berhasil direset. Silakan login di /auth/login (jangan lupa CAPTCHA).');
  } finally {
    // bersihkan file SQL sementara
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

main().catch((err) => {
  console.error('❌ Error:', err?.message ?? err);
  process.exit(1);
});
