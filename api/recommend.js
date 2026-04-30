import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const recommendSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    ideas: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          summary: { type: "string" },
          customer: { type: "string" },
          problem: { type: "string" },
          revenue: { type: "string" },
          reason: { type: "string" },
          reasons: {
            type: "array",
            minItems: 3,
            maxItems: 4,
            items: { type: "string" }
          },
          fitScore: {
            type: "number",
            minimum: 0,
            maximum: 100
          },
          difficulty: {
            type: "string",
            enum: ["쉬움", "보통", "어려움"]
          },
          cost: { type: "string" }
        },
        required: [
          "name",
          "summary",
          "customer",
          "problem",
          "revenue",
          "reason",
          "reasons",
          "fitScore",
          "difficulty",
          "cost"
        ]
      }
    }
  },
  required: ["ideas"]
};

function parseOutput(response) {
  if (response.status === "incomplete") {
    const reason = response.incomplete_details?.reason || "unknown";
    throw new Error(`OpenAI 응답이 중간에 잘렸습니다. reason: ${reason}`);
  }

  if (!response.output_text) {
    throw new Error("OpenAI 응답에 output_text가 없습니다.");
  }

  return JSON.parse(response.output_text);
}

async function createRecommendations(profile, compact = false) {
  const instructions =
    "당신은 대학생 예비창업자를 돕는 창업 기획 컨설턴트입니다. " +
    "사용자의 전공, 제2전공, 자격증, 초기 자본, 주당 투입 가능 시간을 반영해 현실적인 창업 아이템을 추천하세요. " +
    "모든 답변은 한국어로 작성하세요. 반드시 json 객체만 반환하세요.";

  const lengthRule = compact
    ? "각 문자열 필드는 60자 이내로 아주 짧게 작성하세요."
    : "각 문자열 필드는 120자 이내로 간결하게 작성하세요.";

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

요청:
이 사용자에게 맞는 창업 아이템 3개를 추천하세요.

작성 규칙:
- 너무 거창한 아이템보다 실제 MVP로 시작 가능한 아이템을 우선하세요.
- 사용자의 초기 자본과 주당 투입 가능 시간을 반드시 반영하세요.
- 추천 근거는 3~4개만 작성하세요.
- ${lengthRule}

반환 형식은 반드시 json 객체여야 합니다:
{
  "ideas": [
    {
      "name": "아이템명",
      "summary": "한 줄 설명",
      "customer": "목표 고객",
      "problem": "해결하려는 문제",
      "revenue": "수익 모델",
      "reason": "이 사용자에게 적합한 핵심 이유",
      "reasons": ["추천 근거 1", "추천 근거 2", "추천 근거 3"],
      "fitScore": 0,
      "difficulty": "쉬움|보통|어려움",
      "cost": "예상 초기 비용"
    }
  ]
}
`;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    instructions,
    input,
    text: {
      format: {
        type: "json_schema",
        name: "startup_recommendations",
        strict: true,
        schema: recommendSchema
      }
    },
    max_output_tokens: compact ? 1800 : 3000
  });

  return parseOutput(response);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  try {
    const { profile } = req.body || {};

    if (!profile) {
      return res.status(400).json({
        error: "profile 데이터가 없습니다."
      });
    }

    try {
      const result = await createRecommendations(profile, false);
      return res.status(200).json(result);
    } catch (firstError) {
      console.warn("first recommend attempt failed:", firstError.message);

      const result = await createRecommendations(profile, true);
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error("recommend error:", error);

    return res.status(500).json({
      error: error.message || "추천 생성 중 오류가 발생했습니다."
    });
  }
}
