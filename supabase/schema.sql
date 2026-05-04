-- =============================================================================
-- アンケート + 管理画面用スキーマ（RLS）
-- 一般ユーザー（anon）: INSERT のみ
-- ログインユーザー（authenticated）: SELECT のみ
-- Supabase → SQL Editor に貼り付けて Run
-- =============================================================================

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  message text not null default ''
);

alter table public.survey_responses enable row level security;

drop policy if exists "survey anon insert only" on public.survey_responses;
drop policy if exists "survey authenticated select only" on public.survey_responses;

-- 公開アンケート: 未ログインでも回答を1件ずつ登録できる
create policy "survey anon insert only"
  on public.survey_responses
  for insert
  to anon
  with check (true);

-- 管理画面: ログイン済みユーザーのみ一覧を読める
create policy "survey authenticated select only"
  on public.survey_responses
  for select
  to authenticated
  using (true);

grant usage on schema public to anon, authenticated;
grant insert on public.survey_responses to anon;
grant select on public.survey_responses to authenticated;

-- （任意）以前の demo_entries から移行する場合の例:
-- insert into public.survey_responses (created_at, name, message)
-- select created_at, name, message from public.demo_entries;
