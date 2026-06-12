# KU STARTUP PLANNER

> **개인의 조건을 반영해 실행 가능한 창업 아이템을 추천하고,  
> AI 심층 분석과 최신 경제 동향을 연결하여 하나의 창업 프로젝트로 발전시키는 서비스**

![Status](https://img.shields.io/badge/status-in%20development-862633)
![Frontend](https://img.shields.io/badge/frontend-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-0f172a)
![Backend](https://img.shields.io/badge/backend-Vercel%20Serverless-111827)
![Database](https://img.shields.io/badge/database-Supabase-3ecf8e)
![AI](https://img.shields.io/badge/AI-OpenAI%20Responses%20API-412991)

---

## 1. 프로젝트 소개

**KU STARTUP PLANNER**는 사용자의 전공, 자격증, 관심 분야, 초기 자본, 투입 가능 시간과 운영 제약을 분석하여 현실적인 창업 아이템을 추천하는 AI 기반 창업 기획 서비스입니다.

단순한 아이디어 생성에 그치지 않고, 선택한 아이템을 하나의 프로젝트로 저장하여 아래 흐름으로 관리할 수 있습니다.

```text
개인 조건 입력
→ AI 창업 아이템 추천
→ 아이템 선택
→ 기본 분석
→ 창업 계획 초안 생성
→ 최신 경제 동향 분석
→ 프로젝트 저장 및 사후 관리
```

---

## 2. 핵심 기능

### 2.1 개인 조건 기반 창업 아이템 추천

사용자는 아래 정보를 입력할 수 있습니다.

| 입력 항목 | 설명 |
|---|---|
| 제1전공 | 단과대학 및 학과·학부 선택 |
| 제2전공 | 선택 입력 |
| 자격증 | 체크리스트 방식 다중 선택 |
| 관심 분야 | AI, 교육, 콘텐츠 등 자유 입력 |
| 창업 목적 | 수익 창출, 포트폴리오 제작, 사회문제 해결 등 |
| 초기 자본 | 만원 단위 입력 |
| 투입 가능 시간 | 주당 시간 단위 입력 |
| 선호 창업 유형 | 온라인 서비스, 콘텐츠 기반, 교육 서비스 등 |
| 관심 고객층 | 대학생, 직장인, 소상공인 등 |
| 제약 조건 | 피하고 싶은 분야 또는 운영 방식 |

AI는 입력값을 바탕으로 여러 개의 창업 아이템을 생성합니다.

각 추천 카드에는 다음 정보가 포함됩니다.

```text
- 아이템명
- 한 줄 설명
- 핵심 고객
- 해결하려는 문제
- 수익 모델
- 추천 이유
- 실행 난이도
- 예상 초기 비용
```

---

### 2.2 아이템 기본 분석

사용자가 추천 아이템을 선택하면 별도의 워크스페이스가 열립니다.

#### 정량 평가

```text
- 사용자 적합성
- 실행 가능성
- 시장성
- 수익성
- 차별성
- 확장성
- 리스크 안정성
```

각 항목은 점수와 진행 막대로 시각화됩니다.

#### 정성 평가

```text
- 시장 전망
- 고객 분석
- 경쟁 분석
- 수익 모델
- 초기 실행 계획
- 리스크 및 대응 방안
- 향후 발전 가능성
```

---

### 2.3 창업 계획 초안 자동 생성

기본 분석 결과를 바탕으로 초기 사업 계획 초안을 생성합니다.

```text
1. 사업 개요
2. 창업자 조건
3. 핵심 고객과 해결 문제
4. 시장성 분석
5. 경쟁 분석
6. 수익 모델
7. MVP 계획
8. 리스크 대응
9. 종합 결론
```

생성된 초안은 복사하여 다른 문서에서 활용할 수 있습니다.

---

### 2.4 최신 경제 동향 기반 전망 분석

선택한 아이템의 외부 환경을 최신 공개 자료를 기반으로 분석합니다.

기본 분석과 분리된 별도 탭에서 실행됩니다.

```text
기본 분석 탭
→ 고객, 경쟁, 수익 모델, MVP, 리스크 분석

최신 경제 동향 탭
→ 최근 공개 자료 검색
→ 산업 변화 분석
→ 경제 변수 분석
→ 단기·중기·장기 전망
→ 시나리오별 대응 전략
→ 참고 자료 링크 제공
```

#### 분석 결과 구성

```text
- 최근 시장 동향 요약
- 핵심 경제·산업 변수
- 시점별 전망
  - 단기: 향후 6개월
  - 중기: 향후 1~2년
  - 장기: 향후 3년 이상
- 낙관적 시나리오
- 기준 시나리오
- 비관적 시나리오
- 추천 대응 행동
- 참고 자료 링크
```

#### 경제 변수 카드 예시

```text
대학생 생성형 AI 활용률

대학생 과제 및 글쓰기에 생성형 AI 활용이 보편화되어
시장 수요 형성에 유의미한 영향을 미침

방향: (+) 긍정적 증가 추세이며,
서비스 수요 기반으로 작용함
```

#### 방향 표시 규칙

| 표시 | 의미 |
|---|---|
| `(+)` | 긍정적 영향 |
| `(-)` | 부정적 영향 |
| `(±)` | 긍정·부정 요소가 함께 존재 |
| `(?)` | 방향 판단이 어려움 |

---

### 2.5 경제 전망 백그라운드 처리

경제 전망 분석은 일반 추천보다 시간이 오래 걸릴 수 있습니다.

브라우저가 하나의 요청을 계속 기다리지 않도록, 작업을 시작한 뒤 상태를 주기적으로 확인하는 구조를 적용했습니다.

```text
사용자 요청
→ POST /api/forecast/start
→ OpenAI background 작업 시작
→ responseId 반환
→ 프론트엔드가 일정 간격으로 상태 확인
→ POST /api/forecast/status
→ 완료 시 결과 렌더링
```

분석 중에는 아래 메시지가 순차적으로 표시됩니다.

```text
최신 공개 자료를 검색하는 중입니다...
관련 산업 동향을 정리하는 중입니다...
경제 변수와 시나리오를 분석하는 중입니다...
출처와 대응 전략을 정리하는 중입니다...
```

---

### 2.6 로그인 및 프로젝트 저장

Google 계정으로 로그인한 사용자는 분석 결과를 프로젝트 단위로 저장할 수 있습니다.

```text
- 사용자 입력 조건 저장
- 추천 아이템 저장
- 선택한 아이템 저장
- 기본 분석 결과 저장
- 경제 전망 결과 저장
- 최근 수정 시각 저장
- 프로젝트 불러오기
- 프로젝트 삭제
```

저장된 프로젝트를 다시 열면 기존 분석 결과와 창업 계획 초안을 이어서 확인할 수 있습니다.

---

### 2.7 프로젝트 진행률

프로젝트 대시보드에서 현재 진행 상태를 확인할 수 있습니다.

```text
25%  추천 아이템 생성
40%  아이템 선택
60%  기본 분석 완료
75%  최신 경제 전망 완료
```

향후 시장 검증 체크리스트와 MVP 실행 단계까지 연결하여 100% 구조로 확장할 예정입니다.

---

## 3. 기술 스택

### Frontend

![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=111827)

### Backend

![Vercel](https://img.shields.io/badge/Vercel-Serverless%20Functions-000000?logo=vercel&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-Responses%20API-412991)

### Database and Authentication

![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%7C%20Auth-3ECF8E?logo=supabase&logoColor=white)
![Google](https://img.shields.io/badge/Google-OAuth-4285F4?logo=google&logoColor=white)

### Deployment

![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?logo=vercel&logoColor=white)

---

## 4. 프로젝트 구조

```text
2026spring/
├─ index.html
│
├─ css/
│  └─ styles.css
│
├─ js/
│  ├─ config.js
│  ├─ data.js
│  ├─ state.js
│  ├─ utils.js
│  ├─ auth.js
│  ├─ form.js
│  ├─ recommendations.js
│  ├─ analysis.js
│  ├─ forecast.js
│  ├─ projects.js
│  └─ app.js
│
├─ api/
│  ├─ recommend.js
│  ├─ analyze.js
│  ├─ forecast.js
│  │
│  └─ forecast/
│     ├─ start.js
│     └─ status.js
│
├─ lib/
│  └─ forecast-background.js
│
├─ supabase/
│  ├─ config.toml
│  └─ migrations/
│     ├─ 20260611144325_create_startup_planner_tables.sql
│     └─ 20260611163437_upgrade_forecasts_for_live_data.sql
│
├─ package.json
└─ README.md
```

---

## 5. 파일별 역할

| 파일 | 역할 |
|---|---|
| `index.html` | 전체 화면 구조 |
| `css/styles.css` | 공통 디자인 |
| `js/config.js` | Supabase 설정 |
| `js/data.js` | 전공 및 자격증 데이터 |
| `js/state.js` | 프론트엔드 상태 관리 |
| `js/utils.js` | 공통 함수 |
| `js/auth.js` | 로그인 및 로그아웃 |
| `js/form.js` | 입력 폼 렌더링 |
| `js/recommendations.js` | 창업 아이템 추천 |
| `js/analysis.js` | 기본 분석 및 계획 초안 |
| `js/forecast.js` | 경제 전망 요청, 결과 렌더링, 캐시 |
| `js/projects.js` | 프로젝트 저장·조회·삭제 |
| `js/app.js` | 초기화 및 이벤트 연결 |
| `api/recommend.js` | 추천 API |
| `api/analyze.js` | 기본 분석 API |
| `api/forecast.js` | 기존 동기식 전망 API |
| `api/forecast/start.js` | 백그라운드 전망 작업 시작 |
| `api/forecast/status.js` | 백그라운드 전망 상태 확인 |
| `lib/forecast-background.js` | 웹 검색 및 구조화 공통 로직 |

---

## 6. 데이터베이스 구조

### `projects`

사용자별 창업 프로젝트 기본 상태를 저장합니다.

```text
- user_id
- title
- status
- profile
- selected_idea
- created_at
- updated_at
```

### `recommendations`

추천 아이템 목록을 저장합니다.

```text
- project_id
- ideas
- created_at
```

### `analyses`

아이템 기본 분석 결과를 저장합니다.

```text
- project_id
- scores
- sections
- summary
- created_at
```

### `forecasts`

경제 전망 분석 결과를 저장합니다.

```text
- project_id
- economic_factors
- outlook
- scenarios
- actions
- trend_summary
- sources
- data_snapshot
- fetched_at
- model_used
- created_at
```

---

## 7. 현재 개발 상태

### 구현 완료

- [x] 사용자 조건 입력
- [x] 전공 및 자격증 선택
- [x] AI 창업 아이템 추천
- [x] 추천 아이템 선택
- [x] 아이템 기본 분석
- [x] 창업 계획 초안 생성
- [x] Google 로그인
- [x] Supabase 프로젝트 저장
- [x] 프로젝트 불러오기
- [x] 프로젝트 삭제
- [x] 프로젝트 진행률 표시
- [x] 기본 분석과 경제 전망 탭 분리
- [x] 최신 공개 자료 기반 경제 전망 분석
- [x] 경제 전망 백그라운드 처리
- [x] 경제 전망 로딩 상태 표시
- [x] 경제 전망 결과 저장
- [x] 경제 전망 참고 자료 링크 표시
- [x] 프론트엔드 모듈화

### 검증 필요

- [ ] Preview 배포와 Production 배포의 파일 일치 여부
- [ ] 경제 전망 변수 카드의 최종 UI 표시
- [ ] 방향 부호 표시의 정확성
- [ ] 참고 자료 제목 정제 결과
- [ ] 참고 자료 중복 제거
- [ ] 저장된 경제 전망 결과 재호출 시 렌더링 일관성
- [ ] 장시간 백그라운드 작업 안정성

---

## 8. API 흐름

### 추천 API

```text
POST /api/recommend
```

```text
사용자 조건
→ 추천 아이템 목록
```

### 기본 분석 API

```text
POST /api/analyze
```

```text
선택 아이템
→ 점수
→ 시장 분석
→ 고객 분석
→ 경쟁 분석
→ 수익 모델
→ MVP 계획
→ 리스크
```

### 경제 전망 API

```text
POST /api/forecast/start
```

```text
선택 아이템
→ background 작업 시작
→ responseId 반환
```

```text
POST /api/forecast/status
```

```text
responseId
→ queued
→ in_progress
→ completed
→ 전망 결과 반환
```

---

## 9. 대표 사용자 흐름

```text
1. Google 계정 로그인
2. 전공, 자격증, 자본, 시간 입력
3. AI 창업 아이템 추천 요청
4. 추천 아이템 중 하나 선택
5. 기본 분석 결과 확인
6. 창업 계획 초안 생성
7. 최신 경제 동향 탭 이동
8. 경제 전망 분석 시작
9. 산업 변수와 시나리오 확인
10. 참고 자료 원문 확인
11. 프로젝트 저장
12. 이후 다시 로그인하여 프로젝트 이어하기
```

---

## 10. 앞으로의 과제

---

### P1. 시장 검증 체크리스트

- [ ] 고객 인터뷰 목표 설정
- [ ] 설문조사 진행 여부 기록
- [ ] 경쟁 서비스 조사 기록
- [ ] 랜딩 페이지 제작 여부
- [ ] MVP 제작 여부
- [ ] 첫 사용자 확보 여부
- [ ] 첫 결제 발생 여부

#### 목표 진행률 구조

```text
25%  추천 완료
40%  아이템 선택
60%  기본 분석
75%  경제 전망
85%  시장 검증 시작
100% MVP 검증 완료
```

---

### P2. 프로젝트 메모 및 수정 이력

- [ ] 프로젝트별 메모 작성
- [ ] 분석 결과 수정 이력
- [ ] 경제 전망 분석 시각 기록
- [ ] 이전 전망과 최신 전망 비교
- [ ] 아이템 방향 전환 기록

---

### P3. 경제 전망 고도화

- [ ] 동일 아이템의 24시간 이내 전망 캐시 재사용
- [ ] 강제 새로고침 버튼
- [ ] 관련성이 낮은 출처 자동 제외
- [ ] 공식 기관 자료 우선순위 강화
- [ ] 참고 자료 제목 정제
- [ ] 중복 URL 제거
- [ ] 분석 실패 시 부분 결과 저장
- [ ] 구조화 단계만 제한적으로 재시도

---

### P4. 계획서 편집 및 출력

- [ ] 계획서 직접 수정
- [ ] 자동 저장
- [ ] Markdown 다운로드
- [ ] PDF 다운로드
- [ ] 발표용 요약 생성
- [ ] 투자자용 1페이지 요약

---

### P5. 사용자 경험 개선

- [ ] 모바일 화면 최적화
- [ ] 빈 상태 화면 개선
- [ ] 로딩 단계 시각화
- [ ] 분석 실패 후 재시도 버튼
- [ ] 저장 완료 안내 개선
- [ ] 프로젝트 검색 및 정렬
- [ ] 최근 수정 프로젝트 우선 표시

---

## 11. 핵심 차별점

### 개인 조건 기반 추천

일반적인 아이디어 생성이 아니라 사용자의 전공, 경험, 자본과 시간을 함께 반영합니다.

### 단계형 워크스페이스

추천 결과에서 끝나지 않고 기본 분석, 계획 초안, 경제 전망까지 연결합니다.

### 최신 경제 동향 연결

정적인 템플릿이 아니라 최신 공개 자료를 검색하여 외부 환경을 반영합니다.

### 프로젝트 단위 저장

한 번 추천받고 끝나는 서비스가 아니라, 하나의 창업 프로젝트를 장기적으로 발전시키는 구조입니다.

---


