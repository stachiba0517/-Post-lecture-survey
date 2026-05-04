/**
 * .env の URL / キーを使い、PostgREST 経由で survey_responses に1件 INSERT できるか確認する。
 * 成功・失敗はメッセージのみ表示し、キー本体は出さない。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '..', '.env')

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
const baseUrl = (env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const key = env.VITE_SUPABASE_ANON_KEY || ''

if (!baseUrl || !key) {
  console.error('失敗: .env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。')
  process.exit(1)
}

const row = {
  name: 'verify-script',
  message: `検証 ${new Date().toISOString()}`,
}

const res = await fetch(`${baseUrl}/rest/v1/survey_responses`, {
  method: 'POST',
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  },
  body: JSON.stringify(row),
})

if (!res.ok) {
  const text = await res.text()
  console.error('失敗: HTTP', res.status)
  console.error(text.slice(0, 500))
  if (text.includes('PGRST205') || text.includes('survey_responses')) {
    console.error(
      '\nヒント: テーブルが未作成の可能性があります。Supabase の SQL Editor で supabase/schema.sql を実行してください。',
    )
  }
  process.exit(1)
}

console.log(
  '成功: survey_responses に1件 INSERT できました。Table Editor で確認してください。',
)
