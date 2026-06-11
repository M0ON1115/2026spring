-- =========================================================
-- KU STARTUP PLANNER
-- Auth 기반 프로젝트 관리 데이터베이스
-- =========================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------
-- 1. 창업 프로젝트
-- ---------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  title text not null default '새 창업 프로젝트',

  status text not null default 'draft'
    check (
      status in (
        'draft',
        'recommended',
        'selected',
        'analyzed',
        'forecasted'
      )
    ),

  profile jsonb not null default '{}'::jsonb,
  selected_idea jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx
  on public.projects(user_id);

create index if not exists projects_updated_at_idx
  on public.projects(updated_at desc);


-- ---------------------------------------------------------
-- 2. AI 추천 결과
-- ---------------------------------------------------------
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.projects(id)
    on delete cascade,

  ideas jsonb not null,

  created_at timestamptz not null default now()
);

create index if not exists recommendations_project_id_idx
  on public.recommendations(project_id);


-- ---------------------------------------------------------
-- 3. AI 심층 분석 결과
-- ---------------------------------------------------------
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.projects(id)
    on delete cascade,

  scores jsonb not null default '{}'::jsonb,
  sections jsonb not null default '{}'::jsonb,
  summary text,

  created_at timestamptz not null default now()
);

create index if not exists analyses_project_id_idx
  on public.analyses(project_id);


-- ---------------------------------------------------------
-- 4. 경제 환경 전망
-- 추후 기능 확장을 위해 미리 생성
-- ---------------------------------------------------------
create table if not exists public.forecasts (
  id uuid primary key default gen_random_uuid(),

  project_id uuid not null
    references public.projects(id)
    on delete cascade,

  economic_factors jsonb not null default '[]'::jsonb,
  outlook jsonb not null default '{}'::jsonb,
  scenarios jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists forecasts_project_id_idx
  on public.forecasts(project_id);


-- ---------------------------------------------------------
-- 5. updated_at 자동 갱신
-- ---------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_projects_updated_at
  on public.projects;

create trigger update_projects_updated_at
before update on public.projects
for each row
execute function public.update_updated_at_column();


-- =========================================================
-- Row Level Security
-- 각 사용자는 자신의 프로젝트만 접근 가능
-- =========================================================

alter table public.projects enable row level security;
alter table public.recommendations enable row level security;
alter table public.analyses enable row level security;
alter table public.forecasts enable row level security;


-- ---------------------------------------------------------
-- projects 정책
-- ---------------------------------------------------------
drop policy if exists "Users can view own projects"
  on public.projects;

create policy "Users can view own projects"
on public.projects
for select
to authenticated
using (auth.uid() = user_id);


drop policy if exists "Users can create own projects"
  on public.projects;

create policy "Users can create own projects"
on public.projects
for insert
to authenticated
with check (auth.uid() = user_id);


drop policy if exists "Users can update own projects"
  on public.projects;

create policy "Users can update own projects"
on public.projects
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


drop policy if exists "Users can delete own projects"
  on public.projects;

create policy "Users can delete own projects"
on public.projects
for delete
to authenticated
using (auth.uid() = user_id);


-- ---------------------------------------------------------
-- recommendations 정책
-- ---------------------------------------------------------
drop policy if exists "Users can view own recommendations"
  on public.recommendations;

create policy "Users can view own recommendations"
on public.recommendations
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = recommendations.project_id
      and projects.user_id = auth.uid()
  )
);


drop policy if exists "Users can create own recommendations"
  on public.recommendations;

create policy "Users can create own recommendations"
on public.recommendations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects
    where projects.id = recommendations.project_id
      and projects.user_id = auth.uid()
  )
);


drop policy if exists "Users can delete own recommendations"
  on public.recommendations;

create policy "Users can delete own recommendations"
on public.recommendations
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = recommendations.project_id
      and projects.user_id = auth.uid()
  )
);


-- ---------------------------------------------------------
-- analyses 정책
-- ---------------------------------------------------------
drop policy if exists "Users can view own analyses"
  on public.analyses;

create policy "Users can view own analyses"
on public.analyses
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = analyses.project_id
      and projects.user_id = auth.uid()
  )
);


drop policy if exists "Users can create own analyses"
  on public.analyses;

create policy "Users can create own analyses"
on public.analyses
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects
    where projects.id = analyses.project_id
      and projects.user_id = auth.uid()
  )
);


drop policy if exists "Users can delete own analyses"
  on public.analyses;

create policy "Users can delete own analyses"
on public.analyses
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = analyses.project_id
      and projects.user_id = auth.uid()
  )
);


-- ---------------------------------------------------------
-- forecasts 정책
-- ---------------------------------------------------------
drop policy if exists "Users can view own forecasts"
  on public.forecasts;

create policy "Users can view own forecasts"
on public.forecasts
for select
to authenticated
using (
  exists (
    select 1
    from public.projects
    where projects.id = forecasts.project_id
      and projects.user_id = auth.uid()
  )
);


drop policy if exists "Users can create own forecasts"
  on public.forecasts;

create policy "Users can create own forecasts"
on public.forecasts
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects
    where projects.id = forecasts.project_id
      and projects.user_id = auth.uid()
  )
);


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