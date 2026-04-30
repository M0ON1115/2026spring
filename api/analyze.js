import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    scores: {
      type: "object",
      additionalProperties: false,
      properties: {
        "사용자 적합성": {
          type: "number",
          minimum: 0,
          maximum: 100
        },
        "실행 가능성": {
          type: "number",
          minimum: 0,
          maximum: 100
        },
        "시장성": {
          type: "number",
          minimum: 0,
          maximum: 100
        },
        "수익성": {
          type: "number",
          minimum: 0,
          maximum: 100
        },
        "차별성": {
          type: "number",
          minimum: 0,
          maximum: 100
        },
        "확장성": {
          type: "number",
          minimum: 0,
          maximum: 100
        },
        "리스크 안정성": {
          type: "number",
          minimum: 0,
          maximum: 100
        }
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
    },
    sections: {
      type: "object",
      additionalProperties: false,
      properties: {
        market: { type: "string" },
        customer: { type: "string" },
        competition: { type: "string" },
        revenue: { type: "string" },
        mvp: { type: "string" },
        risk: { type: "string" },
        growth: { type: "string" }
      },
      required: [
        "market",
        "customer",
        "competition",
        "revenue",
        "mvp",
        "risk",
        "growth"
      ]
    },
    summary: { type: "string" }
  },
  required: ["scores", "sections", "summary"]
};

function parseOutput(response) {
  if (!response.output_text) {
    throw new Error("OpenAI 응답에 output_text가 없습니다.");
  }

  return JSON.parse(response.output_text);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  try {
    const { profile, idea } = req.body;

    if (!profile || !idea) {
      return res.status(400).json({ error: "profile 또는 idea 데이터가 없습니다." });
    }

    const instructions =
      "당신은 창업 아이템의 시장성, 실행 가능성, 수익성, 리스크를 평가하는 창업 심사역입니다. " +
      "사용자의 자본과 시간 제약을 엄격히 반영하세요. " +
      "모든 답변은 한국어로 작성하세요. " +
      "반드시 json 형식의 객체만 반환하세요.";

    const input = `
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

요청:
선택 아이템을 심층 분석하세요.

반드시 포함할 분석:
- 시장 전망
- 고객 분석
- 경쟁 분석
- 수익 모델 분석
- 초기 실행 계획
- 리스크 및 대응 방안
- 향후 발전 가능성
- 종합 평가 요약
`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions,
      input,
      text: {
        format: {
          type: "json_schema",
          name: "startup_analysis",
          strict: true,
          schema: analysisSchema
        }
      },
      max_output_tokens: 2200
    });

    const parsed = parseOutput(response);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("analyze error:", error);
    return res.status(500).json({
      error: error.message || "분석 생성 중 오류가 발생했습니다."
    });
  }
}
