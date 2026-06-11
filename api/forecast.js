import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* =========================================================
   KU STARTUP PLANNER
   최신 공개 자료 기반 경제 환경 전망 API
========================================================= */

const FORECAST_SEARCH_MODEL =
  process.env.OPENAI_FORECAST_SEARCH_MODEL ||
  "gpt-5.5";

const FORECAST_STRUCTURE_MODEL =
  process.env.OPENAI_FORECAST_STRUCTURE_MODEL ||
  "gpt-4.1-mini";

const forecastSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    trendSummary: {
      type: "string"
    },

    economicFactors: {
      type: "array",
      minItems: 4,
      maxItems: 7,

      items: {
        type: "object",
        additionalProperties: false,

        properties: {
          name: {
            type: "string"
          },

          impact: {
            type: "string",
            enum: [
              "높음",
              "중간",
              "낮음"
            ]
          },

          direction: {
            type: "string",
            enum: [
              "긍정",
              "부정",
              "혼합",
              "불확실"
            ]
          },

          reason: {
            type: "string"
          }
        },

        required: [
          "name",
          "impact",
          "direction",
          "reason"
        ]
      }
    },

    outlook: {
      type: "object",
      additionalProperties: false,

      properties: {
        shortTerm: {
          type: "string"
        },

        midTerm: {
          type: "string"
        },

        longTerm: {
          type: "string"
        }
      },

      required: [
        "shortTerm",
        "midTerm",
        "longTerm"
      ]
    },

    scenarios: {
      type: "object",
      additionalProperties: false,

      properties: {
        optimistic: {
          type: "object",
          additionalProperties: false,

          properties: {
            situation: {
              type: "string"
            },

            strategy: {
              type: "string"
            }
          },

          required: [
            "situation",
            "strategy"
          ]
        },

        baseline: {
          type: "object",
          additionalProperties: false,

          properties: {
            situation: {
              type: "string"
            },

            strategy: {
              type: "string"
            }
          },

          required: [
            "situation",
            "strategy"
          ]
        },

        pessimistic: {
          type: "object",
          additionalProperties: false,

          properties: {
            situation: {
              type: "string"
            },

            strategy: {
              type: "string"
            }
          },

          required: [
            "situation",
            "strategy"
          ]
        }
      },

      required: [
        "optimistic",
        "baseline",
        "pessimistic"
      ]
    },

    actions: {
      type: "array",
      minItems: 4,
      maxItems: 7,

      items: {
        type: "string"
      }
    },

    dataSnapshot: {
      type: "object",
      additionalProperties: false,

      properties: {
        observations: {
          type: "array",
          minItems: 3,
          maxItems: 8,

          items: {
            type: "string"
          }
        }
      },

      required: [
        "observations"
      ]
    }
  },

  required: [
    "trendSummary",
    "economicFactors",
    "outlook",
    "scenarios",
    "actions",
    "dataSnapshot"
  ]
};

/* =========================================================
   1. 공통 유틸리티
========================================================= */

function isNonEmptyString(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function getSafeText(value, fallback = "정보 없음") {
  return isNonEmptyString(value)
    ? value.trim()
    : fallback;
}

function getSafeArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}

function extractOutputText(response) {
  if (
    typeof response?.output_text === "string" &&
    response.output_text.trim()
  ) {
    return response.output_text.trim();
  }

  const textParts = [];

  for (
    const outputItem of
    getSafeArray(response?.output)
  ) {
    if (
      outputItem?.type !== "message"
    ) {
      continue;
    }

    for (
      const contentItem of
      getSafeArray(outputItem?.content)
    ) {
      if (
        contentItem?.type === "output_text" &&
        isNonEmptyString(contentItem.text)
      ) {
        textParts.push(
          contentItem.text.trim()
        );
      }
    }
  }

  if (textParts.length === 0) {
    throw new Error(
      "AI 응답에서 분석 텍스트를 찾지 못했습니다."
    );
  }

  return textParts.join("\n\n");
}

function extractUrlCitations(response) {
  const citationMap =
    new Map();

  for (
    const outputItem of
    getSafeArray(response?.output)
  ) {
    if (
      outputItem?.type !== "message"
    ) {
      continue;
    }

    for (
      const contentItem of
      getSafeArray(outputItem?.content)
    ) {
      for (
        const annotation of
        getSafeArray(contentItem?.annotations)
      ) {
        if (
          annotation?.type !== "url_citation"
        ) {
          continue;
        }

        const url =
          annotation.url ||
          annotation.url_citation?.url;

        const title =
          annotation.title ||
          annotation.url_citation?.title ||
          "참고 자료";

        if (
          !isNonEmptyString(url)
        ) {
          continue;
        }

        citationMap.set(
          url,
          {
            title:
              getSafeText(
                title,
                "참고 자료"
              ),

            url:
              url.trim()
          }
        );
      }
    }
  }

  return Array.from(
    citationMap.values()
  );
}

