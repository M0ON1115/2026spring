/* =========================================================
   KU STARTUP PLANNER
   최신 공개 자료 기반 경제 전망
   별도 탭 · 저장 · 복원
========================================================= */

(() => {
  const get =
    (id) =>
      document
        .getElementById(
          id
        );

  const forecastBtn =
    get(
      "forecastBtn"
    );

  const refreshForecastBtn =
    get(
      "refreshForecastBtn"
    );

  const forecastTabBtn =
    get(
      "forecastTabBtn"
    );

  const forecastTabBadge =
    get(
      "forecastTabBadge"
    );

  const forecastStatusCard =
    get(
      "forecastStatusCard"
    );

  const forecastStatusText =
    get(
      "forecastStatusText"
    );

  const forecastSection =
    get(
      "forecastSection"
    );

  const forecastMeta =
    get(
      "forecastMeta"
    );

  const forecastTrendSummary =
    get(
      "forecastTrendSummary"
    );

  const forecastFactors =
    get(
      "forecastFactors"
    );

  const forecastOutlook =
    get(
      "forecastOutlook"
    );

  const forecastScenarios =
    get(
      "forecastScenarios"
    );

  const forecastActions =
    get(
      "forecastActions"
    );

  const forecastSources =
    get(
      "forecastSources"
    );

  let currentForecast =
    null;

  let loadingTimer =
    null;

  /* =======================================================
     1. Utility
  ======================================================= */

  function createElement(
    tag,
    className,
    text
  ) {
    const element =
      document.createElement(
        tag
      );

    if (
      className
    ) {
      element.className =
        className;
    }

    if (
      typeof text ===
        "string"
    ) {
      element.textContent =
        text;
    }

    return element;
  }

  function safeText(
    value,
    fallback =
      "정보 없음"
  ) {
    return (
      typeof value ===
        "string" &&
      value.trim()
    )
      ? value.trim()
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

  function safeUrl(
    value
  ) {
    try {
      const url =
        new URL(
          value
        );

      return (
        url.protocol ===
          "http:" ||
        url.protocol ===
          "https:"
      );
    } catch {
      return false;
    }
  }

  function formatDateTime(
    value
  ) {
    if (
      !value
    ) {
      return "기록 없음";
    }

    const date =
      new Date(
        value
      );

    if (
      Number
        .isNaN(
          date
            .getTime()
        )
    ) {
      return "기록 없음";
    }

    return new Intl
      .DateTimeFormat(
        "ko-KR",
        {
          year:
            "numeric",

          month:
            "2-digit",

          day:
            "2-digit",

          hour:
            "2-digit",

          minute:
            "2-digit"
        }
      )
      .format(
        date
      );
  }

  function normalizeForecast(
    raw
  ) {
    return {
      trendSummary:
        safeText(
          raw
            ?.trendSummary ??
          raw
            ?.trend_summary
        ),

      economicFactors:
        safeArray(
          raw
            ?.economicFactors ??
          raw
            ?.economic_factors
        ),

      outlook:
        raw
          ?.outlook ||
        {},

      scenarios:
        raw
          ?.scenarios ||
        {},

      actions:
        safeArray(
          raw
            ?.actions
        ),

      sources:
        safeArray(
          raw
            ?.sources
        ),

      dataSnapshot:
        raw
          ?.dataSnapshot ??
        raw
          ?.data_snapshot ??
        {},

      fetchedAt:
        raw
          ?.fetchedAt ??
        raw
          ?.fetched_at ??
        raw
          ?.created_at ??
        new Date()
          .toISOString(),

      modelUsed:
        raw
          ?.modelUsed ??
        raw
          ?.model_used ??
        ""
    };
  }

  /* =======================================================
     2. Loading messages
  ======================================================= */

  function startLoadingMessages() {
    stopLoadingMessages();

    const messages = [
      "최신 공개 자료를 검색하는 중입니다...",
      "관련 산업 동향과 경제 변수를 정리하는 중입니다...",
      "단기·중기·장기 전망을 분석하는 중입니다...",
      "시나리오별 대응 전략을 구성하는 중입니다...",
      "출처와 분석 결과를 정리하는 중입니다..."
    ];

    let index =
      0;

    window
      .KUApp
      .showStatus(
        forecastStatusCard,
        forecastStatusText,
        messages[
          index
        ]
      );

    loadingTimer =
      window
        .setInterval(
          () => {
            index =
              Math.min(
                index +
                1,
                messages
                  .length -
                1
              );

            forecastStatusText.textContent =
              messages[
                index
              ];
          },
          4500
        );
  }

  function stopLoadingMessages() {
    if (
      loadingTimer
    ) {
      window
        .clearInterval(
          loadingTimer
        );

      loadingTimer =
        null;
    }
  }

  /* =======================================================
     3. Render
  ======================================================= */

  function renderMeta(
    forecast
  ) {
    forecastMeta
      .replaceChildren();

    [
      `분석 기준 시각: ${formatDateTime(forecast.fetchedAt)}`,
      "최신 공개 자료 검색 기반 분석"
    ]
      .forEach(
        (
          text
        ) => {
          forecastMeta
            .appendChild(
              createElement(
                "span",
                "forecast-meta-chip",
                text
              )
            );
        }
      );
  }

  function renderFactors(
    factors
  ) {
    forecastFactors
      .replaceChildren();

    safeArray(
      factors
    )
      .forEach(
        (
          factor
        ) => {
          const card =
            createElement(
              "article",
              "forecast-card"
            );

          card.appendChild(
            createElement(
              "h4",
              "",
              safeText(
                factor
                  ?.name
              )
            )
          );

          const meta =
            createElement(
              "div",
              "forecast-card-meta"
            );

          meta.appendChild(
            createElement(
              "span",
              "impact-tag",
              `영향도: ${safeText(factor?.impact)}`
            )
          );

          meta.appendChild(
            createElement(
              "span",
              "direction-tag",
              `방향: ${safeText(factor?.direction)}`
            )
          );

          card.appendChild(
            meta
          );

          card.appendChild(
            createElement(
              "p",
              "",
              safeText(
                factor
                  ?.reason
              )
            )
          );

          forecastFactors
            .appendChild(
              card
            );
        }
      );
  }

  function renderOutlook(
    outlook
  ) {
    forecastOutlook
      .replaceChildren();

    [
      [
        "단기 전망 · 향후 6개월",
        outlook
          ?.shortTerm
      ],

      [
        "중기 전망 · 향후 1~2년",
        outlook
          ?.midTerm
      ],

      [
        "장기 전망 · 향후 3년 이상",
        outlook
          ?.longTerm
      ]
    ]
      .forEach(
        ([
          title,
          body
        ]) => {
          const card =
            createElement(
              "article",
              "forecast-card"
            );

          card.appendChild(
            createElement(
              "h4",
              "",
              title
            )
          );

          card.appendChild(
            createElement(
              "p",
              "",
              safeText(
                body
              )
            )
          );

          forecastOutlook
            .appendChild(
              card
            );
        }
      );
  }

  function renderScenarios(
    scenarios
  ) {
    forecastScenarios
      .replaceChildren();

    [
      [
        "낙관적 시나리오",
        scenarios
          ?.optimistic
      ],

      [
        "기준 시나리오",
        scenarios
          ?.baseline
      ],

      [
        "비관적 시나리오",
        scenarios
          ?.pessimistic
      ]
    ]
      .forEach(
        ([
          title,
          scenario
        ]) => {
          const card =
            createElement(
              "article",
              "forecast-card"
            );

          card.appendChild(
            createElement(
              "h4",
              "",
              title
            )
          );

          card.appendChild(
            createElement(
              "p",
              "",
              [
                `상황: ${safeText(scenario?.situation)}`,
                `대응 전략: ${safeText(scenario?.strategy)}`
              ]
                .join(
                  "\n\n"
                )
            )
          );

          forecastScenarios
            .appendChild(
              card
            );
        }
      );
  }

  function renderActions(
    actions
  ) {
    forecastActions
      .replaceChildren();

    safeArray(
      actions
    )
      .forEach(
        (
          action
        ) => {
          forecastActions
            .appendChild(
              createElement(
                "li",
                "forecast-action-item",
                safeText(
                  action
                )
              )
            );
        }
      );
  }

  function renderSources(
    sources
  ) {
    forecastSources
      .replaceChildren();

    if (
      safeArray(
        sources
      )
        .length ===
      0
    ) {
      forecastSources
        .appendChild(
          createElement(
            "li",
            "forecast-source-item",
            "표시 가능한 출처 링크가 없습니다."
          )
        );

      return;
    }

    safeArray(
      sources
    )
      .forEach(
        (
          source,
          index
        ) => {
          const item =
            createElement(
              "li",
              "forecast-source-item"
            );

          const title =
            safeText(
              source
                ?.title,
              "참고 자료"
            );

          if (
            safeUrl(
              source
                ?.url
            )
          ) {
            const link =
              createElement(
                "a",
                "",
                `${index + 1}. ${title}`
              );

            link.href =
              source.url;

            link.target =
              "_blank";

            link.rel =
              "noopener noreferrer";

            item.appendChild(
              link
            );
          } else {
            item.appendChild(
              document
                .createTextNode(
                  `${index + 1}. ${title}`
                )
            );
          }

          item.appendChild(
            createElement(
              "span",
              "forecast-source-note",
              [
                `게시일: ${safeText(source?.publishedAt, "확인 필요")}`,
                `활용 이유: ${safeText(source?.whyRelevant, "전망 분석 참고 자료")}`
              ]
                .join(
                  " · "
                )
            )
          );

          forecastSources
            .appendChild(
              item
            );
        }
      );
  }

  function renderForecast(
    raw
  ) {
    const forecast =
      normalizeForecast(
        raw
      );

    currentForecast =
      forecast;

    renderMeta(
      forecast
    );

    forecastTrendSummary.textContent =
      forecast
        .trendSummary;

    renderFactors(
      forecast
        .economicFactors
    );

    renderOutlook(
      forecast
        .outlook
    );

    renderScenarios(
      forecast
        .scenarios
    );

    renderActions(
      forecast
        .actions
    );

    renderSources(
      forecast
        .sources
    );

    forecastSection
      .classList
      .remove(
        "hidden"
      );

    forecastTabBadge.textContent =
      "✓ 완료";
  }

  /* =======================================================
     4. Save
  ======================================================= */

  async function saveForecast(
    forecast
  ) {
    const projectId =
      window
        .KUProjectManager
        ?.getCurrentProjectId?.();

    if (
      !projectId
    ) {
      return false;
    }

    const {
      error:
        insertError
    } =
      await supabaseClient
        .from(
          "forecasts"
        )
        .insert({
          project_id:
            projectId,

          economic_factors:
            forecast
              .economicFactors,

          outlook:
            forecast
              .outlook,

          scenarios:
            forecast
              .scenarios,

          actions:
            forecast
              .actions,

          trend_summary:
            forecast
              .trendSummary,

          sources:
            forecast
              .sources,

          data_snapshot:
            forecast
              .dataSnapshot,

          fetched_at:
            forecast
              .fetchedAt,

          model_used:
            typeof forecast
              .modelUsed ===
              "string"
              ? forecast
                  .modelUsed
              : JSON
                  .stringify(
                    forecast
                      .modelUsed
                  )
        });

    if (
      insertError
    ) {
      throw insertError;
    }

    return true;
  }

  /* =======================================================
     5. Analyze
  ======================================================= */

  async function analyzeForecast() {
    const state =
      window
        .KUApp
        .getState();

    if (
      !state
        .profile ||

      !state
        .selectedIdea ||

      !state
        .analysis
    ) {
      alert(
        "먼저 아이템 심층 분석을 완료해주세요."
      );

      return;
    }

    forecastBtn.disabled =
      true;

    refreshForecastBtn.disabled =
      true;

    startLoadingMessages();

    try {
      const raw =
        await window
          .KUApp
          .callBackendJson(
            "/api/forecast",
            {
              profile:
                state
                  .profile,

              idea:
                state
                  .selectedIdea,

              analysis:
                state
                  .analysis
            }
          );

      const forecast =
        normalizeForecast(
          raw
        );

      renderForecast(
        forecast
      );

      const saved =
        await saveForecast(
          forecast
        );

      stopLoadingMessages();

      window
        .KUApp
        .showStatus(
          forecastStatusCard,
          forecastStatusText,
          saved
            ? "최신 경제 전망 분석 및 프로젝트 저장 완료!"
            : "최신 경제 전망 분석 완료! 프로젝트를 저장하면 이후 다시 불러올 수 있습니다.",
          true
        );

      document.dispatchEvent(
        new CustomEvent(
          "ku:forecast-completed",
          {
            detail: {
              forecast
            }
          }
        )
      );

      forecastSection
        .scrollIntoView({
          behavior:
            "smooth",

          block:
            "start"
        });
    } catch (
      error
    ) {
      stopLoadingMessages();

      window
        .KUApp
        .hideStatus(
          forecastStatusCard
        );

      console.error(
        "경제 전망 분석 오류:",
        error
      );

      alert(
        `경제 전망 분석에 실패했습니다: ${error.message}`
      );
    } finally {
      forecastBtn.disabled =
        false;

      refreshForecastBtn.disabled =
        false;
    }
  }

  /* =======================================================
     6. Clear and restore
  ======================================================= */

  function clearForecastUI() {
    currentForecast =
      null;

    stopLoadingMessages();

    window
      .KUApp
      .hideStatus(
        forecastStatusCard
      );

    forecastSection
      .classList
      .add(
        "hidden"
      );

    forecastMeta
      .replaceChildren();

    forecastFactors
      .replaceChildren();

    forecastOutlook
      .replaceChildren();

    forecastScenarios
      .replaceChildren();

    forecastActions
      .replaceChildren();

    forecastSources
      .replaceChildren();

    forecastTrendSummary.textContent =
      "";

    forecastTabBadge.textContent =
      "분석 전";
  }

  function restoreForecast(
    forecast
  ) {
    renderForecast(
      forecast
    );

    window
      .KUApp
      .showStatus(
        forecastStatusCard,
        forecastStatusText,
        "저장된 최신 경제 전망을 불러왔습니다!",
        true
      );
  }

  /* =======================================================
     7. Events
  ======================================================= */

  forecastBtn
    .addEventListener(
      "click",
      analyzeForecast
    );

  refreshForecastBtn
    .addEventListener(
      "click",
      analyzeForecast
    );

  document
    .addEventListener(
      "ku:item-selected",
      clearForecastUI
    );

  document
    .addEventListener(
      "ku:recommendations-completed",
      clearForecastUI
    );

  document
    .addEventListener(
      "ku:analysis-completed",
      () => {
        window
          .KUApp
          .setForecastTabEnabled(
            true
          );
      }
    );

  document
    .addEventListener(
      "ku:project-loaded",
      (
        event
      ) => {
        const forecast =
          event
            .detail
            ?.forecast;

        if (
          forecast
        ) {
          restoreForecast(
            forecast
          );

          window
            .KUApp
            .setForecastTabEnabled(
              true
            );
        } else {
          clearForecastUI();
        }
      }
    );

  /* =======================================================
     8. Public API
  ======================================================= */

  window.KUForecastManager = {
    getCurrentForecast() {
      return currentForecast;
    },

    restoreForecast,

    clearForecastUI
  };

  /* =======================================================
     9. Self tests
  ======================================================= */

  console.assert(
    typeof analyzeForecast ===
      "function",

    "경제 전망 분석 함수 테스트 실패"
  );

  console.assert(
    forecastBtn !==
      null,

    "경제 전망 분석 버튼 연결 테스트 실패"
  );

  console.info(
    "KU STARTUP PLANNER 경제 전망 탭 연결 완료"
  );
})();
