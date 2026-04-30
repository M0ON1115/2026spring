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
    },
    keywords: {
      type: "object",
      additionalProperties: false,
      properties: {
        market: { type: "string" },
        customer: { type: "string" },
        competition: { type: "string" },
        revenue: { type: "string" },
        mvp: { type: "string" },
        risk: { type: "string" },
        growth: { type: "string" },
        summary: { type: "string" }
      },
      required: [
        "market",
        "customer",
        "competition",
        "revenue",
        "mvp",
        "risk",
        "growth",
        "summary"
      ]
    }
  },
  required: ["scores", "keywords"]
};

function clampScore(value, fallback = 75) {
  const score = Number(value);
  return Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.round(score)))
    : fallback;
}

function defaultScores() {
  return {
    "사용자 적합성": 78,
    "실행 가능성": 76,
    "시장성": 74,
    "수익성": 72,
    "차별성": 70,
    "확장성": 75,
    "리스크 안정성": 68
  };
}

function normalizeScores(scores = {}) {
  const base = defaultScores();

  Object.keys(base).forEach((key) => {
    base[key] = clampScore(scores[key], base[key]);
  });

  return base;
}

function makeSections(profile, idea, keywords = {}) {
  const marketKeyword = keywords.market || "초기 수요 검증 필요";
  const customerKeyword = keywords.customer || "명확한 고객 문제 중심";
  const competitionKeyword = keywords.competition || "기존 대체재와 차별화 필요";
  const revenueKeyword = keywords.revenue || "소액 결제 또는 구독형 가능";
  const mvpKeyword = keywords.mvp || "작은 기능부터 검증";
  const riskKeyword = keywords.risk || "AI 결과 신뢰성과 실제 지불 의사";
  const growthKeyword = keywords.growth || "기능 확장과 제휴 가능성";

  return {
    market:
      `${idea.name}은 ${idea.customer}를 대상으로 하며, 핵심 문제는 "${idea.problem}"입니다. ` +
      `시장 관점에서는 ${marketKeyword}가 중요합니다. 초기에는 큰 시장 규모를 단정하기보다, ` +
      `랜딩페이지 신청, 설문, 무료 체험 등을 통해 실제 수요와 지불 의사를 확인하는 방식이 적합합니다.`,

    customer:
      `주요 고객은 ${idea.customer}입니다. 이 고객층은 ${customerKeyword}라는 특징을 가질 가능성이 있습니다. ` +
      `따라서 서비스 메시지는 기능 설명보다 고객이 겪는 불편, 시간 절약, 비용 절감, 결과물 품질 향상에 초점을 두는 것이 좋습니다.`,

    competition:
      `경쟁 측면에서는 ${competitionKeyword}가 핵심입니다. 유사 서비스나 대체재가 이미 존재할 수 있으므로, ` +
      `단순히 AI를 사용한다는 점만으로는 부족합니다. ${profile.primaryMajorText} 배경, 보유 자격증, 특정 고객층 이해를 결합한 맞춤형 제안이 차별화 포인트가 될 수 있습니다.`,

    revenue:
      `수익 모델은 ${idea.revenue}를 기본으로 검토할 수 있습니다. 특히 ${revenueKeyword} 방향이 현실적입니다. ` +
      `초기에는 무료 체험 또는 저가형 상품으로 진입 장벽을 낮추고, 이후 반복 사용 기능이나 프리미엄 리포트로 확장하는 방식이 적합합니다.`,

    mvp:
      `초기 실행은 ${mvpKeyword} 방식으로 진행하는 것이 좋습니다. 1단계에서는 핵심 기능만 구현하고, ` +
      `2단계에서는 테스트 사용자 10~20명을 모집해 반응을 확인합니다. 3단계에서는 사용자가 실제로 돈을 낼 기능과 불필요한 기능을 구분해 MVP를 개선합니다.`,

    risk:
      `주요 리스크는 ${riskKeyword}입니다. AI 분석 결과가 그럴듯해 보여도 실제 시장 검증을 대신할 수는 없습니다. ` +
      `따라서 고객 인터뷰, 클릭률, 신청률, 결제 전환율 같은 지표를 통해 아이템의 현실성을 확인해야 합니다.`,

    growth:
      `향후에는 ${growthKeyword} 방향으로 확장할 수 있습니다. 초기에는 단일 기능 서비스로 시작하되, ` +
      `사용자 계정, 결과 저장, 계획서 PDF 출력, 시장 데이터 연동, 팀원 매칭 기능 등으로 발전시킬 수 있습니다.`
  };
}

function makeSummary(profile, idea, scores, keywords = {}) {
  const average = Math.round(
    Object.values(scores).reduce((sum, value) => sum + value, 0) /
      Object.keys(scores).length
  );

  return (
    keywords.summary ||
    `${idea.name}은 ${profile.primaryMajorText} 배경과 사용자의 조건을 반영했을 때 종합 ${average}점 수준의 검토 가치가 있는 아이템입니다. ` +
      `다만 실제 창업 가능성은 초기 고객 반응과 지불 의사 검증을 통해 확인해야 합니다.`
  );
}

function parseOutput(response) {
  if (response.status === "incomplete") {
    throw new Error(
      `OpenAI 응답이 중간에 잘렸습니다. reason: ${
        response.incomplete_details?.reason || "unknown"
      }`
    );
  }

  if (!response.output_text) {
    throw new Error("OpenAI 응답에 output_text가 없습니다.");
  }

  return JSON.parse(response.output_text);
}

async function createScoreAnalysis(profile, idea) {
  const instructions =
    "당신은 창업 아이템을 평가하는 심사역입니다. " +
    "긴 문장을 쓰지 말고, 점수와 매우 짧은 키워드만 반환하세요. " +
    "모든 응답은 한국어로 작성하세요. 반드시 json 객체만 반환하세요.";

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
아래 평가 점수와 각 분석 항목의 핵심 키워드만 작성하세요.
keywords의 각 값은 반드시 30자 이내로 작성하세요.
summary도 반드시 80자 이내로 작성하세요.
`;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
    instructions,
    input,
    text: {
      format: {
        type: "json_schema",
        name: "startup_score_analysis",
        strict: true,
        schema: scoreSchema
      }
    },
    max_output_tokens: 900
  });

  return parseOutput(response);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 허용됩니다." });
  }

  const { profile, idea } = req.body || {};

  if (!profile || !idea) {
    return res.status(400).json({
      error: "profile 또는 idea 데이터가 없습니다."
    });
  }

  try {
    const aiResult = await createScoreAnalysis(profile, idea);
    const scores = normalizeScores(aiResult.scores);
    const sections = makeSections(profile, idea, aiResult.keywords);
    const summary = makeSummary(profile, idea, scores, aiResult.keywords);

    return res.status(200).json({
      scores,
      sections,
      summary
    });
  } catch (error) {
    console.warn("AI score analysis failed. Using server fallback:", error.message);

    const scores = normalizeScores();
    const sections = makeSections(profile, idea, {});
    const summary = makeSummary(profile, idea, scores, {});

    return res.status(200).json({
      scores,
      sections,
      summary
    });
  }
}
