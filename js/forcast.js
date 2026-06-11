/* =========================================================
   KU STARTUP PLANNER
   최신 공개 자료 기반 경제 전망 UI · 저장 · 복원
========================================================= */

(() => {
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

  /* =======================================================
     1. Utility
  ======================================================= */

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
      .format(
        new Date(value)
      );
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
        raw?.outlook || {},

      scenarios:
        raw?.scenarios || {},

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
        new Date().toISOString(),

      modelUsed:
        raw?.modelUsed ??
        raw?.model_used ??
        ""
    };
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
      typeof text === "string"
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
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  }

  /* =======================================================
     2. Render
  ======================================================= */

  function renderMeta(forecast) {
    forecastMeta.replaceChildren();

    [
      `분석 기준 시각: ${formatDateTime(
        forecast.fetchedAt
      )}`,
      "최신 공개 자료 검색 기반 분석"
    ].forEach(
      (text) => {
        forecastMeta.appendChild(
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
    forecastFactors.replaceChildren();

    safeArray(factors).forEach(
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
              factor.name
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
              factor.impact
            )}`
          )
        );

        meta.appendChild(
          createElement(
            "span",
            "direction-tag",
            `방향: ${safeText(
              factor.direction
            )}`
          )
        );

        const paragraph =
          createElement(
            "p",
            "",
            safeText(
              factor.reason
            )
          );

        card.appendChild(heading);
        card.appendChild(meta);
        card.appendChild(paragraph);

        forecastFactors.appendChild(
          card
        );
      }
    );
  }

  function renderOutlook(outlook) {
    forecastOutlook.replaceChildren();

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

        forecastOutlook.appendChild(
          card
        );
      }
    );
  }

  function renderScenarios(scenarios) {
    forecastScenarios.replaceChildren();

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
            `상황: ${safeText(
              scenario?.situation
            )}\n\n대응 전략: ${safeText(
              scenario?.strategy
            )}`
          )
        );

        forecastScenarios.appendChild(
          card
        );
      }
    );
  }

  function renderActions(actions) {
    forecastActions.replaceChildren();

    safeArray(actions).forEach(
      (action) => {
        forecastActions.appendChild(
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
    forecastSources.replaceChildren();

    if (
      safeArray(sources).length === 0
    ) {
      forecastSources.appendChild(
        createElement(
          "li",
          "forecast-source-item",
          "표시 가능한 출처 링크가 없습니다."
        )
      );

      return;
    }

    safeArray(sources).forEach(
      (source, index) => {
        const item =
          createElement(
            "li",
            "forecast-source-item"
          );

        const url =
          source?.url;

        if (
          isSafeUrl(url)
        ) {
          const link =
            createElement(
              "a",
              "",
              `${index + 1}. ${safeText(
                source.title,
                "참고 자료"
              )}`
            );

          link.href =
            url;

          link.target =
            "_blank";

          link.rel =
            "noopener noreferrer";

          item.appendChild(link);
        } else {
          item.textContent =
            `${index + 1}. ${safeText(
              source?.title,
              "참고 자료"
            )}`;
        }

        forecastSources.appendChild(
          item
        );
      }
    );
  }

  function renderForecast(rawForecast) {
    const forecast =
      normalizeForecast(
        rawForecast
      );

    currentForecast =
      forecast;

    renderMeta(forecast);

    forecastTrendSummary.textContent =
      forecast.trendSummary;

    renderFactors(
      forecast.economicFactors
    );

    renderOutlook(
      forecast.outlook
    );

    renderScenarios(
      forecast.scenarios
    );

    renderActions(
      forecast.actions
    );

    renderSources(
      forecast.sources
    );

    forecastSection.classList.remove(
      "hidden"
    );
  }

  /* =======================================================
     3. Save
  ======================================================= */

  async function saveForecast(
    forecast
  ) {
    const projectId =
      window
        .KUProjectManager
        ?.getCurrentProjectId();

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
            forecast.economicFactors,

          outlook:
            forecast.outlook,

          scenarios:
            forecast.scenarios,

          actions:
            forecast.actions,

          trend_summary:
            forecast.trendSummary,

          sources:
            forecast.sources,

          data_snapshot:
            forecast.dataSnapshot,

          fetched_at:
            forecast.fetchedAt,

          model_used:
            typeof forecast.modelUsed ===
            "string"
              ? forecast.modelUsed
              : JSON.stringify(
                  forecast.modelUsed
                )
        });

    if (insertError) {
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

    if (updateError) {
      throw updateError;
    }

    return true;
  }

  /* =======================================================
     4. Analyze
  ======================================================= */

  async function analyzeLatestForecast() {
    if (
      !currentProfile ||
      !selectedIdea ||
      !currentAnalysis
    ) {
      alert(
        "먼저 추천 아이템을 선택하고 심층 분석을 완료해주세요."
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

    forecastStatusCard.scrollIntoView({
      behavior: "smooth",
      block: "center"
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
          : "최신 경제 전망 분석 완료! 프로젝트를 저장하면 이후 다시 불러올 수 있습니다.",
        true
      );

      forecastSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
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

  /* =======================================================
     5. Restore and clear
  ======================================================= */

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

    forecastSection.classList.add(
      "hidden"
    );

    forecastMeta.replaceChildren();
    forecastFactors.replaceChildren();
    forecastOutlook.replaceChildren();
    forecastScenarios.replaceChildren();
    forecastActions.replaceChildren();
    forecastSources.replaceChildren();

    forecastTrendSummary.textContent =
      "";
  }

  /* =======================================================
     6. Existing function extensions
  ======================================================= */

  const originalSelectIdea =
    selectIdea;

  selectIdea =
    async function selectIdeaWithForecastReset(
      index
    ) {
      clearForecastUI();

      await originalSelectIdea(
        index
      );
    };

  const originalResetApp =
    resetApp;

  resetApp =
    function resetAppWithForecastReset() {
      clearForecastUI();

      originalResetApp();
    };

  /* =======================================================
     7. Events and API
  ======================================================= */

  forecastButton.addEventListener(
    "click",
    analyzeLatestForecast
  );

  refreshForecastButton.addEventListener(
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

  console.info(
    "KU STARTUP PLANNER 경제 전망 기능 연결 완료"
  );
})();
