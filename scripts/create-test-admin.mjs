/**
 * Supabase Auth にテスト用の管理者ユーザーを1件作成する。
 * auth.users への手書き INSERT より安全（identities 等も GoTrue が処理する）。
 *
 * 使い方（例）:
 *   1. .env に一時的に SUPABASE_SERVICE_ROLE_KEY を追加（Project Settings → API の secret）
 *   2. node scripts/create-test-admin.mjs admin@example.com 'YourPassword123!'
 *   3. 作業後、.env から SUPABASE_SERVICE_ROLE_KEY を削除する（絶対に Git に載せない）
 *
 * ダッシュボードから作る場合: Authentication → Users → Add user
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')

/**
 * 簡易 .env パーサ（キー=値）。
 *
 * @param {string} file パス
 * @returns {Record<string, string>}
 */
function loadEnv(file) {
  const out = {}
  if (!fs.existsSync(file)) {
    return out
  }
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    out[k] = v
  }
  return out
}

const env = loadEnv(envPath)
const url = env.VITE_SUPABASE_URL?.trim()
const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const emailArg = process.argv[2]?.trim()
const passwordArg = process.argv[3]

if (!url || !serviceRole) {
  console.error(
    '失敗: .env に VITE_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY（secret / service_role）を設定してください。',
  )
  process.exit(1)
}

if (!emailArg || !passwordArg) {
  console.error(
    '使い方: node scripts/create-test-admin.mjs <メール> <パスワード>\n例: node scripts/create-test-admin.mjs admin@example.com \'Passw0rd!\'',
  )
  process.exit(1)
}

const admin = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data, error } = await admin.auth.admin.createUser({
  email: emailArg,
  password: passwordArg,
  email_confirm: true,
})

if (error) {
  console.error('失敗:', error.message)
  process.exit(1)
}

console.log('成功: 管理者ユーザーを作成しました。')
console.log('  user id:', data.user?.id)
console.log('  email:', data.user?.email)
console.log('/admin から上記メールとパスワードでログインできます。')