function parseStructuredOutput(response) {
  if (
    response?.status === "incomplete"
  ) {
    const reason =
      response
        ?.incomplete_details
        ?.reason ||
      "unknown";

    throw new Error(
      `전망 구조화 응답이 중간에 종료되었습니다. reason: ${reason}`
    );
  }

  const text =
    extractOutputText(response);

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      `전망 구조화 JSON 파싱에 실패했습니다: ${error.message}`
    );
  }
}

/* =========================================================
   2. 사용자·아이템 컨텍스트
========================================================= */

function makeStartupContext(
  profile,
  idea,
  analysis
) {
  const scoreLines =
    Object
      .entries(
        analysis?.scores || {}
      )
      .map(
        ([key, value]) =>
          `- ${key}: ${value}점`
      )
      .join("\n");

  return `
[사용자 조건]
- 제1전공: ${getSafeText(profile?.primaryMajorText)}
- 제2전공: ${getSafeText(profile?.secondaryMajorText, "해당 없음")}
- 자격증: ${getSafeArray(profile?.certificates).join(", ") || "없음"}
- 관심 분야: ${getSafeText(profile?.interests)}
- 창업 목적: ${getSafeText(profile?.goal)}
- 초기 자본: ${getSafeText(profile?.budgetText)}
- 투입 가능 시간: ${getSafeText(profile?.timeText)}
- 선호 창업 유형: ${getSafeText(profile?.businessType)}
- 관심 고객층: ${getSafeText(profile?.target)}
- 제약 조건: ${getSafeText(profile?.avoid, "없음")}

[선택한 창업 아이템]
- 아이템명: ${getSafeText(idea?.name)}
- 한 줄 설명: ${getSafeText(idea?.summary)}
- 목표 고객: ${getSafeText(idea?.customer)}
- 해결 문제: ${getSafeText(idea?.problem)}
- 수익 모델: ${getSafeText(idea?.revenue)}
- 추천 이유: ${getSafeText(idea?.reason)}
- 난이도: ${getSafeText(idea?.difficulty)}
- 예상 초기 비용: ${getSafeText(idea?.cost)}

[기존 심층 분석 점수]
${scoreLines || "- 기존 점수 없음"}
  `.trim();
}

/* =========================================================
   3. 최신 공개 자료 검색
========================================================= */

async function researchLatestTrends(
  profile,
  idea,
  analysis
) {
  const context =
    makeStartupContext(
      profile,
      idea,
      analysis
    );

  const response =
    await client.responses.create({
      model:
        FORECAST_SEARCH_MODEL,

      tools: [
        {
          type:
            "web_search"
        }
      ],

      tool_choice:
        "required",

      input: `
당신은 한국 시장을 중심으로 창업 아이템의 외부 환경을 분석하는 리서치 애널리스트입니다.

아래 창업 아이템에 대해 분석 시점에 확인 가능한 최신 공개 자료를 웹에서 검색하세요.

${context}

[검색 원칙]
1. 반드시 웹 검색을 실행하세요.
2. 최근 기사, 공공기관 자료, 기업 공식 발표, 산업 보고서를 우선적으로 확인하세요.
3. 가능하면 최근 90일 이내 자료를 우선적으로 반영하세요.
4. 최근 90일 이내 자료가 부족하면 최근 1년 이내 자료를 보완적으로 활용하세요.
5. 시장 규모를 단정하지 말고, 확인 가능한 자료와 불확실성을 구분하세요.
6. 한국 시장과 한국 소비자의 상황을 우선적으로 분석하세요.
7. 선택 아이템과 직접 관련된 산업 동향뿐 아니라 고객층의 소비 여력, 비용 부담, 규제, 기술 변화, 경쟁 환경도 확인하세요.
8. 출처가 불명확한 수치나 과장된 홍보 문구는 핵심 근거로 사용하지 마세요.

[조사해야 할 내용]
- 선택 아이템과 관련된 최근 산업 동향
- 고객층의 소비 행태 또는 지불 여력 변화
- 관련 기술 변화
- 관련 정책 또는 규제 변화
- 경쟁 서비스 또는 대체재 변화
- 사업 기회와 주요 리스크
- 단기, 중기, 장기 전망에 영향을 줄 핵심 변수

[작성 형식]
- 한국어로 작성하세요.
- 조사 결과를 충분히 구체적으로 작성하세요.
- 각 판단의 근거가 되는 출처를 인라인 citation으로 남기세요.
- 사실, 해석, 불확실성을 구분하세요.
      `.trim(),

      max_output_tokens:
        5000
    });

  return {
    researchText:
      extractOutputText(
        response
      ),

    sources:
      extractUrlCitations(
        response
      )
  };
}

/* =========================================================
   4. 검색 결과 구조화
========================================================= */

