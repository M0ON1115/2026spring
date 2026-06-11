import OpenAI from "openai";

/* =========================================================
   KU STARTUP PLANNER
   최신 공개 자료 기반 경제 전망 API

   설계 목표
   - 자료 품질 우선
   - 한국 시장 중심
   - 공식기관·기업 공식 발표·신뢰도 높은 기사 우선
   - gpt-5.5 agentic web search
   - gpt-4.1 structured synthesis
   - 변수별 영향도와 방향을 세분화
========================================================= */

const client =
  new OpenAI({
    apiKey:
      process.env.OPENAI_API_KEY
  });

/* =========================================================
   1. 환경 설정

   필요하면 Vercel 환경 변수에서 모델을 교체할 수 있다.
========================================================= */

const RESEARCH_MODEL =
  process.env.OPENAI_FORECAST_RESEARCH_MODEL ||
  "gpt-5.5";

const SYNTHESIS_MODEL =
  process.env.OPENAI_FORECAST_SYNTHESIS_MODEL ||
  "gpt-4.1";

const RESEARCH_MAX_OUTPUT_TOKENS =
  6200;

const SYNTHESIS_MAX_OUTPUT_TOKENS =
  5200;

const SYNTHESIS_RETRY_MAX_OUTPUT_TOKENS =
  7600;

/* =========================================================
   2. Structured Output Schema

   기존 enum 중심 구조를 제거한다.

   예:
   impact:
   - "매우 큼"
   - "중간 수준"
   - "제한적"
   - "사업 모델에 따라 크게 달라짐"

   direction:
   - "강한 긍정"
   - "완만한 긍정"
   - "양면적"
   - "완만한 부정"
   - "강한 부정"
   - "현재 판단 보류"

   숫자 점수도 함께 제공한다.
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

    researchQualitySummary: {
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
          },

          evidence: {
            type:
              "array",

            minItems:
              1,

            maxItems:
              3,

            items: {
              type:
                "string"
            }
          },

          sourceRefs: {
            type:
              "array",

            minItems:
              1,

            maxItems:
              4,

            items: {
              type:
                "integer",

              minimum:
                1
            }
          }
        },

        required: [
          "name",
          "impact",
          "impactScore",
          "direction",
          "directionScore",
          "confidence",
          "reason",
          "evidence",
          "sourceRefs"
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
            4,

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
    },

    sources: {
      type:
        "array",

      minItems:
        3,

      maxItems:
        8,

      items: {
        type:
          "object",

        additionalProperties:
          false,

        properties: {
          title: {
            type:
              "string"
          },

          url: {
            type:
              "string"
          },

          publishedAt: {
            type:
              "string"
          },

          sourceType: {
            type:
              "string"
          },

          credibility: {
            type:
              "string"
          },

          whyRelevant: {
            type:
              "string"
          }
        },

        required: [
          "title",
          "url",
          "publishedAt",
          "sourceType",
          "credibility",
          "whyRelevant"
        ]
      }
    }
  },

  required: [
    "trendSummary",
    "researchQualitySummary",
    "economicFactors",
    "outlook",
    "scenarios",
    "actions",
    "dataSnapshot",
    "sources"
  ]
};

/* =========================================================
   3. 공통 유틸리티
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
   4. 창업 아이템 컨텍스트
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
   5. 웹 검색 결과 수집
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

              url
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

            url
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

/* =========================================================
   6. 출처 품질 평가

   URL 자체를 임의로 만들지 않고,
   실제 검색 과정에서 확인한 출처만 사용한다.
========================================================= */

function getHostname(
  url
) {
  try {
    return new URL(
      url
    )
      .hostname
      .replace(
        /^www\./,
        ""
      );
  } catch {
    return "";
  }
}

