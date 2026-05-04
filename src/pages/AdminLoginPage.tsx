import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useOutletContext } from 'react-router-dom'
import type { AdminOutletContext } from './adminOutletContext'

/**
 * 管理ログイン。成功後は管理者ホームへ遷移する。
 */
export function AdminLoginPage() {
  const { supabase, session } = useOutletContext<AdminOutletContext>()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginBusy, setLoginBusy] = useState(false)

  if (session) {
    return <Navigate to="/admin/home" replace />
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setLoginError(null)
    setLoginBusy(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoginBusy(false)
    if (error) {
      setLoginError(error.message)
      return
    }
    setPassword('')
    void navigate('/admin/home', { replace: true })
  }

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
