import { Link, Navigate, useOutletContext } from 'react-router-dom'
import type { AdminOutletContext } from './adminOutletContext'

/**
 * ログイン後の管理者ホーム。各機能へ遷移するバナーを並べる。
 */
export function AdminHomePage() {
  const { session, signOut } = useOutletContext<AdminOutletContext>()

  if (!session) {
    return <Navigate to="/admin" replace />
  }

  return (
    <main className="page page-wide">
      <header className="admin-header">
        <div>
          <h1>管理者ホーム</h1>
          <p className="hint muted">ログイン中: {session.user.email}</p>
        </div>
        <div className="admin-actions">
          <Link to="/">アンケート</Link>
          <button type="button" className="link-button" onClick={() => void signOut()}>
            ログアウト
          </button>
        </div>
      </header>

      <p className="lead muted admin-home-lead">
        利用する機能を選んでください。
      </p>

      <ul className="admin-banner-grid">
        <li>
          <Link className="admin-banner admin-banner--primary" to="/admin/responses">
            <span className="admin-banner__title">回答一覧</span>
            <span className="admin-banner__desc">
              アンケートの送信内容を日付順に確認します。
            </span>
          </Link>
        </li>
        <li>
          <div className="admin-banner admin-banner--muted" role="note">
            <span className="admin-banner__title">集計ダッシュボード</span>
            <span className="admin-banner__desc">準備中です。</span>
          </div>
        </li>
        <li>
          <div className="admin-banner admin-banner--muted" role="note">
            <span className="admin-banner__title">エクスポート</span>
            <span className="admin-banner__desc">CSV 等の出力は準備中です。</span>
          </div>
        </li>
        <li>
          <div className="admin-banner admin-banner--muted" role="note">
            <span className="admin-banner__title">アカウント設定</span>
            <span className="admin-banner__desc">プロフィール・パスワードは Supabase ダッシュボードから管理してください。</span>
          </div>
        </li>
      </ul>
    </main>
  )
}
