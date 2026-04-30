import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const scoreSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    scores: {
      type: "object",
      additionalProperties: false,
      properties: {
        "사용자 적합성": { type: "number", minimum: 0, maximum: 100 },
        "실행 가능성": { type: "number", minimum: 0, maximum: 100 },
        "시장성": { type: "number", minimum: 0, maximum: 100 },
        "수익성": { type: "number", minimum: 0, maximum: 100 },
        "차별성": { type: "number", minimum: 0, maximum: 100 },
        "확장성": { type: "number", minimum: 0, maximum: 100 },
        "리스크 안정성": { type: "number", minimum: 0, maximum: 100 }
      },
      required: [
        "사용자 적합성",
        "실행 가능성",
        "시장성",
        "수익성",
        "차별성",
        "확장성",
        "리스크 안정성"
      ]
    }
  },
  required: ["scores"]
};

const sectionPrompts = {
  market: {
    title: "시장 전망",
    prompt:
      "이 창업 아이템의 시장 전망을 분석하세요. 실제 수요 가능성, 초기 검증 방법, 성장 가능성을 중심으로 4~6문장으로 작성하세요."
  },
  customer: {
    title: "고객 분석",
    prompt:
      "이 창업 아이템의 핵심 고객을 분석하세요. 고객이 겪는 문제, 지불 가능성, 접근 가능한 초기 고객층을 중심으로 4~6문장으로 작성하세요."
  },
  competition: {
    title: "경쟁 분석",
    prompt:
      "이 창업 아이템의 경쟁 상황을 분석하세요. 기존 대체재, 차별화 포인트, 모방 가능성을 중심으로 4~6문장으로 작성하세요."
  },
  revenue: {
    title: "수익 모델 분석",
    prompt:
      "이 창업 아이템의 수익 모델을 분석하세요. 초기 수익화 방식, 가격 전략, 반복 매출 가능성을 중심으로 4~6문장으로 작성하세요."
  },
  mvp: {
    title: "초기 실행 계획",
    prompt:
      "이 창업 아이템의 MVP 실행 계획을 제안하세요. 첫 2주 안에 할 수 있는 검증, 필요한 기능, 테스트 고객 모집 방법을 중심으로 4~6문장으로 작성하세요."
  },
  risk: {
    title: "리스크 및 대응 방안",
    prompt:
      "이 창업 아이템의 주요 리스크와 대응 방안을 분석하세요. 수요 부족, 차별화 실패, 운영 부담, AI 신뢰성 문제를 중심으로 4~6문장으로 작성하세요."
  },
  growth: {
    title: "향후 발전 가능성",
    prompt:
      "이 창업 아이템의 향후 발전 가능성을 분석하세요. 기능 확장, 고객층 확장, B2B 가능성, 플랫폼화 가능성을 중심으로 4~6문장으로 작성하세요."
  }
};

function clampScore(value, fallback = 75) {
  const score = Number(value);
  return Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.round(score)))
    : fallback;
}

function normalizeScores(scores = {}) {
  const base = {
    "사용자 적합성": 75,
    "실행 가능성": 75,
    "시장성": 75,
    "수익성": 75,
    "차별성": 75,
    "확장성": 75,
    "리스크 안정성": 75
  };

  Object.keys(base).forEach((key) => {
    base[key] = clampScore(scores[key], base[key]);
  });

  return base;
}

function getAverageScore(scores) {
  return Math.round(
    Object.values(scores).reduce((sum, value) => sum + value, 0) /
      Object.keys(scores).length
  );
}

function getContext(profile, idea) {
  return `
사용자 정보:
- 제1전공: ${profile.primaryMajorText}
- 제2전공: ${profile.secondaryMajorText}
- 보유 자격증: ${profile.certificates?.join(", ")}
- 관심 분야: ${profile.interests}
- 창업 목적: ${profile.goal}
- 초기 자본: ${profile.budgetText} (${profile.budgetWonText})
- 투입 가능 시간: ${profile.timeText}
- 선호 창업 유형: ${profile.businessType}
- 관심 고객층: ${profile.target}
- 피하고 싶은 분야/제약 조건: ${profile.avoid || "없음"}

선택 아이템:
- 아이템명: ${idea.name}
- 설명: ${idea.summary}
- 목표 고객: ${idea.customer}
- 해결 문제: ${idea.problem}
- 수익 모델: ${idea.revenue}
- 추천 이유: ${idea.reason}
- 추천 근거: ${idea.reasons?.join(", ")}
- 추천 적합도: ${idea.fitScore}점
- 난이도: ${idea.difficulty}
- 예상 초기 비용: ${idea.cost}
`;
}

