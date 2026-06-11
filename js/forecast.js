/* =========================================================
   KU STARTUP PLANNER
   최신 공개 자료 기반 경제 전망 UI · 저장 · 복원
========================================================= */

(() => {
  function initializeForecastManager() {
    /* =====================================================
       1. DOM 연결
    ===================================================== */

    const forecastButton =
      document.getElementById("forecastBtn");

    const refreshForecastButton =
      document.getElementById("refreshForecastBtn");

    const forecastStatusCard =
      document.getElementById("forecastStatusCard");

    const forecastStatusText =
      document.getElementById("forecastStatusText");

    const forecastSection =
      document.getElementById("forecastSection");

    const forecastMeta =
      document.getElementById("forecastMeta");

    const forecastTrendSummary =
      document.getElementById("forecastTrendSummary");

    const forecastFactors =
      document.getElementById("forecastFactors");

    const forecastOutlook =
      document.getElementById("forecastOutlook");

    const forecastScenarios =
      document.getElementById("forecastScenarios");

    const forecastActions =
      document.getElementById("forecastActions");

    const forecastSources =
      document.getElementById("forecastSources");

    let currentForecast =
      null;

    /* =====================================================
       2. 초기 검증
    ===================================================== */

    function validateRequiredElements() {
      const requiredElements = [
        ["forecastBtn", forecastButton],
        ["refreshForecastBtn", refreshForecastButton],
        ["forecastStatusCard", forecastStatusCard],
        ["forecastStatusText", forecastStatusText],
        ["forecastSection", forecastSection],
        ["forecastMeta", forecastMeta],
        ["forecastTrendSummary", forecastTrendSummary],
        ["forecastFactors", forecastFactors],
        ["forecastOutlook", forecastOutlook],
        ["forecastScenarios", forecastScenarios],
        ["forecastActions", forecastActions],
        ["forecastSources", forecastSources]
      ];

      const missingIds =
        requiredElements
          .filter(([, element]) => !element)
          .map(([id]) => id);

      if (
        missingIds.length >
        0
      ) {
        console.error(
          "경제 전망 UI 요소를 찾지 못했습니다:",
          missingIds
        );

        return false;
      }

      return true;
    }

    if (
      !validateRequiredElements()
    ) {
      return;
    }

    /* =====================================================
       3. 공통 유틸리티
    ===================================================== */

    function safeArray(value) {
      return Array.isArray(value)
        ? value
        : [];
    }

    function safeText(
      value,
      fallback = "정보 없음"
    ) {
      return (
        typeof value === "string" &&
        value.trim()
      )
        ? value.trim()
        : fallback;
    }

    function formatDateTime(value) {
      if (!value) {
        return "기록 없음";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "기록 없음";
      }

      return new Intl
        .DateTimeFormat(
          "ko-KR",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          }
        )
        .format(date);
    }

    function createElement(
      tag,
      className,
      text
    ) {
      const element =
        document.createElement(tag);

      if (className) {
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

    function isSafeUrl(value) {
      try {
        const url =
          new URL(value);

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

    function normalizeForecast(raw) {
      return {
        trendSummary:
          safeText(
            raw?.trendSummary ??
            raw?.trend_summary
          ),

        economicFactors:
          safeArray(
            raw?.economicFactors ??
            raw?.economic_factors
          ),

        outlook:
          raw?.outlook ||
          {},

        scenarios:
          raw?.scenarios ||
          {},

        actions:
          safeArray(
            raw?.actions
          ),

        sources:
          safeArray(
            raw?.sources
          ),

        dataSnapshot:
          raw?.dataSnapshot ??
          raw?.data_snapshot ??
          {},

        fetchedAt:
          raw?.fetchedAt ??
          raw?.fetched_at ??
          raw?.created_at ??
          new Date()
            .toISOString(),

        modelUsed:
          raw?.modelUsed ??
          raw?.model_used ??
          ""
      };
    }

    /* =====================================================
       4. 렌더링
    ===================================================== */

    function renderMeta(forecast) {
      forecastMeta
        .replaceChildren();

      [
        `분석 기준 시각: ${formatDateTime(
          forecast.fetchedAt
        )}`,

        "분석 시점에 확인 가능한 최신 공개 자료 반영"
      ].forEach(
        (text) => {
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

    function renderFactors(factors) {
      forecastFactors
        .replaceChildren();

      const safeFactors =
        safeArray(factors);

      if (
        safeFactors.length ===
        0
      ) {
        forecastFactors
          .appendChild(
            createElement(
              "article",
              "forecast-card",
              "표시 가능한 경제·산업 변수가 없습니다."
            )
          );

        return;
      }

      safeFactors.forEach(
        (factor) => {
          const card =
            createElement(
              "article",
              "forecast-card"
            );

          const heading =
            createElement(
              "h4",
              "",
              safeText(
                factor?.name
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
              `영향도: ${safeText(
                factor?.impact
              )}`
            )
          );

          meta.appendChild(
            createElement(
              "span",
              "direction-tag",
              `방향: ${safeText(
                factor?.direction
              )}`
            )
          );

          const paragraph =
            createElement(
              "p",
              "",
              safeText(
                factor?.reason
              )
            );

          card.appendChild(
            heading
          );

          card.appendChild(
            meta
          );

          card.appendChild(
            paragraph
          );

          forecastFactors
            .appendChild(
              card
            );
        }
      );
    }

    function renderOutlook(outlook) {
      forecastOutlook
        .replaceChildren();

      [
        [
          "단기 전망",
          "향후 6개월",
          outlook?.shortTerm
        ],

        [
          "중기 전망",
          "향후 1~2년",
          outlook?.midTerm
        ],

        [
          "장기 전망",
          "향후 3년 이상",
          outlook?.longTerm
        ]
      ].forEach(
        ([
          title,
          period,
          content
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
              `${title} · ${period}`
            )
          );

          card.appendChild(
            createElement(
              "p",
              "",
              safeText(content)
            )
          );

          forecastOutlook
            .appendChild(
              card
            );
        }
      );
    }

    function renderScenarios(scenarios) {
      forecastScenarios
        .replaceChildren();

      [
        [
          "낙관적 시나리오",
          scenarios?.optimistic
        ],

        [
          "기준 시나리오",
          scenarios?.baseline
        ],

        [
          "비관적 시나리오",
          scenarios?.pessimistic
        ]
      ].forEach(
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
                `상황: ${safeText(
                  scenario?.situation
                )}`,

                `대응 전략: ${safeText(
                  scenario?.strategy
                )}`
              ].join(
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

    function renderActions(actions) {
      forecastActions
        .replaceChildren();

      const safeActions =
        safeArray(actions);

      if (
        safeActions.length ===
        0
      ) {
        forecastActions
          .appendChild(
            createElement(
              "li",
              "forecast-action-item",
              "표시 가능한 대응 행동이 없습니다."
            )
          );

        return;
      }

      safeActions.forEach(
        (action) => {
          forecastActions
            .appendChild(
              createElement(
                "li",
                "forecast-action-item",
                safeText(action)
              )
            );
        }
      );
    }

    function renderSources(sources) {
      forecastSources
        .replaceChildren();

      const safeSources =
        safeArray(sources);

      if (
        safeSources.length ===
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

      safeSources.forEach(
        (
          source,
          index
        ) => {
          const item =
            createElement(
              "li",
              "forecast-source-item"
            );

          const url =
            source?.url;

          const title =
            safeText(
              source?.title,
              "참고 자료"
            );

          if (
            isSafeUrl(url)
          ) {
            const link =
              createElement(
                "a",
                "",
                `${index + 1}. ${title}`
              );

            link.href =
              url;

            link.target =
              "_blank";

            link.rel =
              "noopener noreferrer";

            item.appendChild(
              link
            );
          } else {
            item.textContent =
              `${index + 1}. ${title}`;
          }

          forecastSources
            .appendChild(
              item
            );
        }
      );
    }

    function renderForecast(
      rawForecast
    ) {
      const forecast =
        normalizeForecast(
          rawForecast
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
        .remove("hidden");
    }

    /* =====================================================
       5. Supabase 저장
    ===================================================== */

    async function saveForecast(
      forecast
    ) {
      const projectId =
        window
          .KUProjectManager
          ?.getCurrentProjectId?.();

      if (!projectId) {
        return false;
      }

      const {
        error:
          insertError
      } =
        await supabaseClient
          .from("forecasts")
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
                : JSON.stringify(
                    forecast
                      .modelUsed
                  )
          });

      if (
        insertError
      ) {
        throw insertError;
      }

      const {
        error:
          updateError
      } =
        await supabaseClient
          .from("projects")
          .update({
            status:
              "forecasted"
          })
          .eq(
            "id",
            projectId
          );

      if (
        updateError
      ) {
        throw updateError;
      }

      return true;
    }

    /* =====================================================
       6. 최신 경제 전망 분석 실행
    ===================================================== */

    async function analyzeLatestForecast() {
      console.info(
        "경제 전망 분석 버튼 클릭 감지"
      );

      if (
        !currentProfile
      ) {
        alert(
          "사용자 조건 정보가 없습니다. 먼저 창업 아이템 추천을 받아주세요."
        );

        return;
      }

      if (
        !selectedIdea
      ) {
        alert(
          "선택한 창업 아이템이 없습니다. 먼저 추천 아이템 하나를 분석해주세요."
        );

        return;
      }

      if (
        !currentAnalysis
      ) {
        alert(
          "심층 분석 결과가 없습니다. 먼저 아이템 심층 분석을 완료해주세요."
        );

        return;
      }

      forecastButton.disabled =
        true;

      refreshForecastButton.disabled =
        true;

      showStatus(
        forecastStatusCard,
        forecastStatusText,
        "최신 공개 자료를 검색하고 경제 전망을 분석하는 중입니다..."
      );

      forecastStatusCard
        .scrollIntoView({
          behavior:
            "smooth",

          block:
            "center"
        });

      try {
        const result =
          await callBackendJson(
            "/api/forecast",
            {
              profile:
                currentProfile,

              idea:
                selectedIdea,

              analysis:
                currentAnalysis
            }
          );

        const forecast =
          normalizeForecast(
            result
          );

        renderForecast(
          forecast
        );

        const saved =
          await saveForecast(
            forecast
          );

        showStatus(
          forecastStatusCard,
          forecastStatusText,

          saved
            ? "최신 경제 전망 분석 및 프로젝트 저장 완료!"
            : "최신 경제 전망 분석 완료! 프로젝트를 먼저 저장하면 이후 다시 불러올 수 있습니다.",

          true
        );

        forecastSection
          .scrollIntoView({
            behavior:
              "smooth",

            block:
              "start"
          });
      } catch (error) {
        console.error(
          "경제 전망 분석 오류:",
          error
        );

        alert(
          `경제 전망 분석에 실패했습니다: ${error.message}`
        );

        hideStatus(
          forecastStatusCard
        );
      } finally {
        forecastButton.disabled =
          false;

        refreshForecastButton.disabled =
          false;
      }
    }

    /* =====================================================
       7. 저장된 전망 복원
    ===================================================== */

    function restoreForecast(
      savedForecast
    ) {
      renderForecast(
        savedForecast
      );

      showStatus(
        forecastStatusCard,
        forecastStatusText,
        "저장된 최신 경제 전망을 불러왔습니다!",
        true
      );
    }

    function clearForecastUI() {
      currentForecast =
        null;

      hideStatus(
        forecastStatusCard
      );

      forecastSection
        .classList
        .add("hidden");

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
    }

    /* =====================================================
       8. 기존 기능 확장
    ===================================================== */

    const originalSelectIdea =
      window.selectIdea;

    if (
      typeof originalSelectIdea ===
      "function"
    ) {
      window.selectIdea =
        async function selectIdeaWithForecastReset(
          index
        ) {
          clearForecastUI();

          await originalSelectIdea(
            index
          );
        };
    } else {
      console.warn(
        "selectIdea 함수를 찾지 못했습니다."
      );
    }

    const originalResetApp =
      window.resetApp;

    if (
      typeof originalResetApp ===
      "function"
    ) {
      window.resetApp =
        function resetAppWithForecastReset() {
          clearForecastUI();

          originalResetApp();
        };
    }

    /* =====================================================
       9. 이벤트 연결
    ===================================================== */

    forecastButton
      .addEventListener(
        "click",
        analyzeLatestForecast
      );

    refreshForecastButton
      .addEventListener(
        "click",
        analyzeLatestForecast
      );

    window.KUForecastManager = {
      restoreForecast,
      clearForecastUI,

      getCurrentForecast() {
        return currentForecast;
      }
    };

    /* =====================================================
       10. 자체 테스트
    ===================================================== */

    console.assert(
      typeof analyzeLatestForecast ===
        "function",
      "경제 전망 분석 함수 연결 실패"
    );

    console.assert(
      forecastButton !==
        null,
      "경제 전망 분석 버튼 연결 실패"
    );

    console.info(
      "KU STARTUP PLANNER 경제 전망 기능 연결 완료"
    );
  }

  /* =======================================================
     DOM 로딩 안전 처리
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {
    document
      .addEventListener(
        "DOMContentLoaded",
        initializeForecastManager
      );
  } else {
    initializeForecastManager();
  }
})();