async function structureForecast(
  profile,
  idea,
  analysis,
  researchText,
  sources
) {
  const context =
    makeStartupContext(
      profile,
      idea,
      analysis
    );

  const sourceText =
    sources
      .map(
        (source, index) =>
          `${index + 1}. ${source.title}\n   ${source.url}`
      )
      .join("\n");

  const response =
    await client.responses.create({
      model:
        FORECAST_STRUCTURE_MODEL,

      instructions: `
당신은 창업 아이템의 경제 환경 전망을 작성하는 분석가입니다.

반드시 제공된 최신 웹 조사 결과만을 근거로 판단하세요.
확인되지 않은 수치를 임의로 만들지 마세요.
모든 문장은 한국어로 작성하세요.
출력은 반드시 지정된 JSON Schema를 따라야 합니다.
각 문장은 간결하지만 구체적으로 작성하세요.
      `.trim(),

      input: `
[창업 아이템 컨텍스트]
${context}

[최신 웹 조사 결과]
${researchText}

[검색 과정에서 확보한 출처]
${sourceText || "출처 목록 없음"}

[작성 요청]
다음 내용을 구조화하세요.

1. 최근 시장 동향 요약
2. 핵심 경제·산업 변수 4~7개
3. 단기 전망: 향후 6개월
4. 중기 전망: 향후 1~2년
5. 장기 전망: 향후 3년 이상
6. 낙관적·기준·비관적 시나리오
7. 지금 실행할 대응 행동 4~7개
8. 분석 당시 핵심 관찰 내용 3~8개

[주의]
- 최신 조사 결과에서 직접 확인되지 않은 내용을 확정적으로 쓰지 마세요.
- 정량 수치를 사용할 때는 조사 결과에 포함된 수치만 사용하세요.
- 전망은 예측이므로 불확실성을 명확히 표현하세요.
      `.trim(),

      text: {
        format: {
          type:
            "json_schema",

          name:
            "startup_live_forecast",

          strict:
            true,

          schema:
            forecastSchema
        }
      },

      max_output_tokens:
        3800
    });

  return parseStructuredOutput(
    response
  );
}

/* =========================================================
   5. 데이터 정규화
========================================================= */

function normalizeForecast(
  structuredForecast,
  sources,
  fetchedAt
) {
  return {
    trendSummary:
      getSafeText(
        structuredForecast?.trendSummary
      ),

    economicFactors:
      getSafeArray(
        structuredForecast?.economicFactors
      ),

    outlook: {
      shortTerm:
        getSafeText(
          structuredForecast
            ?.outlook
            ?.shortTerm
        ),

      midTerm:
        getSafeText(
          structuredForecast
            ?.outlook
            ?.midTerm
        ),

      longTerm:
        getSafeText(
          structuredForecast
            ?.outlook
            ?.longTerm
        )
    },

    scenarios: {
      optimistic: {
        situation:
          getSafeText(
            structuredForecast
              ?.scenarios
              ?.optimistic
              ?.situation
          ),

        strategy:
          getSafeText(
            structuredForecast
              ?.scenarios
              ?.optimistic
              ?.strategy
          )
      },

      baseline: {
        situation:
          getSafeText(
            structuredForecast
              ?.scenarios
              ?.baseline
              ?.situation
          ),

        strategy:
          getSafeText(
            structuredForecast
              ?.scenarios
              ?.baseline
              ?.strategy
          )
      },

      pessimistic: {
        situation:
          getSafeText(
            structuredForecast
              ?.scenarios
              ?.pessimistic
              ?.situation
          ),

        strategy:
          getSafeText(
            structuredForecast
              ?.scenarios
              ?.pessimistic
              ?.strategy
          )
      }
    },

    actions:
      getSafeArray(
        structuredForecast?.actions
      ),

    dataSnapshot:
      structuredForecast
        ?.dataSnapshot || {
          observations: []
        },

    sources:
      getSafeArray(
        sources
      ),

    fetchedAt,

    modelUsed: {
      search:
        FORECAST_SEARCH_MODEL,

      structure:
        FORECAST_STRUCTURE_MODEL
    }
  };
}

/* =========================================================
   6. Vercel API Handler
========================================================= */

export default async function handler(
  req,
  res
) {
  if (
    req.method !== "POST"
  ) {
    return res
      .status(405)
      .json({
        error:
          "POST 요청만 허용됩니다."
      });
  }

  try {
    const {
      profile,
      idea,
      analysis
    } =
      req.body || {};

    if (
      !profile ||
      !idea
    ) {
      return res
        .status(400)
        .json({
          error:
            "profile 또는 idea 데이터가 없습니다."
        });
    }

    const fetchedAt =
      new Date()
        .toISOString();

    const {
      researchText,
      sources
    } =
      await researchLatestTrends(
        profile,
        idea,
        analysis
      );

    if (
      sources.length === 0
    ) {
      console.warn(
        "웹 검색 인용 출처를 찾지 못했습니다."
      );
    }

    const structuredForecast =
      await structureForecast(
        profile,
        idea,
        analysis,
        researchText,
        sources
      );

    const normalizedForecast =
      normalizeForecast(
        structuredForecast,
        sources,
        fetchedAt
      );

    return res
      .status(200)
      .json(
        normalizedForecast
      );
  } catch (error) {
    console.error(
      "forecast error:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          error.message ||
          "최신 경제 전망 분석 중 오류가 발생했습니다."
      });
  }
}
