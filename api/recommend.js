import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw error;
    }

    return JSON.parse(text.slice(start, end + 1));
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  try {
    const { profile } = req.body;

    if (!profile) {
      return res.status(400).json({ error: "profile 데이터가 없습니다." });
    }

    const instructions =
      "당신은 대학생 예비창업자를 돕는 창업 기획 컨설턴트입니다. " +
      "반드시 현실적이고 실행 가능한 창업 아이템만 제안하세요. " +
      "사용자의 전공, 제2전공, 자격증, 초기 자본, 주당 투입 가능 시간을 강하게 반영하세요. " +
      "모든 답변은 한국어로 작성하세요. " +
      "반드시 json 형식의 객체만 반환하세요. 설명 문장, 마크다운, 코드블록 없이 순수 json만 반환하세요.";

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

반환 형식은 반드시 json 객체여야 합니다:
{
  "ideas": [
    {
      "name": "아이템명",
      "summary": "한 줄 설명",
      "customer": "목표 고객",
      "problem": "해결하려는 문제",
      "revenue": "수익 모델",
      "reason": "이 사용자에게 적합한 핵심 이유 한 문장",
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
          type: "json_object"
        }
      },
      max_output_tokens: 1200
    });

    const text = response.output_text;
    const parsed = safeJsonParse(text);

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("recommend error:", error);
    return res.status(500).json({
      error: error.message || "추천 생성 중 오류가 발생했습니다."
    });
  }
}
