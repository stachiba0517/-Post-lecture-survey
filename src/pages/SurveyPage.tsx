import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MissingEnv } from '../components/MissingEnv'
import { insertSurveyResponse } from '../lib/surveyResponses'
import { createSupabasePublicFormClient } from '../lib/supabase'

/**
 * 一般ユーザー向けアンケートページ（GitHub Pages 想定）。anon で INSERT のみ。
 */
export function SurveyPage() {
  const supabase = useMemo(() => createSupabasePublicFormClient(), [])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>(
    'idle',
  )
  const [errorText, setErrorText] = useState<string | null>(null)

  if (!supabase) {
    return <MissingEnv />
  }

  const client = supabase

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorText(null)
    setStatus('saving')

    const result = await insertSurveyResponse(client, {
      name,
      message: message || '',
    })

    if (!result.ok) {
      setStatus('error')
      setErrorText(result.message)
      return
    }

    setStatus('success')
    setName('')
    setMessage('')
  }

  return (
    <main className="page">
      <p className="nav-top">
        <Link to="/admin">管理者ログイン</Link>
      </p>
      <h1>アンケート</h1>
      <p className="lead">
        回答は <code>survey_responses</code> に保存されます（匿名送信）。
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <label className="field">
          <span>お名前</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            disabled={status === 'saving'}
          />
        </label>

        <label className="field">
          <span>ご意見・ご感想</span>
          <textarea
            name="message"
            rows={4}
            maxLength={2000}
            value={message}
            onChange={(ev) => setMessage(ev.target.value)}
            disabled={status === 'saving'}
          />
        </label>

        {errorText ? <p className="alert error">{errorText}</p> : null}
        {status === 'success' ? (
          <p className="alert success">送信ありがとうございました。</p>
        ) : null}

        <button type="submit" className="submit" disabled={status === 'saving'}>
          {status === 'saving' ? '送信中…' : '送信'}
        </button>
      </form>
    </main>
  )
}
