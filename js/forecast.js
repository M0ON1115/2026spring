/* KU STARTUP PLANNER - refactored front-end */



    /* =====================================================
       13. Forecast
    ===================================================== */

    let forecastLoadingTimer =
      null;

    function startForecastLoading() {
      const messages = [
        "최신 공개 자료를 검색하는 중입니다...",
        "관련 산업 동향을 정리하는 중입니다...",
        "경제 변수와 시나리오를 분석하는 중입니다...",
        "출처와 대응 전략을 정리하는 중입니다..."
      ];

      let index =
        0;

      showStatus(
        "forecastStatusCard",
        "forecastStatusText",
        messages[index]
      );

      forecastLoadingTimer =
        window.setInterval(
          () => {
            index =
              Math.min(
                index + 1,
                messages.length - 1
              );

            get("forecastStatusText").textContent =
              messages[index];
          },
          4500
        );
    }

    function stopForecastLoading() {
      if (
        forecastLoadingTimer
      ) {
        window.clearInterval(
          forecastLoadingTimer
        );

        forecastLoadingTimer =
          null;
      }
    }

    function safeUrl(url) {
      try {
        const parsed =
          new URL(url);

        return (
          parsed.protocol === "http:" ||
          parsed.protocol === "https:"
        );
      } catch {
        return false;
      }
    }

    function formatDirectionSymbol(
      factor
    ) {
      const score =
        Number(
          factor
            ?.directionScore
        );

      if (
        Number
          .isFinite(
            score
          )
      ) {
        if (
          score >
          0
        ) {
          return "(+)";
        }

        if (
          score <
          0
        ) {
          return "(-)";
        }

        return "(±)";
      }

      const direction =
        String(
          factor
            ?.direction ||
          ""
        )
          .trim();

      if (
        /긍정|증가|확대|상승|기회|성장|개선|활성화|수요 형성|수요 증가/.test(
          direction
        )
      ) {
        return "(+)";
      }

      if (
        /부정|감소|축소|하락|부담|위험|규제|경쟁 심화|비용 증가|지불 여력 저하/.test(
          direction
        )
      ) {
        return "(-)";
      }

      if (
        /양면|혼합|불확실|변동|상충|모호|판단 보류/.test(
          direction
        )
      ) {
        return "(±)";
      }

      return "(?)";
    }

    function renderForecast() {
      const forecast =
        state.forecast;

      clear(
        get("forecastMeta")
      );

      clear(
        get("forecastFactors")
      );

      clear(
        get("forecastOutlook")
      );

      clear(
        get("forecastScenarios")
      );

      clear(
        get("forecastActions")
      );

      clear(
        get("forecastSources")
      );

      get("forecastMeta").appendChild(
        createElement(
          "span",
          "forecast-meta-chip",
          `분석 기준 시각: ${
            new Intl.DateTimeFormat(
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
            ).format(
              new Date(
                forecast.fetchedAt
              )
            )
          }`
        )
      );

      get("forecastMeta").appendChild(
        createElement(
          "span",
          "forecast-meta-chip",
          "최신 공개 자료 검색 기반 분석"
        )
      );

      get("forecastTrendSummary").textContent =
        forecast.trendSummary;

      forecast.economicFactors.forEach(
        (factor) => {
          const card =
            createElement(
              "article",
              "forecast-card"
            );

          card.appendChild(
            createElement(
              "h4",
              "",
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
              factor.impact || "영향 설명 없음"
            )
          );

          meta.appendChild(
            createElement(
              "span",
              "direction-tag",
              `방향: ${formatDirectionSymbol(factor)} ${factor.direction || "설명 없음"}`
            )
          );

          card.appendChild(meta);

          card.appendChild(
            createElement(
              "p",
              "",
              factor.reason
            )
          );

          get("forecastFactors").appendChild(
            card
          );
        }
      );

      [
        [
          "단기 전망 · 향후 6개월",
          forecast.outlook.shortTerm
        ],

        [
          "중기 전망 · 향후 1~2년",
          forecast.outlook.midTerm
        ],

        [
          "장기 전망 · 향후 3년 이상",
          forecast.outlook.longTerm
        ]
      ].forEach(
        ([title, content]) => {
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
              content
            )
          );

          get("forecastOutlook").appendChild(
            card
          );
        }
      );

      [
        [
          "낙관적 시나리오",
          forecast.scenarios.optimistic
        ],

        [
          "기준 시나리오",
          forecast.scenarios.baseline
        ],

        [
          "비관적 시나리오",
          forecast.scenarios.pessimistic
        ]
      ].forEach(
        ([title, scenario]) => {
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
              `상황: ${scenario.situation}\n\n대응 전략: ${scenario.strategy}`
            )
          );

          get("forecastScenarios").appendChild(
            card
          );
        }
      );

      forecast.actions.forEach(
        (action) => {
          get("forecastActions").appendChild(
            createElement(
              "li",
              "forecast-action-item",
              action
            )
          );
        }
      );

      forecast.sources.forEach(
        (source, index) => {
          const item =
            createElement(
              "li",
              "forecast-source-item"
            );

          if (
            safeUrl(
              source.url
            )
          ) {
            const link =
              createElement(
                "a",
                "",
                `${index + 1}. ${source.title}`
              );

            link.href =
              source.url;

            link.target =
              "_blank";

            link.rel =
              "noopener noreferrer";

            item.appendChild(link);
          } else {
            item.appendChild(
              document.createTextNode(
                `${index + 1}. ${source.title}`
              )
            );
          }

          get("forecastSources").appendChild(
            item
          );
        }
      );

      get("forecastSection").classList.remove(
        "hidden"
      );

      get("forecastTabBadge").textContent =
        "✓ 완료";
    }

    function clearForecastUI() {
      state.forecast =
        null;

      get("forecastSection").classList.add(
        "hidden"
      );

      get("forecastTabBadge").textContent =
        "분석 전";

      hideStatus(
        "forecastStatusCard"
      );
    }

    const FORECAST_JOB_STORAGE_KEY =
      "kuStartupPlannerForecastJob";

    const FORECAST_CACHE_DURATION_MS =
      24 *
      60 *
      60 *
      1000;

    const FORECAST_POLL_INTERVAL_MS =
      4000;

    const FORECAST_JOB_EXPIRATION_MS =
      10 *
      60 *
      1000;

    function sleep(
      milliseconds
    ) {
      return new Promise(
        (
          resolve
        ) => {
          window.setTimeout(
            resolve,
            milliseconds
          );
        }
      );
    }

    function getForecastJobSignature() {
      return JSON.stringify({
        name:
          state
            .selectedIdea
            ?.name ||
          "",

        summary:
          state
            .selectedIdea
            ?.summary ||
          "",

        customer:
          state
            .selectedIdea
            ?.customer ||
          "",

        revenue:
          state
            .selectedIdea
            ?.revenue ||
          ""
      });
    }

    function saveStoredForecastJob(
      job
    ) {
      window
        .localStorage
        .setItem(
          FORECAST_JOB_STORAGE_KEY,
          JSON.stringify(
            job
          )
        );
    }

    function loadStoredForecastJob() {
      try {
        const raw =
          window
            .localStorage
            .getItem(
              FORECAST_JOB_STORAGE_KEY
            );

        if (!raw) {
          return null;
        }

        const job =
          JSON.parse(
            raw
          );

        if (
          !job
            ?.responseId ||
          !job
            ?.startedAt ||
          !job
            ?.signature
        ) {
          return null;
        }

        if (
          Date.now() -
          Number(
            job.startedAt
          ) >
          FORECAST_JOB_EXPIRATION_MS
        ) {
          clearStoredForecastJob();

          return null;
        }

        return job;
      } catch {
        return null;
      }
    }

    function clearStoredForecastJob() {
      window
        .localStorage
        .removeItem(
          FORECAST_JOB_STORAGE_KEY
        );
    }

    function isForecastFresh(
      forecast
    ) {
      if (
        !forecast
          ?.fetchedAt
      ) {
        return false;
      }

      const fetchedAt =
        new Date(
          forecast
            .fetchedAt
        )
          .getTime();

      if (
        Number
          .isNaN(
            fetchedAt
          )
      ) {
        return false;
      }

      return (
        Date.now() -
        fetchedAt
      ) <
        FORECAST_CACHE_DURATION_MS;
    }

    function setForecastPollingMessage(
      status
    ) {
      if (
        status ===
        "queued"
      ) {
        get(
          "forecastStatusText"
        ).textContent =
          "경제 전망 분석 요청이 접수되었습니다. 조사 순서를 기다리는 중입니다...";

        return;
      }

      get(
        "forecastStatusText"
      ).textContent =
        "최신 공개 자료를 검색하고 핵심 근거를 선별하는 중입니다...";
    }

    async function pollForecastJob(
      job
    ) {
      while (
        Date.now() -
        Number(
          job.startedAt
        ) <
        FORECAST_JOB_EXPIRATION_MS
      ) {
        const result =
          await callApi(
            "/api/forecast/status",
            {
              responseId:
                job.responseId
            }
          );

        if (
          result.status ===
            "queued" ||
          result.status ===
            "in_progress"
        ) {
          setForecastPollingMessage(
            result.status
          );

          await sleep(
            FORECAST_POLL_INTERVAL_MS
          );

          continue;
        }

        if (
          result.status ===
            "completed" &&
          result.forecast
        ) {
          return result
            .forecast;
        }

        throw new Error(
          result.error ||
          "경제 전망 분석 작업이 정상적으로 완료되지 않았습니다."
        );
      }

      throw new Error(
        "경제 전망 분석이 예상보다 오래 걸리고 있습니다. 잠시 후 다시 버튼을 누르면 진행 중인 작업을 이어서 확인합니다."
      );
    }

    async function analyzeForecast({
      forceRefresh =
        false
    } = {}) {
      if (
        !state.profile ||
        !state.selectedIdea ||
        !state.analysis
      ) {
        alert(
          "먼저 기본 분석을 완료해주세요."
        );

        return;
      }

      if (
        !forceRefresh &&
        isForecastFresh(
          state.forecast
        )
      ) {
        renderForecast();

        showStatus(
          "forecastStatusCard",
          "forecastStatusText",
          "24시간 이내에 생성된 최신 경제 전망을 불러왔습니다.",
          true
        );

        return;
      }

      console.info(
        "최신 경제 동향 background 분석 시작"
      );

      get(
        "forecastBtn"
      ).disabled =
        true;

      get(
        "refreshForecastBtn"
      ).disabled =
        true;

      startForecastLoading();

      try {
        const signature =
          getForecastJobSignature();

        let job =
          loadStoredForecastJob();

        if (
          !job ||
          job.signature !==
            signature
        ) {
          const startResult =
            await callApi(
              "/api/forecast/start",
              {
                profile:
                  state.profile,

                idea:
                  state.selectedIdea,

                analysis:
                  state.analysis
              }
            );

          job = {
            responseId:
              startResult
                .responseId,

            startedAt:
              Date.now(),

            signature
          };

          saveStoredForecastJob(
            job
          );
        }

        state.forecast =
          normalizeForecast(
            await pollForecastJob(
              job
            )
          );

        clearStoredForecastJob();

        renderForecast();

        await saveForecastIfNeeded();

        stopForecastLoading();

        showStatus(
          "forecastStatusCard",
          "forecastStatusText",
          state.currentProjectId
            ? "최신 경제 전망 분석 및 프로젝트 저장 완료!"
            : "최신 경제 전망 분석 완료! 프로젝트를 저장하면 이후 다시 불러올 수 있습니다.",
          true
        );
      } catch (error) {
        stopForecastLoading();

        hideStatus(
          "forecastStatusCard"
        );

        console.error(
          "경제 전망 background 분석 오류:",
          error
        );

        alert(
          `경제 전망 분석에 실패했습니다: ${error.message}`
        );
      } finally {
        get(
          "forecastBtn"
        ).disabled =
          false;

        get(
          "refreshForecastBtn"
        ).disabled =
          false;
      }
    }
