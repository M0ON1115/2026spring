-- =========================================================
-- KU STARTUP PLANNER
-- 시장 검증 단계 도입에 따른 projects.status 허용값 확장
-- =========================================================
--
-- 현재 프론트엔드는 Supabase 호환성을 위해 projects.status에는
-- 기존 단계(draft/recommended/selected/analyzed/forecasted)만 저장하고,
-- 시장 검증 진행 상태는 selected_idea.validationChecklist에서 계산합니다.
--
-- 아래 migration은 향후 DB 레벨에서도 시장 검증 단계를 직접 status로
-- 저장할 수 있도록 check constraint를 확장하는 선택적 안전장치입니다.

alter table public.projects
drop constraint if exists projects_status_check;

alter table public.projects
add constraint projects_status_check
check (
  status in (
    'draft',
    'recommended',
    'selected',
    'analyzed',
    'forecasted',
    'validating',
    'validated',
    'mvp',
    'mvp_validated'
  )
);
