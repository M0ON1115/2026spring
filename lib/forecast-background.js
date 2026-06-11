import OpenAI from "openai";

/* =========================================================
   KU STARTUP PLANNER
   Background Forecast Research Shared Logic

   구조
   1. GPT-5.5 background web research
   2. polling으로 완료 상태 확인
   3. GPT-4.1-mini structured synthesis
   4. 실제 검색 출처 URL 반환
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

/* =========================================================
   1. Structured Output Schema

   영향도와 방향은 enum으로 고정하지 않는다.
   모델이 변수별 차이를 자연스럽게 표현하도록 한다.
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

          impactScore: {
            type:
              "integer",

            minimum:
              1,

            maximum:
              5
          },

          direction: {
            type:
              "string"
          },

          directionScore: {
            type:
              "integer",

            minimum:
              -2,

            maximum:
              2
          },

          confidence: {
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
          "impactScore",
          "direction",
          "directionScore",
          "confidence",
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
            7,

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
      "AI 응답에서 전망 분석 결과를 찾지 못했습니다."
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
   4. Real Web Source Extraction
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
   5. Background Research Start

   검색 깊이는 유지한다.
   중간 산출물만 압축된 evidence bundle로 제한한다.
========================================================= */

export async function startBackgroundResearch(
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

  return client
    .responses
    .create({
      model:
        RESEARCH_MODEL,

      background:
        true,

      reasoning: {
        effort:
          "medium"
      },

      tools: [
        {
          type:
            "web_search",

          search_context_size:
            "medium",

          external_web_access:
            true,

          filters: {
            blocked_domains: [
              "reddit.com",
              "quora.com",
              "wikipedia.org",
              "namu.wiki",
              "blog.naver.com",
              "tistory.com"
            ]
          }
        }
      ],

      tool_choice:
        "required",

      include: [
        "web_search_call.action.sources"
      ],

      prompt_cache_key:
        "ku-startup-forecast-research-v1",

      instructions: `
당신은 한국 시장을 중심으로 초기 창업 아이템의 외부 환경을 조사하는 전문 리서치 애널리스트입니다.

반드시 웹 검색을 실행하세요.

[자료 선택 우선순위]
1. 정부 부처, 공공기관, 중앙은행, 국가통계 자료
2. 기업 공식 발표, 공시자료, 공식 보고서
3. 신뢰도 높은 산업 보고서
4. 통신사, 경제지, 전문지의 최근 기사
5. 그 외 자료는 보조 근거로만 사용

[검색 원칙]
1. 최근 90일 이내 자료를 우선적으로 확인하세요.
2. 최신 자료가 부족할 때만 최근 1년 이내 자료를 보완적으로 사용하세요.
3. 한국 시장과 한국 소비자의 상황을 우선적으로 분석하세요.
4. 핵심 판단은 가능하면 서로 다른 출처를 비교하세요.
5. 확인되지 않은 숫자나 URL을 임의로 만들지 마세요.
6. 출처가 약한 블로그, 커뮤니티, 홍보 문서는 핵심 근거로 사용하지 마세요.
7. 변수별 영향이 서로 다르면 그 차이를 명확히 설명하세요.
8. 자료가 부족하면 부족하다고 표시하세요.

[중요]
긴 보고서를 작성하지 마세요.
최종 결과는 구조화 모델이 따로 작성합니다.
검색 결과를 압축한 근거 묶음만 작성하세요.

[근거 묶음 형식]
- 핵심 동향
- 확인된 사실과 수치
- 사업에 미치는 영향
- 불확실성 또는 한계
- 관련 출처
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

검색의 깊이는 유지하되, 결과는 중복 없이 압축된 근거 묶음으로 작성하세요.
      `.trim(),

      max_output_tokens:
        6000
    });
}

/* =========================================================
   6. Background Research Retrieve
========================================================= */

export async function retrieveBackgroundResearch(
  responseId
) {
  return client
    .responses
    .retrieve(
      responseId
    );
}

/* =========================================================
   7. Structured Synthesis

   웹 검색은 다시 하지 않는다.
   구조화가 잘렸을 때만 구조화 호출을 1회 재시도한다.
========================================================= */

async function requestStructuredForecast(
  researchText,
  sources,
  maxOutputTokens
) {
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

      prompt_cache_key:
        "ku-startup-forecast-structure-v1",

      instructions: `
당신은 창업 아이템의 경제 전망을 작성하는 전략 분석가입니다.

반드시 제공된 최신 웹 조사 결과만을 근거로 작성하세요.

[작성 원칙]
1. 모든 문장은 한국어로 작성하세요.
2. 확인되지 않은 통계나 사실을 만들지 마세요.
3. 사실과 전망을 구분하세요.
4. 핵심 변수는 서로 다른 관점에서 선정하세요.
5. 영향도와 방향을 기계적으로 반복하지 마세요.
6. 영향도는 변수의 성격에 맞는 자연스러운 한국어 문구로 작성하세요.
7. 방향은 긍정, 부정, 양면적, 불확실성의 정도가 드러나도록 작성하세요.
8. impactScore는 1~5 범위로 판단하세요.
9. directionScore는 -2~2 범위로 판단하세요.
10. confidence는 "높음", "중간", "낮음" 중 하나로 작성하세요.
11. 출력은 지정된 JSON Schema를 정확히 따라야 합니다.

[점수 기준]
impactScore:
1 = 제한적인 영향
2 = 일부 조건에서 영향
3 = 유의미한 영향
4 = 사업 성과에 큰 영향
5 = 사업 성립 여부를 좌우하는 핵심 변수

directionScore:
-2 = 강한 부정
-1 = 완만한 부정
0 = 양면적 또는 판단 보류
1 = 완만한 긍정
2 = 강한 긍정
      `.trim(),

      input: `
[최신 웹 조사 결과]
${researchText}

[실제 웹 검색 과정에서 확보한 출처]
${sourceText || "표시 가능한 출처 없음"}

[작성 요청]
다음 내용을 구조화하세요.

1. 최근 시장 동향 요약
2. 핵심 경제·산업 변수 4~6개
3. 변수별 영향도, 방향, 신뢰도, 근거
4. 단기 전망: 향후 6개월
5. 중기 전망: 향후 1~2년
6. 장기 전망: 향후 3년 이상
7. 낙관적·기준·비관적 시나리오
8. 지금 실행할 대응 행동 4~6개
9. 분석 당시 핵심 관찰 내용 3~7개
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

export async function finalizeForecast(
  researchResponse
) {
  if (
    researchResponse
      ?.status !==
    "completed"
  ) {
    throw new Error(
      `웹 리서치가 완료되지 않았습니다. 현재 상태: ${
        researchResponse
          ?.status ||
        "알 수 없음"
      }`
    );
  }

  const researchText =
    extractOutputText(
      researchResponse
    );

  const sources =
    mergeSources(
      extractCitationSources(
        researchResponse
      ),

      extractSearchCallSources(
        researchResponse
      )
    );

  let structureResponse =
    await requestStructuredForecast(
      researchText,
      sources,
      4200
    );

  if (
    structureResponse
      ?.status ===
      "incomplete" &&
    getIncompleteReason(
      structureResponse
    ) ===
      "max_output_tokens"
  ) {
    structureResponse =
      await requestStructuredForecast(
        researchText,
        sources,
        6000
      );
  }

  const structured =
    parseStructuredResult(
      structureResponse
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