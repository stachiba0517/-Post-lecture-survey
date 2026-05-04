import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MissingEnv } from '../components/MissingEnv'
import { listSurveyResponses, type SurveyResponseRow } from '../lib/surveyResponses'
import { createSupabaseAdminClient } from '../lib/supabase'

/**
 * 管理画面: メール＋パスワードでログインし、認証済みのみ一覧を表示する。
 */
export function AdminPage() {
  const supabase = useMemo(() => createSupabaseAdminClient(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginBusy, setLoginBusy] = useState(false)
  const [rows, setRows] = useState<SurveyResponseRow[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [listBusy, setListBusy] = useState(false)

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

  useEffect(() => {
    if (!supabase || !session) {
      setRows([])
      return
    }

    let cancelled = false
    setListBusy(true)
    setListError(null)
    void listSurveyResponses(supabase).then((result) => {
      if (cancelled) return
      setListBusy(false)
      if (!result.ok) {
        setListError(result.message)
        setRows([])
        return
      }
      setRows(result.rows)
    })

    return () => {
      cancelled = true
    }
  }, [supabase, session])

  if (!supabase) {
    return <MissingEnv />
  }

  const client = supabase

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginBusy(true)
    const { error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoginBusy(false)
    if (error) {
      setLoginError(error.message)
      return
    }
    setPassword('')
  }

  async function handleLogout() {
    setListError(null)
    await client.auth.signOut()
  }

  if (!sessionReady) {
    return (
      <main className="page">
        <p className="hint">読み込み中…</p>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="page">
        <p className="nav-top">
          <Link to="/">アンケートに戻る</Link>
        </p>
        <h1>管理ログイン</h1>
        <p className="lead muted">
          Supabase Auth に登録した管理者アカウントでサインインしてください。
        </p>

        <form className="card" onSubmit={handleLogin}>
          <label className="field">
            <span>メールアドレス</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              disabled={loginBusy}
            />
          </label>
          <label className="field">
            <span>パスワード</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              disabled={loginBusy}
            />
          </label>
          {loginError ? <p className="alert error">{loginError}</p> : null}
          <button type="submit" className="submit" disabled={loginBusy}>
            {loginBusy ? 'ログイン中…' : 'ログイン'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="page page-wide">
      <header className="admin-header">
        <div>
          <h1>回答一覧</h1>
          <p className="hint muted">ログイン中: {session.user.email}</p>
        </div>
        <div className="admin-actions">
          <Link to="/">アンケート</Link>
          <button type="button" className="link-button" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </header>

      {listError ? <p className="alert error">{listError}</p> : null}
      {listBusy ? <p className="hint">取得中…</p> : null}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>日時</th>
              <th>お名前</th>
              <th>内容</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !listBusy ? (
              <tr>
                <td colSpan={3} className="empty-cell">
                  データがありません。
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id}>
                  <td className="cell-nowrap">
                    {new Date(r.created_at).toLocaleString('ja-JP')}
                  </td>
                  <td>{r.name}</td>
                  <td className="cell-pre">{r.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
