/**
 * publishable / anon キーだけを使い、RLS のざっくり検証を行う。
 * - anon で INSERT ができるか（アンケート想定）
 * - 直後に anon で SELECT したとき、行が返ってこないか（一覧は認証のみ想定）
 *
 * 注意: テーブルが空で GET が 0 件のときは「正常」と「未検証」が区別しづらい。
 *       事前に1件以上回答がある状態で実行すると意味がはっきりする。
 *
 * 使い方: node scripts/security-smoke.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')

/**
 * 簡易 .env パーサ。
 *
 * @param {string} file パス
 * @returns {Record<string, string>}
 */
function loadEnv(file) {
  const out = {}
  if (!fs.existsSync(file)) return out
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
const baseUrl = (env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const key = env.VITE_SUPABASE_ANON_KEY || ''

if (!baseUrl || !key) {
  console.error('失敗: .env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。')
  process.exit(1)
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  // representation だと INSERT 応答用に SELECT が走り、anon に SELECT ポリシーが無いと失敗する
  Prefer: 'return=minimal',
}

const marker = `sec-smoke-${Date.now()}`
const insertBody = { name: marker, message: 'security-smoke test row' }

const postRes = await fetch(`${baseUrl}/rest/v1/survey_responses`, {
  method: 'POST',
  headers,
  body: JSON.stringify(insertBody),
})

const postText = await postRes.text()
if (!postRes.ok) {
  console.error('INSERT (anon): 失敗 HTTP', postRes.status, postText.slice(0, 400))
  process.exit(1)
}
console.log('INSERT (anon): OK')

const getRes = await fetch(
  `${baseUrl}/rest/v1/survey_responses?select=id,name&name=eq.${encodeURIComponent(marker)}`,
  { headers: { apikey: key, Authorization: `Bearer ${key}` } },
)

const getText = await getRes.text()
let rows = []
try {
  rows = JSON.parse(getText)
} catch {
  console.error('SELECT (anon): JSON でない応答', getText.slice(0, 200))
  process.exit(1)
}

if (!Array.isArray(rows)) {
  console.error('SELECT (anon): 予期しない応答', getText.slice(0, 200))
  process.exit(1)
}

if (rows.length > 0) {
  console.error(
    '問題: anon で自分が入れた行が SELECT できています。RLS（anon の SELECT 禁止）を確認してください。',
  )
  console.error('返却件数:', rows.length)
  process.exit(1)
}

console.log('SELECT (anon): 該当行なし（RLS で anon からは見えない想定どおり）')
console.log('')
console.log('補足:')
console.log('- service_role や .env の秘密はリポジトリに含めないこと')
console.log('- 管理画面はログイン後のみ SELECT（別途ブラウザで確認）')
console.log('- 依存関係: npm audit')
