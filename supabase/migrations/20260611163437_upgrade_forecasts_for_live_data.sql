-- =========================================================
-- KU STARTUP PLANNER
-- 최신 경제 동향 기반 사업 전망 분석 기능 확장
-- =========================================================

-- ---------------------------------------------------------
-- 1. forecasts 테이블 확장
-- ---------------------------------------------------------

alter table public.forecasts
  add column if not exists trend_summary text;

alter table public.forecasts
  add column if not exists sources jsonb
  not null
  default '[]'::jsonb;

alter table public.forecasts
  add column if not exists data_snapshot jsonb
  not null
  default '{}'::jsonb;

alter table public.forecasts
  add column if not exists fetched_at timestamptz
  not null
  default now();

alter table public.forecasts
  add column if not exists model_used text;

alter table public.forecasts
  add column if not exists updated_at timestamptz
  not null
  default now();


-- ---------------------------------------------------------
-- 2. 조회 성능 개선용 인덱스
-- ---------------------------------------------------------

create index if not exists forecasts_project_id_created_at_idx
  on public.forecasts(project_id, created_at desc);

create index if not exists forecasts_project_id_fetched_at_idx
  on public.forecasts(project_id, fetched_at desc);


-- ---------------------------------------------------------
-- 3. updated_at 자동 갱신 트리거
-- 기존 프로젝트 테이블에서 사용한 함수를 재사용
-- ---------------------------------------------------------

drop trigger if exists update_forecasts_updated_at
  on public.forecasts;

create trigger update_forecasts_updated_at
before update on public.forecasts
for each row
execute function public.update_updated_at_column();


-- ---------------------------------------------------------
-- 4. 전망 데이터 업데이트 정책
-- 로그인 사용자는 본인 프로젝트의 전망만 수정 가능
-- ---------------------------------------------------------

drop policy if exists "Users can update own forecasts"
  on public.forecasts;

create policy "Users can update own forecasts"
on public.forecasts
for update
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = forecasts.project_id
      and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects
    where projects.id = forecasts.project_id
      and projects.user_id = auth.uid()
  )
);


-- ---------------------------------------------------------
-- 5. 전망 데이터 삭제 정책
-- 로그인 사용자는 본인 프로젝트의 전망만 삭제 가능
-- ---------------------------------------------------------

drop policy if exists "Users can delete own forecasts"
  on public.forecasts;

create policy "Users can delete own forecasts"
on public.forecasts
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = forecasts.project_id
      and projects.user_id = auth.uid()
  )
);