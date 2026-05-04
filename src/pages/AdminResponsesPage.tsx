import { useEffect, useState } from 'react'
import { Link, Navigate, useOutletContext } from 'react-router-dom'
import { listSurveyResponses, type SurveyResponseRow } from '../lib/surveyResponses'
import type { AdminOutletContext } from './adminOutletContext'

/**
 * 認証済みユーザーのみが閲覧できるアンケート回答一覧。
 */
export function AdminResponsesPage() {
  const { supabase, session, signOut } = useOutletContext<AdminOutletContext>()
  const [rows, setRows] = useState<SurveyResponseRow[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [listBusy, setListBusy] = useState(false)

  useEffect(() => {
    if (!session) return

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

  if (!session) {
    return <Navigate to="/admin" replace />
  }

  return (
    <main className="page page-wide">
      <header className="admin-header">
        <div>
          <h1>回答一覧</h1>
          <p className="hint muted">
            <Link to="/admin/home">← 管理者ホーム</Link>
            {' · '}
            ログイン中: {session.user.email}
          </p>
        </div>
        <div className="admin-actions">
          <Link to="/">アンケート</Link>
          <button type="button" className="link-button" onClick={() => void signOut()}>
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