function extractText(response) {
  if (response.status === "incomplete") {
    throw new Error(
      `OpenAI 응답이 중간에 잘렸습니다. reason: ${
        response.incomplete_details?.reason || "unknown"
      }`
    );
  }

  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }

  throw new Error("OpenAI 응답에 output_text가 없습니다.");
}

async function createScores(profile, idea) {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    instructions:
      "당신은 창업 아이템을 평가하는 심사역입니다. 사용자의 전공, 자격증, 자본, 시간 제약을 반영해 점수를 매기세요. 반드시 json 객체만 반환하세요.",
    input: `
${getContext(profile, idea)}

요청:
아래 7개 항목을 0~100점으로 평가하세요.
- 사용자 적합성
- 실행 가능성
- 시장성
- 수익성
- 차별성
- 확장성
- 리스크 안정성

반환 형식은 반드시 json 객체여야 합니다.
`,
    text: {
      format: {
        type: "json_schema",
        name: "startup_scores",
        strict: true,
        schema: scoreSchema
      }
    },
    max_output_tokens: 600
  });

  const text = extractText(response);
  const parsed = JSON.parse(text);

  return normalizeScores(parsed.scores);
}

async function createSection(profile, idea, sectionKey, sectionConfig) {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    instructions:
      "당신은 창업 아이템을 분석하는 전문 컨설턴트입니다. 한국어로 작성하세요. 과장하지 말고, 사용자의 조건과 선택 아이템을 근거로 실용적으로 분석하세요. JSON을 반환하지 말고 일반 텍스트만 반환하세요.",
    input: `
${getContext(profile, idea)}

분석 항목:
${sectionConfig.title}

요청:
${sectionConfig.prompt}

작성 규칙:
- 제목은 쓰지 마세요.
- 목록 대신 자연스러운 문단으로 작성하세요.
- 4~6문장으로 작성하세요.
- 사용자의 자본과 투입 가능 시간을 반드시 반영하세요.
`,
    max_output_tokens: 700
  });

  return extractText(response);
}

async function createSummary(profile, idea, scores, sections) {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    instructions:
      "당신은 창업 아이템 분석 결과를 요약하는 컨설턴트입니다. 한국어로 작성하세요. JSON을 반환하지 말고 일반 텍스트만 반환하세요.",
    input: `
사용자 제1전공: ${profile.primaryMajorText}
창업 아이템: ${idea.name}
종합 점수: ${getAverageScore(scores)}점

점수:
${Object.entries(scores)
  .map(([key, value]) => `- ${key}: ${value}점`)
  .join("\n")}

분석 요약 자료:
- 시장 전망: ${sections.market}
- 고객 분석: ${sections.customer}
- 리스크: ${sections.risk}

요청:
이 아이템의 종합 평가를 3~4문장으로 요약하세요.
`,
    max_output_tokens: 500
  });

  return extractText(response);
}

async function createFullAnalysis(profile, idea) {
  const scores = await createScores(profile, idea);

  const sectionEntries = await Promise.all(
    Object.entries(sectionPrompts).map(async ([key, config]) => {
      const value = await createSection(profile, idea, key, config);
      return [key, value];
    })
  );

  const sections = Object.fromEntries(sectionEntries);
  const summary = await createSummary(profile, idea, scores, sections);

  return {
    scores,
    sections,
    summary
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  try {
    const { profile, idea } = req.body || {};

    if (!profile || !idea) {
      return res.status(400).json({
        error: "profile 또는 idea 데이터가 없습니다."
      });
    }

    const result = await createFullAnalysis(profile, idea);

    return res.status(200).json(result);
  } catch (error) {
    console.error("analyze error:", error);

    return res.status(500).json({
      error: error.message || "분석 생성 중 오류가 발생했습니다."
    });
  }
}
