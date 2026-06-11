from pathlib import Path

INDEX_PATH = Path("index.html")

text = INDEX_PATH.read_text(encoding="utf-8")

start_marker = """    async function analyzeForecast() {"""

end_marker = """    /* =====================================================
       14. Database Save
    ===================================================== */"""

if start_marker not in text:
    raise RuntimeError(
        "analyzeForecast 함수 시작점을 찾지 못했습니다."
    )

if end_marker not in text:
    raise RuntimeError(
        "Database Save 섹션 시작점을 찾지 못했습니다."
    )

start_index = text.index(start_marker)
end_index = text.index(end_marker)

replacement = r'''    const FORECAST_JOB_STORAGE_KEY =
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

'''

text = (
    text[:start_index]
    + replacement
    + text[end_index:]
)

old_binding = '''    get("forecastBtn").addEventListener(
      "click",
      analyzeForecast
    );

    get("refreshForecastBtn").addEventListener(
      "click",
      analyzeForecast
    );'''

new_binding = '''    get("forecastBtn").addEventListener(
      "click",
      () => {
        analyzeForecast({
          forceRefresh:
            false
        });
      }
    );

    get("refreshForecastBtn").addEventListener(
      "click",
      () => {
        analyzeForecast({
          forceRefresh:
            true
        });
      }
    );'''

if old_binding not in text:
    raise RuntimeError(
        "경제 전망 버튼 이벤트 연결부를 찾지 못했습니다."
    )

text = text.replace(
    old_binding,
    new_binding,
    1
)

INDEX_PATH.write_text(
    text,
    encoding="utf-8"
)

print(
    "index.html 경제 전망 background polling 패치 완료"
)