function getSourceQualityScore(
  url
) {
  const hostname =
    getHostname(
      url
    );

  if (!hostname) {
    return 0;
  }

  const highTrustDomains = [
    "bok.or.kr",
    "ecos.bok.or.kr",
    "kosis.kr",
    "moel.go.kr",
    "kostat.go.kr",
    "korea.kr",
    "mss.go.kr",
    "smba.go.kr",
    "semas.or.kr",
    "dart.fss.or.kr",
    "opendart.fss.or.kr",
    "ftc.go.kr",
    "kisa.or.kr",
    "oecd.org",
    "worldbank.org",
    "imf.org",
    "statista.com"
  ];

  const reputableNewsDomains = [
    "reuters.com",
    "bloomberg.com",
    "yna.co.kr",
    "chosun.com",
    "joongang.co.kr",
    "donga.com",
    "hani.co.kr",
    "khan.co.kr",
    "mk.co.kr",
    "hankyung.com",
    "sedaily.com",
    "etnews.com",
    "zdnet.co.kr"
  ];

  if (
    highTrustDomains
      .some(
        (
          domain
        ) =>
          hostname ===
            domain ||
          hostname.endsWith(
            `.${domain}`
          )
      )
  ) {
    return 100;
  }

  if (
    reputableNewsDomains
      .some(
        (
          domain
        ) =>
          hostname ===
            domain ||
          hostname.endsWith(
            `.${domain}`
          )
      )
  ) {
    return 70;
  }

  return 40;
}

function mergeAndRankSources(
  citationSources,
  searchCallSources
) {
  const sourceMap =
    new Map();

  [
    ...safeArray(
      citationSources
    ),

    ...safeArray(
      searchCallSources
    )
  ]
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

        if (!url) {
          return;
        }

        if (
          !sourceMap
            .has(
              url
            )
        ) {
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

                hostname:
                  getHostname(
                    url
                  ),

                qualityScore:
                  getSourceQualityScore(
                    url
                  )
              }
            );
        }
      }
    );

  return Array
    .from(
      sourceMap
        .values()
    )
    .sort(
      (
        a,
        b
      ) =>
        b
          .qualityScore -
        a
          .qualityScore
    )
    .slice(
      0,
      14
    );
}

function makeVerifiedSourceText(
  sources
) {
  if (
    sources
      .length ===
    0
  ) {
    return "검색 과정에서 검증 가능한 URL을 확보하지 못했습니다.";
  }

  return sources
    .map(
      (
        source,
        index
      ) =>
        [
          `[출처 ${index + 1}]`,
          `제목: ${source.title}`,
          `도메인: ${source.hostname}`,
          `URL: ${source.url}`,
          `내부 품질 우선순위 점수: ${source.qualityScore}`
        ]
          .join(
            "\n"
          )
    )
    .join(
      "\n\n"
    );
}

/* =========================================================
   7. 1단계: 고품질 웹 리서치

   gpt-5.5 + reasoning medium + search_context_size high
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
    await client
      .responses
      .create({
        model:
          RESEARCH_MODEL,

        reasoning: {
          effort:
            "medium"
        },

        tools: [
          {
            type:
              "web_search",

            search_context_size:
              "high",

            external_web_access:
              true,

            user_location: {
              type:
                "approximate",

              country:
                "KR",

              city:
                "Seoul",

              region:
                "Seoul",

              timezone:
                "Asia/Seoul"
            },

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

        instructions: `
당신은 한국 시장을 분석하는 전문 산업 리서처입니다.

목표는 빠른 답변이 아니라, 신뢰할 수 있는 최신 자료를 바탕으로 초기 창업 아이템의 외부 환경을 조사하는 것입니다.

[자료 선택 우선순위]
1. 정부 부처, 공공기관, 중앙은행, 국가통계, 금융감독기관의 공식 자료
2. 기업 공식 발표, 공식 보고서, 공시자료
3. 국제기구와 신뢰도 높은 산업 보고서
4. 통신사, 경제지, 전문지의 최근 기사
5. 그 외 자료는 보조 근거로만 사용

[검색 원칙]
1. 반드시 여러 검색어를 사용해 자료를 교차 확인하세요.
2. 최근 90일 이내 자료를 우선적으로 확인하세요.
3. 필요한 경우 최근 1년 이내 자료를 추가로 활용하세요.
4. 구조적 변화나 장기 통계는 최신 공식 통계의 공표 시점을 확인한 뒤 사용하세요.
5. 동일한 주장에 대해 가능하면 서로 다른 출처를 비교하세요.
6. 출처가 약한 블로그, 커뮤니티, 홍보성 문서는 핵심 근거로 사용하지 마세요.
7. 확인되지 않은 숫자, 게시일, URL을 임의로 만들지 마세요.
8. 한국 시장에 직접 적용하기 어려운 해외 자료는 한계를 명시하세요.
9. 자료가 부족하면 부족하다고 명시하세요.
10. 수치와 해석을 명확히 구분하세요.

[조사해야 할 영역]
- 최근 산업 동향
- 고객층의 소비 여력과 지불 의사 변화
- 경쟁 서비스와 대체재
- 관련 기술 변화
- 정책·규제·제도 변화
- 비용 구조 변화
- 단기·중기·장기 리스크
- 사업 기회
      `.trim(),

        input: `
다음 창업 아이템의 경제 환경과 향후 전망을 조사하세요.

${context}

[결과 작성 형식]
- 한국어로 작성하세요.
- 중요한 근거를 출처와 함께 설명하세요.
- 변수별 영향의 크기와 방향이 서로 같다고 기계적으로 처리하지 마세요.
- 각 변수마다 왜 영향이 다른지 설명하세요.
- 신뢰도 높은 자료를 중심으로 조사 결과를 정리하세요.
      `.trim(),

        max_output_tokens:
          RESEARCH_MAX_OUTPUT_TOKENS
      });

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

  const researchText =
    extractOutputText(
      response
    );

  const sources =
    mergeAndRankSources(
      extractCitationSources(
        response
      ),

      extractSearchCallSources(
        response
      )
    );

  return {
    researchText,
    sources
  };
}

/* =========================================================
   8. 2단계: 구조화

   검색 결과와 검증된 URL 목록을 바탕으로 JSON 생성
========================================================= */

