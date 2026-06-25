# 2024130871 신희문

# KU STARTUP PLANNER

[https://www.m0on1115.com](https://www.m0on1115.com/)

> **개인의 조건을 반영해 실행 가능한 창업 아이템을 추천하고, AI 기본 분석·최신 경제 동향·시장 검증 기록까지 하나의 프로젝트로 관리하는 창업 기획 워크스페이스**

![Status](https://img.shields.io/badge/status-active-862633)
![Frontend](https://img.shields.io/badge/frontend-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-0f172a)
![Backend](https://img.shields.io/badge/backend-Vercel%20Serverless-111827)
![Database](https://img.shields.io/badge/database-Supabase-3ecf8e)
![AI](https://img.shields.io/badge/AI-OpenAI%20Responses%20API-412991)

---

## 1. 프로젝트 소개

**KU STARTUP PLANNER**는 사용자의 전공, 자격증, 관심 분야, 초기 자본, 투입 가능 시간과 운영 제약을 분석하여 현실적인 창업 아이템을 추천하는 AI 기반 창업 기획 서비스입니다.

단순한 아이디어 생성에서 끝나지 않고, 선택한 아이템을 하나의 프로젝트로 저장하여 기본 분석, 경제 전망, 시장 검증 체크리스트, 프로젝트 메모, 검증 기록과 자동 변경 이력까지 이어서 관리할 수 있습니다.

```text
개인 조건 입력
→ AI 창업 아이템 추천
→ 아이템 선택
→ 기본 분석
→ 창업 계획 초안 생성
→ 최신 경제 동향 분석
→ 시장 검증 체크리스트
→ 프로젝트 메모 및 검증 기록 관리
→ 프로젝트 저장 및 재호출
```

---

## 2. 핵심 기능

### 2.1 개인 조건 기반 창업 아이템 추천

사용자는 아래 정보를 입력합니다.

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

선택한 창업 아이템을 정량·정성 관점에서 분석합니다.

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

#### 정성 평가

```text
- 시장 전망
- 고객 분석
- 경쟁 분석
- 수익 모델
- 초기 실행 계획
- 리스크 및 대응 방안
- 발전 가능성
```

---

### 2.3 창업 계획 초안 생성

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

---

### 2.4 최신 경제 동향 기반 전망 분석

선택한 아이템의 외부 환경을 최신 공개 자료 기반으로 분석합니다.

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
- 단기 전망: 향후 6개월
- 중기 전망: 향후 1~2년
- 장기 전망: 향후 3년 이상
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

| 표시 | 의미 |
|---|---|
| `(+)` | 긍정적 영향 |
| `(-)` | 부정적 영향 |
| `(±)` | 긍정·부정 요소가 함께 존재 |
| `(?)` | 방향 판단이 어려움 |

---

### 2.5 경제 전망 백그라운드 처리

경제 전망 분석은 시간이 오래 걸릴 수 있으므로, 요청 시작과 상태 확인을 분리한 polling 구조를 사용합니다.

```text
사용자 요청
→ POST /api/forecast/start
→ OpenAI background 작업 시작
→ responseId 반환
→ 프론트엔드가 일정 간격으로 상태 확인
→ POST /api/forecast/status
→ 완료 시 결과 렌더링
```

---

### 2.6 시장 검증 체크리스트

아이디어 추천과 AI 분석 이후, 실제 시장 검증 단계로 넘어가기 위한 체크리스트를 제공합니다.

```text
[ ] 고객 인터뷰 목표 설정
[ ] 설문조사 진행 여부 기록
[ ] 경쟁 서비스 조사 기록
[ ] 랜딩 페이지 제작 여부
[ ] MVP 제작 여부
[ ] 첫 사용자 확보 여부
[ ] 첫 결제 발생 여부
```

각 체크리스트 항목에는 다음 정보를 함께 기록할 수 있습니다.

```text
- 완료 여부
- 항목별 검증 메모
- 검증 날짜
```

모든 항목을 완료하면 다음 메시지가 표시됩니다.

```text
모든 과제를 완료하셨습니다. 행운을 빕니다!
```

---

### 2.7 프로젝트 메모 및 검증 기록

시장 검증 과정에서 확인한 내용을 프로젝트 단위로 기록할 수 있습니다.

```text
- 프로젝트 전체 메모
- 체크리스트 항목별 메모
- 검증 날짜
- 검증 기록 직접 추가
- 고객 인터뷰, 설문조사, 경쟁 조사, 아이디어 수정 등 활동별 기록 관리
- 체크리스트 변경, 메모 수정, 날짜 변경의 자동 변경 이력
- 분석 기록 요약
```

사용자는 시장 검증 탭에서 체크리스트를 완료하면서 각 항목에 메모와 날짜를 남길 수 있습니다. 별도의 검증 기록 영역에서는 인터뷰 결과, 설문조사 내용, 경쟁 서비스 조사, 아이템 수정 방향 등을 기록 단위로 추가하여 시간순으로 관리할 수 있습니다.

자동 변경 이력은 체크리스트 완료 상태, 항목별 메모, 검증 날짜, 프로젝트 메모가 바뀐 경우에 남는 내부 활동 로그입니다. 사용자가 직접 정리해야 하는 검증 결과는 별도의 검증 기록으로 추가합니다.

---

### 2.8 로그인 및 프로젝트 저장

Google 계정으로 로그인한 사용자는 분석 결과를 프로젝트 단위로 저장할 수 있습니다.

```text
- 사용자 입력 조건 저장
- 추천 아이템 저장
- 선택한 아이템 저장
- 기본 분석 결과 저장
- 경제 전망 결과 저장
- 시장 검증 체크리스트 저장
- 체크리스트 항목별 메모 저장
- 프로젝트 메모 저장
- 검증 기록 저장
- 자동 변경 이력 저장
- 프로젝트 불러오기
- 프로젝트 삭제
```

---

### 2.9 프로젝트 진행률

프로젝트 진행 상태는 단계별로 계산됩니다.

```text
25%  추천 아이템 생성
40%  아이템 선택
60%  기본 분석 완료
75%  최신 경제 전망 완료
85%  시장 검증 진행 중
100% 시장 검증 완료
```

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
| `js/app.js` | 초기화, 이벤트 연결, 시장 검증 UI 확장 |
| `api/recommend.js` | 추천 API |
| `api/analyze.js` | 기본 분석 API |
| `api/forecast.js` | 기존 동기식 전망 API |
| `api/forecast/start.js` | 백그라운드 전망 작업 시작 |
| `api/forecast/status.js` | 백그라운드 전망 상태 확인 |
| `lib/forecast-background.js` | 웹 검색 및 구조화 공통 로직 |

---

## 6. 데이터 저장 구조

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

시장 검증 데이터는 DB constraint 충돌을 피하기 위해 `selected_idea` 내부에 함께 저장됩니다.

```json
{
  "validationChecklist": {},
  "validationNotes": {},
  "projectMemo": "",
  "validationLogs": [],
  "validationHistory": []
}
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

## 7. API 흐름

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

## 8. 구현 완료 기능

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
- [x] 시장 검증 체크리스트
- [x] 체크리스트 완료 메시지
- [x] 체크리스트 항목별 메모
- [x] 체크리스트 항목별 날짜 기록
- [x] 프로젝트 전체 메모
- [x] 수정 이력 자동 기록
- [x] 분석 기록 요약
- [x] 프론트엔드 모듈화

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
10. 시장 검증 탭 이동
11. 검증 체크리스트 완료 여부 기록
12. 항목별 검증 메모와 날짜 입력
13. 프로젝트 전체 메모 작성
14. 수정 이력 확인
15. 프로젝트 저장
16. 이후 다시 로그인하여 프로젝트 이어하기
```

---

## 10. 핵심 차별점

### 개인 조건 기반 추천

일반적인 아이디어 생성이 아니라 사용자의 전공, 경험, 자본과 시간을 함께 반영합니다.

### 단계형 워크스페이스

추천 결과에서 끝나지 않고 기본 분석, 계획 초안, 경제 전망, 시장 검증까지 연결합니다.

### 최신 경제 동향 연결

정적인 템플릿이 아니라 최신 공개 자료를 검색하여 외부 환경을 반영합니다.

### 실행 중심 시장 검증

체크리스트, 항목별 메모, 날짜 기록, 수정 이력을 통해 아이디어를 실제 검증 과정으로 연결합니다.

### 프로젝트 단위 저장

한 번 추천받고 끝나는 서비스가 아니라, 하나의 창업 프로젝트를 장기적으로 발전시키는 구조입니다.

---

## 11. 포트폴리오 소개 문장

> **KU STARTUP PLANNER**는 사용자의 전공, 경험, 자본과 시간을 기반으로 실행 가능한 창업 아이템을 추천하고, AI 기본 분석·최신 경제 동향·시장 검증 기록을 연결하여 하나의 창업 프로젝트로 발전시키는 서비스입니다.
