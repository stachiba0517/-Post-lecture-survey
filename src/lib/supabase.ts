import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/**
 * 一般公開のアンケート送信専用クライアント。
 * 管理画面のログインセッションとは別の `storageKey` を使い、常に anon で INSERT する。
 *
 * @returns 設定が揃っていれば Supabase クライアント、不足時は null
 */
export function createSupabasePublicFormClient(): SupabaseClient | null {
  if (!url || !key) {
    return null
  }
  return createClient(url, key, {
    auth: {
      storageKey: 'survey-public-form',
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

/**
 * 管理画面用。Supabase Auth のセッションを通常どおりブラウザに保持する。
 *
 * @returns 設定が揃っていれば Supabase クライアント、不足時は null
 */
export function createSupabaseAdminClient(): SupabaseClient | null {
  if (!url || !key) {
    return null
  }
  return createClient(url, key)
}