async function synthesizeForecast(
  profile,
  idea,
  analysis,
  researchText,
  verifiedSources,
  maxOutputTokens
) {
  const context =
    makeStartupContext(
      profile,
      idea,
      analysis
    );

  const verifiedSourceText =
    makeVerifiedSourceText(
      verifiedSources
    );

  return client
    .responses
    .create({
      model:
        SYNTHESIS_MODEL,

      instructions: `
당신은 창업 프로젝트의 경제 전망을 작성하는 전략 분석가입니다.

반드시 제공된 웹 리서치 결과와 검증된 출처 목록만 사용하세요.

[중요 규칙]
1. URL을 새로 만들지 마세요.
2. sources에는 검증된 출처 목록에 실제로 존재하는 URL만 넣으세요.
3. 근거가 부족하면 확정적으로 단정하지 마세요.
4. 사실과 예측을 구분하세요.
5. 경제 변수별 영향도를 동일하게 반복하지 마세요.
6. 모든 변수가 우연히 동일한 영향도 또는 동일한 방향을 가진다고 판단한다면, 그 이유를 분명히 설명하세요.
7. impactScore는 1~5 범위로 판단하세요.
8. directionScore는 -2~2 범위로 판단하세요.
9. impact와 direction은 숫자 점수를 설명하는 자연스러운 한국어 문구로 작성하세요.
10. confidence는 근거의 충분성에 따라 "높음", "중간", "낮음" 중 하나로 작성하세요.
11. sourceRefs는 검증된 출처 목록의 번호를 사용하세요.
12. 지정된 JSON Schema를 정확히 따르세요.

[점수 기준]
impactScore:
1 = 영향이 제한적
2 = 일부 조건에서 영향
3 = 유의미한 영향
4 = 사업 성과에 큰 영향
5 = 사업 성립 여부를 좌우할 핵심 변수

directionScore:
-2 = 강한 부정
-1 = 완만한 부정
0 = 양면적 또는 판단 보류
1 = 완만한 긍정
2 = 강한 긍정
      `.trim(),

      input: `
[창업 아이템 컨텍스트]
${context}

[최신 웹 리서치 결과]
${researchText}

[실제 검색 과정에서 확보한 검증된 출처 목록]
${verifiedSourceText}

[작성 요청]
다음 내용을 구조화하세요.

1. 최근 시장 동향 요약
2. 조사 자료의 품질과 한계 요약
3. 핵심 경제·산업 변수 4~6개
4. 변수별 영향도, 방향, 신뢰도, 근거
5. 단기 전망: 향후 6개월
6. 중기 전망: 향후 1~2년
7. 장기 전망: 향후 3년 이상
8. 낙관적·기준·비관적 시나리오
9. 지금 실행할 대응 행동 4~6개
10. 핵심 관찰 내용 4~8개
11. 실제 참고 자료 3~8개
      `.trim(),

      text: {
        format: {
          type:
            "json_schema",

          name:
            "startup_quality_forecast",

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

/* =========================================================
   9. 구조화 결과 URL 검증

   모델이 반환한 sources 중 실제 검색에서 확인한 URL만 남긴다.
========================================================= */

function sanitizeStructuredSources(
  structuredSources,
  verifiedSources
) {
  const verifiedMap =
    new Map(
      verifiedSources
        .map(
          (
            source
          ) => [
            source.url,
            source
          ]
        )
    );

  const result =
    [];

  for (
    const source of
    safeArray(
      structuredSources
    )
  ) {
    const url =
      safeText(
        source
          ?.url,
        ""
      );

    if (
      !url ||
      !verifiedMap
        .has(
          url
        )
    ) {
      continue;
    }

    const verified =
      verifiedMap
        .get(
          url
        );

    result
      .push({
        title:
          safeText(
            source
              ?.title,
            verified
              .title
          ),

        url,

        publishedAt:
          safeText(
            source
              ?.publishedAt,
            "게시일 확인 필요"
          ),

        sourceType:
          safeText(
            source
              ?.sourceType,
            "웹 검색 자료"
          ),

        credibility:
          safeText(
            source
              ?.credibility,
            verified
              .qualityScore >=
              100
              ? "높음"
              : "중간"
          ),

        whyRelevant:
          safeText(
            source
              ?.whyRelevant,
            "경제 전망 분석 참고 자료"
          )
      });
  }

  if (
    result
      .length >=
    3
  ) {
    return result
      .slice(
        0,
        8
      );
  }

  for (
    const verified of
    verifiedSources
  ) {
    if (
      result
        .some(
          (
            source
          ) =>
            source.url ===
            verified.url
        )
    ) {
      continue;
    }

    result
      .push({
        title:
          verified
            .title,

        url:
          verified
            .url,

        publishedAt:
          "게시일 확인 필요",

        sourceType:
          verified
            .qualityScore >=
            100
            ? "공식기관 또는 고신뢰 출처"
            : "웹 검색 자료",

        credibility:
          verified
            .qualityScore >=
            100
            ? "높음"
            : "중간",

        whyRelevant:
          "웹 검색 과정에서 확인한 관련 자료"
      });

    if (
      result
        .length >=
      8
    ) {
      break;
    }
  }

  return result;
}

/* =========================================================
   10. 최종 전망 생성
========================================================= */

async function createForecast(
  profile,
  idea,
  analysis
) {
  const {
    researchText,
    sources:
      verifiedSources
  } =
    await researchLatestTrends(
      profile,
      idea,
      analysis
    );

  let synthesisResponse =
    await synthesizeForecast(
      profile,
      idea,
      analysis,
      researchText,
      verifiedSources,
      SYNTHESIS_MAX_OUTPUT_TOKENS
    );

  if (
    synthesisResponse
      ?.status ===
      "incomplete" &&
    getIncompleteReason(
      synthesisResponse
    ) ===
      "max_output_tokens"
  ) {
    console.warn(
      "경제 전망 구조화 응답이 토큰 한도에 도달했습니다. 더 큰 한도로 한 번 다시 요청합니다."
    );

    synthesisResponse =
      await synthesizeForecast(
        profile,
        idea,
        analysis,
        researchText,
        verifiedSources,
        SYNTHESIS_RETRY_MAX_OUTPUT_TOKENS
      );
  }

  const structured =
    parseStructuredResult(
      synthesisResponse
    );

  return {
    trendSummary:
      safeText(
        structured
          ?.trendSummary
      ),

    researchQualitySummary:
      safeText(
        structured
          ?.researchQualitySummary
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

    sources:
      sanitizeStructuredSources(
        structured
          ?.sources,
        verifiedSources
      ),

    fetchedAt:
      new Date()
        .toISOString(),

    modelUsed: {
      research:
        RESEARCH_MODEL,

      synthesis:
        SYNTHESIS_MODEL
    }
  };
}

/* =========================================================
   11. Vercel API Handler
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
