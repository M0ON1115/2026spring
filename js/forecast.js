import OpenAI from "openai";

/* =========================================================
   KU STARTUP PLANNER
   최신 공개 자료 기반 경제 전망 API
   - OpenAI Responses API
   - web_search 1회
   - Structured Outputs 결합
========================================================= */

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const FORECAST_MODEL =
  process.env.OPENAI_FORECAST_MODEL ||
  "gpt-5.5";

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
      maxItems: 5,

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
      maxItems: 5,

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
          maxItems: 6,

          items: {
            type: "string"
          }
        }
      },

      required: [
        "observations"
      ]
    },

    sources: {
      type: "array",
      minItems: 1,
      maxItems: 6,

      items: {
        type: "object",
        additionalProperties: false,

        properties: {
          title: {
            type: "string"
          },

          url: {
            type: "string"
          },

          publishedAt: {
            type: "string"
          },

          whyRelevant: {
            type: "string"
          }
        },

        required: [
          "title",
          "url",
          "publishedAt",
          "whyRelevant"
        ]
      }
    }
  },

  required: [
    "trendSummary",
    "economicFactors",
    "outlook",
    "scenarios",
    "actions",
    "dataSnapshot",
    "sources"
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

function safeText(
  value,
  fallback = "정보 없음"
) {
  return isNonEmptyString(value)
    ? value.trim()
    : fallback;
}

function safeArray(value) {
  return Array.isArray(value)
    ? value
    : [];
}

function parseRequestBody(req) {
  if (
    req.body &&
    typeof req.body === "object"
  ) {
    return req.body;
  }

  if (
    typeof req.body === "string"
  ) {
    try {
      return JSON.parse(
        req.body
      );
    } catch {
      return {};
    }
  }

  return {};
}

function extractOutputText(response) {
  if (
    typeof response?.output_text ===
      "string" &&
    response.output_text.trim()
  ) {
    return response.output_text.trim();
  }

  const fragments = [];

  for (
    const outputItem of
    safeArray(response?.output)
  ) {
    if (
      outputItem?.type !==
      "message"
    ) {
      continue;
    }

    for (
      const contentItem of
      safeArray(outputItem?.content)
    ) {
      if (
        contentItem?.type ===
          "output_text" &&
        isNonEmptyString(
          contentItem.text
        )
      ) {
        fragments.push(
          contentItem.text.trim()
        );
      }
    }
  }

  if (
    fragments.length ===
    0
  ) {
    throw new Error(
      "AI 응답에서 전망 분석 결과를 찾지 못했습니다."
    );
  }

  return fragments.join(
    "\n"
  );
}

function extractUrlCitations(response) {
  const sourceMap =
    new Map();

  for (
    const outputItem of
    safeArray(response?.output)
  ) {
    if (
      outputItem?.type !==
      "message"
    ) {
      continue;
    }

    for (
      const contentItem of
      safeArray(outputItem?.content)
    ) {
      for (
        const annotation of
        safeArray(
          contentItem?.annotations
        )
      ) {
        if (
          annotation?.type !==
          "url_citation"
        ) {
          continue;
        }

        const citation =
          annotation.url_citation ||
          annotation;

        const url =
          citation?.url;

        if (
          !isNonEmptyString(url)
        ) {
          continue;
        }

        sourceMap.set(
          url.trim(),
          {
            title:
              safeText(
                citation?.title,
                "참고 자료"
              ),

            url:
              url.trim(),

            publishedAt:
              "게시일 확인 필요",

            whyRelevant:
              "웹 검색 과정에서 참고한 자료"
          }
        );
      }
    }
  }

  return Array.from(
    sourceMap.values()
  );
}

function mergeSources(
  structuredSources,
  citationSources
) {
  const sourceMap =
    new Map();

  [
    ...safeArray(
      structuredSources
    ),

    ...safeArray(
      citationSources
    )
  ].forEach(
    (source) => {
      const url =
        safeText(
          source?.url,
          ""
        );

      if (!url) {
        return;
      }

      if (
        !sourceMap.has(url)
      ) {
        sourceMap.set(
          url,
          {
            title:
              safeText(
                source?.title,
                "참고 자료"
              ),

            url,

            publishedAt:
              safeText(
                source?.publishedAt,
                "게시일 확인 필요"
              ),

            whyRelevant:
              safeText(
                source?.whyRelevant,
                "전망 분석 참고 자료"
              )
          }
        );
      }
    }
  );

  return Array
    .from(
      sourceMap.values()
    )
    .slice(
      0,
      6
    );
}

function parseStructuredResult(
  response
) {
  if (
    response?.status ===
    "incomplete"
  ) {
    const reason =
      response
        ?.incomplete_details
        ?.reason ||
      "unknown";

    throw new Error(
      `경제 전망 응답이 중간에 종료되었습니다. reason: ${reason}`
    );
  }

  const outputText =
    extractOutputText(
      response
    );

  try {
    return JSON.parse(
      outputText
    );
  } catch (error) {
    throw new Error(
      `경제 전망 JSON 파싱에 실패했습니다: ${error.message}`
    );
  }
}

/* =========================================================
   2. 사용자 정보 정리
========================================================= */

function makeStartupContext(
  profile,
  idea,
  analysis
) {
  const scoreLines =
    Object
      .entries(
        analysis?.scores ||
        {}
      )
      .map(
        ([label, value]) =>
          `- ${label}: ${value}점`
      )
      .join("\n");

  return `
[사용자 조건]
- 제1전공: ${safeText(profile?.primaryMajorText)}
- 제2전공: ${safeText(profile?.secondaryMajorText, "해당 없음")}
- 자격증: ${safeArray(profile?.certificates).join(", ") || "없음"}
- 관심 분야: ${safeText(profile?.interests)}
- 창업 목적: ${safeText(profile?.goal)}
- 초기 자본: ${safeText(profile?.budgetText)}
- 투입 가능 시간: ${safeText(profile?.timeText)}
- 선호 창업 유형: ${safeText(profile?.businessType)}
- 관심 고객층: ${safeText(profile?.target)}
- 제약 조건: ${safeText(profile?.avoid, "없음")}

[선택한 창업 아이템]
- 아이템명: ${safeText(idea?.name)}
- 한 줄 설명: ${safeText(idea?.summary)}
- 핵심 고객: ${safeText(idea?.customer)}
- 해결 문제: ${safeText(idea?.problem)}
- 수익 모델: ${safeText(idea?.revenue)}
- 추천 이유: ${safeText(idea?.reason)}
- 난이도: ${safeText(idea?.difficulty)}
- 예상 초기 비용: ${safeText(idea?.cost)}

[기존 심층 분석 점수]
${scoreLines || "- 기존 점수 없음"}
  `.trim();
}

/* =========================================================
   3. 단일 호출 경제 전망 분석
========================================================= */

async function createForecast(
  profile,
  idea,
  analysis
) {
  const startupContext =
    makeStartupContext(
      profile,
      idea,
      analysis
    );

  const response =
    await client.responses.create({
      model:
        FORECAST_MODEL,

      reasoning: {
        effort:
          "low"
      },

      tools: [
        {
          type:
            "web_search",

          search_context_size:
            "low"
        }
      ],

      tool_choice:
        "required",

      instructions: `
당신은 한국 시장을 중심으로 초기 창업 아이템을 분석하는 리서치 애널리스트입니다.

반드시 웹 검색을 실행한 뒤, 분석 시점에 확인 가능한 최신 공개 자료를 근거로 전망을 작성하세요.

[핵심 원칙]
1. 한국 시장을 우선적으로 분석하세요.
2. 최근 90일 이내 기사, 공공기관 발표, 기업 공식 자료, 산업 보고서를 우선적으로 검색하세요.
3. 최근 자료가 부족한 경우에만 최근 1년 이내 자료를 보완적으로 사용하세요.
4. 출처가 불명확한 숫자를 만들지 마세요.
5. 사실과 전망을 구분하세요.
6. 시장 규모를 근거 없이 단정하지 마세요.
7. 결과는 반드시 지정된 JSON Schema를 따르세요.
8. sources에는 실제로 참고한 자료의 제목, URL, 게시일, 관련성을 기록하세요.
9. URL을 임의로 만들지 마세요.
10. 간결하지만 구체적으로 작성하세요.
      `.trim(),

      input: `
다음 창업 아이템의 경제 환경과 향후 발전 가능성을 최신 공개 자료를 바탕으로 분석하세요.

${startupContext}

[분석 항목]
- 최근 산업 동향 요약
- 핵심 경제·산업 변수 4~5개
- 단기 전망: 향후 6개월
- 중기 전망: 향후 1~2년
- 장기 전망: 향후 3년 이상
- 낙관적·기준·비관적 시나리오
- 현재 시점의 추천 대응 행동 4~5개
- 분석 당시 핵심 관찰 내용
- 실제 참고 자료 1~6개
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
        2600
    });

  const structured =
    parseStructuredResult(
      response
    );

  const citations =
    extractUrlCitations(
      response
    );

  return {
    trendSummary:
      safeText(
        structured?.trendSummary
      ),

    economicFactors:
      safeArray(
        structured?.economicFactors
      ),

    outlook:
      structured?.outlook ||
      {},

    scenarios:
      structured?.scenarios ||
      {},

    actions:
      safeArray(
        structured?.actions
      ),

    dataSnapshot:
      structured?.dataSnapshot ||
      {
        observations: []
      },

    sources:
      mergeSources(
        structured?.sources,
        citations
      ),

    fetchedAt:
      new Date()
        .toISOString(),

    modelUsed:
      FORECAST_MODEL
  };
}

/* =========================================================
   4. Vercel API Handler
========================================================= */

export default async function handler(
  req,
  res
) {
  if (
    req.method !==
    "POST"
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
      parseRequestBody(
        req
      );

    if (
      !profile ||
      !idea ||
      !analysis
    ) {
      return res
        .status(400)
        .json({
          error:
            "profile, idea, analysis 데이터가 모두 필요합니다."
        });
    }

    const forecast =
      await createForecast(
        profile,
        idea,
        analysis
      );

    return res
      .status(200)
      .json(
        forecast
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
          error?.message ||
          "최신 경제 전망 분석 중 오류가 발생했습니다."
      });
  }
}
