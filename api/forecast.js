import OpenAI from "openai";

/* =========================================================
   KU STARTUP PLANNER
   최신 공개 자료 기반 경제 전망 API

   구조
   1. GPT-5.5 웹 리서치
   2. GPT-4.1-mini JSON 구조화
   3. 실제 웹 검색 응답에서 출처 URL 추출

   목표
   - 최신성 유지
   - 자료 품질과 속도의 균형
   - max_output_tokens 자동 재시도
========================================================= */

const client =
  new OpenAI({
    apiKey:
      process.env.OPENAI_API_KEY
  });

const RESEARCH_MODEL =
  process.env.OPENAI_FORECAST_RESEARCH_MODEL ||
  "gpt-5.5";

const STRUCTURE_MODEL =
  process.env.OPENAI_FORECAST_STRUCTURE_MODEL ||
  "gpt-4.1-mini";

const RESEARCH_INITIAL_MAX_TOKENS =
  8000;

const RESEARCH_RETRY_MAX_TOKENS =
  12000;

const STRUCTURE_INITIAL_MAX_TOKENS =
  4600;

const STRUCTURE_RETRY_MAX_TOKENS =
  6800;

/* =========================================================
   1. Structured Output Schema
========================================================= */

const forecastSchema = {
  type:
    "object",

  additionalProperties:
    false,

  properties: {
    trendSummary: {
      type:
        "string"
    },

    economicFactors: {
      type:
        "array",

      minItems:
        4,

      maxItems:
        6,

      items: {
        type:
          "object",

        additionalProperties:
          false,

        properties: {
          name: {
            type:
              "string"
          },

          impact: {
            type:
              "string"
          },

          direction: {
            type:
              "string"
          },

          reason: {
            type:
              "string"
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
      type:
        "object",

      additionalProperties:
        false,

      properties: {
        shortTerm: {
          type:
            "string"
        },

        midTerm: {
          type:
            "string"
        },

        longTerm: {
          type:
            "string"
        }
      },

      required: [
        "shortTerm",
        "midTerm",
        "longTerm"
      ]
    },

    scenarios: {
      type:
        "object",

      additionalProperties:
        false,

      properties: {
        optimistic: {
          type:
            "object",

          additionalProperties:
            false,

          properties: {
            situation: {
              type:
                "string"
            },

            strategy: {
              type:
                "string"
            }
          },

          required: [
            "situation",
            "strategy"
          ]
        },

        baseline: {
          type:
            "object",

          additionalProperties:
            false,

          properties: {
            situation: {
              type:
                "string"
            },

            strategy: {
              type:
                "string"
            }
          },

          required: [
            "situation",
            "strategy"
          ]
        },

        pessimistic: {
          type:
            "object",

          additionalProperties:
            false,

          properties: {
            situation: {
              type:
                "string"
            },

            strategy: {
              type:
                "string"
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
      type:
        "array",

      minItems:
        4,

      maxItems:
        6,

      items: {
        type:
          "string"
      }
    },

    dataSnapshot: {
      type:
        "object",

      additionalProperties:
        false,

      properties: {
        observations: {
          type:
            "array",

          minItems:
            3,

          maxItems:
            8,

          items: {
            type:
              "string"
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
   2. Common Utilities
========================================================= */

function isNonEmptyString(
  value
) {
  return (
    typeof value ===
      "string" &&
    value
      .trim()
      .length >
      0
  );
}

function safeText(
  value,
  fallback =
    "정보 없음"
) {
  return isNonEmptyString(
    value
  )
    ? value
        .trim()
    : fallback;
}

function safeArray(
  value
) {
  return Array
    .isArray(
      value
    )
    ? value
    : [];
}

function parseRequestBody(
  req
) {
  if (
    req.body &&
    typeof req.body ===
      "object"
  ) {
    return req.body;
  }

  if (
    typeof req.body ===
      "string"
  ) {
    try {
      return JSON
        .parse(
          req.body
        );
    } catch {
      return {};
    }
  }

  return {};
}

function getIncompleteReason(
  response
) {
  return (
    response
      ?.incomplete_details
      ?.reason ||
    ""
  );
}

function extractOutputText(
  response
) {
  if (
    typeof response
      ?.output_text ===
      "string" &&
    response
      .output_text
      .trim()
  ) {
    return response
      .output_text
      .trim();
  }

  const fragments =
    [];

  for (
    const outputItem of
    safeArray(
      response
        ?.output
    )
  ) {
    if (
      outputItem
        ?.type !==
      "message"
    ) {
      continue;
    }

    for (
      const contentItem of
      safeArray(
        outputItem
          ?.content
      )
    ) {
      if (
        contentItem
          ?.type ===
          "output_text" &&
        isNonEmptyString(
          contentItem
            ?.text
        )
      ) {
        fragments
          .push(
            contentItem
              .text
              .trim()
          );
      }
    }
  }

  if (
    fragments
      .length ===
    0
  ) {
    throw new Error(
      "AI 응답에서 경제 전망 결과를 찾지 못했습니다."
    );
  }

  return fragments
    .join(
      "\n\n"
    );
}

function parseStructuredResult(
  response
) {
  if (
    response
      ?.status ===
    "incomplete"
  ) {
    throw new Error(
      `경제 전망 구조화 응답이 중간에 종료되었습니다. 사유: ${
        getIncompleteReason(
          response
        ) ||
        "알 수 없음"
      }`
    );
  }

  const text =
    extractOutputText(
      response
    );

  try {
    return JSON
      .parse(
        text
      );
  } catch (
    error
  ) {
    throw new Error(
      `경제 전망 JSON 파싱에 실패했습니다: ${error.message}`
    );
  }
}

/* =========================================================
   3. Startup Context
========================================================= */

function makeStartupContext(
  profile,
  idea,
  analysis
) {
  const scoreLines =
    Object
      .entries(
        analysis
          ?.scores ||
        {}
      )
      .map(
        ([
          label,
          value
        ]) =>
          `- ${label}: ${value}점`
      )
      .join(
        "\n"
      );

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

[기존 기본 분석 점수]
${scoreLines || "- 기존 점수 없음"}
  `.trim();
}

/* =========================================================
   4. Extract Real Web Sources
========================================================= */

function extractCitationSources(
  response
) {
  const sourceMap =
    new Map();

  for (
    const outputItem of
    safeArray(
      response
        ?.output
    )
  ) {
    if (
      outputItem
        ?.type !==
      "message"
    ) {
      continue;
    }

    for (
      const contentItem of
      safeArray(
        outputItem
          ?.content
      )
    ) {
      for (
        const annotation of
        safeArray(
          contentItem
            ?.annotations
        )
      ) {
        if (
          annotation
            ?.type !==
          "url_citation"
        ) {
          continue;
        }

        const citation =
          annotation
            ?.url_citation ||
          annotation;

        const url =
          safeText(
            citation
              ?.url,
            ""
          );

        if (!url) {
          continue;
        }

        sourceMap
          .set(
            url,
            {
              title:
                safeText(
                  citation
                    ?.title,
                  "참고 자료"
                ),

              url,

              publishedAt:
                "원문에서 확인",

              whyRelevant:
                "최신 경제 동향 조사에 활용한 자료"
            }
          );
      }
    }
  }

  return Array
    .from(
      sourceMap
        .values()
    );
}

function extractSearchCallSources(
  response
) {
  const sourceMap =
    new Map();

  for (
    const outputItem of
    safeArray(
      response
        ?.output
    )
  ) {
    if (
      outputItem
        ?.type !==
      "web_search_call"
    ) {
      continue;
    }

    for (
      const source of
      safeArray(
        outputItem
          ?.action
          ?.sources
      )
    ) {
      const url =
        safeText(
          source
            ?.url,
          ""
        );

      if (!url) {
        continue;
      }

      sourceMap
        .set(
          url,
          {
            title:
              safeText(
                source
                  ?.title,
                "참고 자료"
              ),

            url,

            publishedAt:
              "원문에서 확인",

            whyRelevant:
              "웹 검색 과정에서 확인한 관련 자료"
          }
        );
    }
  }

  return Array
    .from(
      sourceMap
        .values()
    );
}

function mergeSources(
  ...sourceGroups
) {
  const sourceMap =
    new Map();

  sourceGroups
    .flat()
    .forEach(
      (
        source
      ) => {
        const url =
          safeText(
            source
              ?.url,
            ""
          );

        if (
          !url ||
          sourceMap
            .has(
              url
            )
        ) {
          return;
        }

        sourceMap
          .set(
            url,
            source
          );
      }
    );

  return Array
    .from(
      sourceMap
        .values()
    )
    .slice(
      0,
      8
    );
}

/* =========================================================
   5. Stage 1: Web Research
========================================================= */

async function requestResearch(
  profile,
  idea,
  analysis,
  maxOutputTokens
) {
  const startupContext =
    makeStartupContext(
      profile,
      idea,
      analysis
    );

  return client
    .responses
    .create({
      model:
        RESEARCH_MODEL,

      tools: [
        {
          type:
            "web_search"
        }
      ],

      tool_choice:
        "required",

      include: [
        "web_search_call.action.sources"
      ],

      instructions: `
당신은 한국 시장을 중심으로 초기 창업 아이템의 외부 환경을 조사하는 리서치 애널리스트입니다.

반드시 웹 검색을 실행하세요.

[자료 선택 원칙]
1. 최근 기사, 정부·공공기관 자료, 기업 공식 발표, 산업 보고서를 우선적으로 활용하세요.
2. 최근 90일 이내 자료를 우선적으로 확인하세요.
3. 최신 자료가 부족하면 최근 1년 이내 자료를 보완적으로 활용하세요.
4. 한국 시장과 한국 소비자의 상황을 우선적으로 분석하세요.
5. 확인되지 않은 통계 수치나 URL을 임의로 만들지 마세요.
6. 사실과 해석을 구분하세요.
7. 출처가 약한 자료는 핵심 근거로 사용하지 마세요.
8. 핵심 판단에는 인라인 citation을 남기세요.

[분량 원칙]
1. 조사 결과는 충분히 구체적으로 작성하되 과도하게 장황하게 쓰지 마세요.
2. 핵심 변수는 4~6개로 제한하세요.
3. 같은 내용을 반복하지 마세요.
      `.trim(),

      input: `
다음 창업 아이템의 최신 경제 환경과 향후 사업 전망을 조사하세요.

${startupContext}

[조사 영역]
- 최근 산업 동향
- 고객층의 소비 행태와 지불 여력
- 관련 기술 변화
- 정책·규제 변화
- 경쟁 서비스와 대체재
- 비용 구조 변화
- 주요 사업 기회
- 단기·중기·장기 리스크
      `.trim(),

      max_output_tokens:
        maxOutputTokens
    });
}

async function researchLatestTrends(
  profile,
  idea,
  analysis
) {
  let response =
    await requestResearch(
      profile,
      idea,
      analysis,
      RESEARCH_INITIAL_MAX_TOKENS
    );

  if (
    response
      ?.status ===
      "incomplete" &&
    getIncompleteReason(
      response
    ) ===
      "max_output_tokens"
  ) {
    console.warn(
      "웹 리서치 응답이 토큰 한도에 도달했습니다. 한도를 늘려 한 번 다시 요청합니다."
    );

    response =
      await requestResearch(
        profile,
        idea,
        analysis,
        RESEARCH_RETRY_MAX_TOKENS
      );
  }

  if (
    response
      ?.status ===
    "incomplete"
  ) {
    throw new Error(
      `웹 리서치 응답이 중간에 종료되었습니다. 사유: ${
        getIncompleteReason(
          response
        ) ||
        "알 수 없음"
      }`
    );
  }

  return {
    researchText:
      extractOutputText(
        response
      ),

    sources:
      mergeSources(
        extractCitationSources(
          response
        ),

        extractSearchCallSources(
          response
        )
      )
  };
}

/* =========================================================
   6. Stage 2: Structured Synthesis
========================================================= */

async function requestStructuredForecast(
  profile,
  idea,
  analysis,
  researchText,
  sources,
  maxOutputTokens
) {
  const startupContext =
    makeStartupContext(
      profile,
      idea,
      analysis
    );

  const sourceText =
    sources
      .map(
        (
          source,
          index
        ) =>
          `${index + 1}. ${source.title}\n${source.url}`
      )
      .join(
        "\n\n"
      );

  return client
    .responses
    .create({
      model:
        STRUCTURE_MODEL,

      instructions: `
당신은 창업 아이템의 경제 전망을 정리하는 전략 분석가입니다.

반드시 제공된 최신 웹 조사 결과만을 근거로 작성하세요.

[작성 원칙]
1. 모든 문장은 한국어로 작성하세요.
2. 확인되지 않은 통계나 사실을 임의로 만들지 마세요.
3. 사실과 전망을 구분하세요.
4. 핵심 경제·산업 변수는 서로 다른 관점에서 선정하세요.
5. 영향도와 방향을 기계적으로 반복하지 마세요.
6. 영향도는 변수의 성격에 맞는 자연스러운 표현으로 작성하세요.
7. 방향은 긍정, 부정, 양면적, 불확실 등의 의미가 명확히 드러나도록 작성하세요.
8. 출력은 지정된 JSON Schema를 정확히 따라야 합니다.
      `.trim(),

      input: `
[창업 아이템 컨텍스트]
${startupContext}

[최신 웹 조사 결과]
${researchText}

[실제 검색 과정에서 확보한 출처]
${sourceText || "표시 가능한 출처 없음"}

[작성 요청]
다음 내용을 구조화하세요.

1. 최근 동향 요약
2. 핵심 경제·산업 변수 4~6개
3. 단기 전망: 향후 6개월
4. 중기 전망: 향후 1~2년
5. 장기 전망: 향후 3년 이상
6. 낙관적·기준·비관적 시나리오
7. 지금 실행할 대응 행동 4~6개
8. 핵심 관찰 내용 3~8개
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
        maxOutputTokens
    });
}

async function structureForecast(
  profile,
  idea,
  analysis,
  researchText,
  sources
) {
  let response =
    await requestStructuredForecast(
      profile,
      idea,
      analysis,
      researchText,
      sources,
      STRUCTURE_INITIAL_MAX_TOKENS
    );

  if (
    response
      ?.status ===
      "incomplete" &&
    getIncompleteReason(
      response
    ) ===
      "max_output_tokens"
  ) {
    console.warn(
      "경제 전망 구조화 응답이 토큰 한도에 도달했습니다. 한도를 늘려 한 번 다시 요청합니다."
    );

    response =
      await requestStructuredForecast(
        profile,
        idea,
        analysis,
        researchText,
        sources,
        STRUCTURE_RETRY_MAX_TOKENS
      );
  }

  return parseStructuredResult(
    response
  );
}

/* =========================================================
   7. Final Forecast
========================================================= */

async function createForecast(
  profile,
  idea,
  analysis
) {
  const {
    researchText,
    sources
  } =
    await researchLatestTrends(
      profile,
      idea,
      analysis
    );

  const structured =
    await structureForecast(
      profile,
      idea,
      analysis,
      researchText,
      sources
    );

  return {
    trendSummary:
      safeText(
        structured
          ?.trendSummary
      ),

    economicFactors:
      safeArray(
        structured
          ?.economicFactors
      ),

    outlook:
      structured
        ?.outlook ||
      {},

    scenarios:
      structured
        ?.scenarios ||
      {},

    actions:
      safeArray(
        structured
          ?.actions
      ),

    dataSnapshot:
      structured
        ?.dataSnapshot ||
      {
        observations:
          []
      },

    sources,

    fetchedAt:
      new Date()
        .toISOString(),

    modelUsed: {
      research:
        RESEARCH_MODEL,

      structure:
        STRUCTURE_MODEL
    }
  };
}

/* =========================================================
   8. Vercel Handler
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
      .status(
        405
      )
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
        .status(
          400
        )
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
      .status(
        200
      )
      .json(
        forecast
      );
  } catch (
    error
  ) {
    console.error(
      "forecast error:",
      error
    );

    return res
      .status(
        500
      )
      .json({
        error:
          error
            ?.message ||
          "최신 경제 전망 분석 중 오류가 발생했습니다."
      });
  }
}
