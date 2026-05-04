import type { SupabaseClient } from '@supabase/supabase-js'

const TABLE = 'survey_responses' as const

/** アンケート1件の回答行 */
export type SurveyResponseRow = {
  id: string
  created_at: string
  name: string
  message: string
}

/** アンケート回答の挿入用ペイロード */
export type SurveyResponseInsert = {
  name: string
  message: string
}

/**
 * 一般ユーザー向け: `survey_responses` に1件 INSERT する（anon 想定）。
 *
 * @param client 公開フォーム用クライアント
 * @param row 名前とメッセージ
 * @returns 成功時は ok: true、失敗時はメッセージ付きで ok: false
 */
export async function insertSurveyResponse(
  client: SupabaseClient,
  row: SurveyResponseInsert,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await client.from(TABLE).insert({
    name: row.name.trim(),
    message: row.message.trim(),
  })

  if (error) {
    return { ok: false, message: error.message }
  }
  return { ok: true }
}

/**
 * 管理向け: `survey_responses` を新しい順で最大 `limit` 件 SELECT する（authenticated 想定）。
 *
 * @param client 管理画面用クライアント（ログイン済みセッション付き）
 * @param limit 取得件数の上限
 * @returns 成功時は行配列、失敗時はメッセージ
 */
export async function listSurveyResponses(
  client: SupabaseClient,
  limit = 500,
): Promise<
  { ok: true; rows: SurveyResponseRow[] } | { ok: false; message: string }
> {
  const { data, error } = await client
    .from(TABLE)
    .select('id, created_at, name, message')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { ok: false, message: error.message }
  }
  return { ok: true, rows: (data ?? []) as SurveyResponseRow[] }
}
