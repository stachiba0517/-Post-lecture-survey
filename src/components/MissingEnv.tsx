/**
 * Supabase の環境変数が未設定のときに表示する案内。
 */
export function MissingEnv() {
  return (
    <main className="page">
      <h1>設定が必要です</h1>
      <p className="hint">
        プロジェクト直下に <code>.env</code> を作成し、次を設定してください。
      </p>
      <pre className="env-block">
        {`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=（publishable または anon）

# GitHub Pages でリポジトリ名がパスになる場合（例: /gijutugassyuku/）
# VITE_BASE_PATH=/gijutugassyuku/`}
      </pre>
      <p className="hint muted">
        値は Supabase の Project Settings → API から取得できます。
      </p>
    </main>
  )
}
