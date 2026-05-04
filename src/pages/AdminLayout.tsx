import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { MissingEnv } from '../components/MissingEnv'
import { createSupabaseAdminClient } from '../lib/supabase'
import type { AdminOutletContext } from './adminOutletContext'

/**
 * 管理エリアの共通レイアウト。Supabase セッションを監視し、子ルートにコンテキストを渡す。
 */
export function AdminLayout() {
  const supabase = useMemo(() => createSupabaseAdminClient(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    if (!supabase) return

    let cancelled = false
    void supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setSession(data.session ?? null)
        setSessionReady(true)
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  if (!supabase) {
    return <MissingEnv />
  }

  if (!sessionReady) {
    return (
      <main className="page">
        <p className="hint">読み込み中…</p>
      </main>
    )
  }

  const ctx: AdminOutletContext = {
    supabase,
    session,
    sessionReady,
    signOut,
  }

  return <Outlet context={ctx} />
}
