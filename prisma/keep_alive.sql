-- GitHub Actions（.github/workflows/keep-supabase-alive.yml）が REST 経由で呼ぶ関数。
-- Supabase の SQL Editor で実行する（Supabase 専用の anon ロールを使うため、Prisma のマイグレーションには入れない）。
-- プロジェクトを作り直したときは、これを実行し直す。何度実行しても同じ結果になる。
create or replace function public.keep_alive()
returns integer
language sql
stable
as $$ select 1 $$;

grant execute on function public.keep_alive() to anon;
