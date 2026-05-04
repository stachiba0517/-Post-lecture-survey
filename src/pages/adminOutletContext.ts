import type { Session, SupabaseClient } from '@supabase/supabase-js'

/** `/admin` 配下の子ルートへ渡す認証まわりのコンテキスト */
export type AdminOutletContext = {
  supabase: SupabaseClient
  session: Session | null
  sessionReady: boolean
  signOut: () => Promise<void>
}
