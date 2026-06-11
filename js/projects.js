/* =========================================================
   KU STARTUP PLANNER
   프로젝트 저장 · 조회 · 상태 동기화
   이벤트 기반 구조
========================================================= */

(() => {
  const get =
    (id) =>
      document
        .getElementById(
          id
        );

  const saveProjectBtn =
    get(
      "saveProjectBtn"
    );

  const myProjectsBtn =
    get(
      "myProjectsBtn"
    );

  const projectsModal =
    get(
      "projectsModal"
    );

  const closeProjectsModalBtn =
    get(
      "closeProjectsModalBtn"
    );

  const newProjectBtn =
    get(
      "newProjectBtn"
    );

  const projectList =
    get(
      "projectList"
    );

  let currentProjectId =
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

  async function getUser() {
    const {
      data: {
        user
      },

      error
    } =
      await supabaseClient
        .auth
        .getUser();

    if (
      error
    ) {
      console.error(
        "사용자 확인 오류:",
        error
      );

      return null;
    }

    return (
      user ||
      null
    );
  }

  function getForecast() {
    return (
      window
        .KUForecastManager
        ?.getCurrentForecast?.() ||
      null
    );
  }

  function deriveStatus({
    selectedIdea,
    analysis,
    forecast
  }) {
    if (
      forecast
    ) {
      return "forecasted";
    }

    if (
      analysis
    ) {
      return "analyzed";
    }

    if (
      selectedIdea
    ) {
      return "selected";
    }

    return "recommended";
  }

  function statusLabel(
    status
  ) {
    const labels = {
      draft:
        "아이디어 탐색",

      recommended:
        "추천 아이템 검토 중",

      selected:
        "아이템 선택 완료",

      analyzed:
        "심층 분석 완료",

      forecasted:
        "경제 전망 완료"
    };

    return (
      labels[
        status
      ] ||
      "진행 중"
    );
  }

  function progressValue(
    status
  ) {
    const values = {
      draft:
        10,

      recommended:
        25,

      selected:
        40,

      analyzed:
        60,

      forecasted:
        75
    };

    return (
      values[
        status
      ] ||
      10
    );
  }

  function nextAction(
    status
  ) {
    const actions = {
      draft:
        "사용자 조건을 입력하고 창업 아이템 추천을 받아보세요.",

      recommended:
        "추천 아이템 중 하나를 선택하고 심층 분석을 진행해보세요.",

      selected:
        "선택한 아이템의 심층 분석을 완료해보세요.",

      analyzed:
        "최신 공개 자료 기반 경제 전망 분석을 진행해보세요.",

      forecasted:
        "시장 검증을 위한 실행 체크리스트를 작성해보세요."
    };

    return (
      actions[
        status
      ] ||
      "다음 단계를 확인해주세요."
    );
  }

  function averageScore(
    scores
  ) {
    const values =
      Object
        .values(
          scores ||
          {}
        )
        .map(
          Number
        )
        .filter(
          Number
            .isFinite
        );

    if (
      values.length ===
      0
    ) {
      return null;
    }

    return Math.round(
      values
        .reduce(
          (
            sum,
            value
          ) =>
            sum +
            value,
          0
        ) /
      values.length
    );
  }

  function formatDate(
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
            "2-digit"
        }
      )
      .format(
        date
      );
  }

  function projectTitle(
    state
  ) {
    if (
      state
        .selectedIdea
        ?.name
    ) {
      return state
        .selectedIdea
        .name;
    }

    const keyword =
      state
        .profile
        ?.interests
        ?.split(",")
        ?.[0]
        ?.trim();

    return keyword
      ? `${keyword} 창업 프로젝트`
      : "새 창업 프로젝트";
  }

  function updateSaveButton({
    saved = false,
    loading = false
  } = {}) {
    saveProjectBtn
      .classList
      .remove(
        "hidden"
      );

    saveProjectBtn.disabled =
      saved ||
      loading;

    saveProjectBtn.textContent =
      loading
        ? "프로젝트를 저장하는 중입니다..."
        : saved
          ? "프로젝트 저장 완료 ✓"
          : "프로젝트로 저장하기";
  }

  function openProjectsModal() {
    projectsModal
      .classList
      .remove(
        "hidden"
      );
  }

  function closeProjectsModal() {
    projectsModal
      .classList
      .add(
        "hidden"
      );
  }

  /* =======================================================
     2. Payload
  ======================================================= */

  function analysisPayload(
    projectId,
    analysis
  ) {
    return {
      project_id:
        projectId,

      scores:
        analysis
          ?.scores ||
        {},

      sections:
        analysis
          ?.sections ||
        {},

      summary:
        analysis
          ?.summary ||
        ""
    };
  }

  function forecastPayload(
    projectId,
    forecast
  ) {
    return {
      project_id:
        projectId,

      economic_factors:
        forecast
          ?.economicFactors ||
        forecast
          ?.economic_factors ||
        [],

      outlook:
        forecast
          ?.outlook ||
        {},

      scenarios:
        forecast
          ?.scenarios ||
        {},

      actions:
        forecast
          ?.actions ||
        [],

      trend_summary:
        forecast
          ?.trendSummary ||
        forecast
          ?.trend_summary ||
        "",

      sources:
        forecast
          ?.sources ||
        [],

      data_snapshot:
        forecast
          ?.dataSnapshot ||
        forecast
          ?.data_snapshot ||
        {},

      fetched_at:
        forecast
          ?.fetchedAt ||
        forecast
          ?.fetched_at ||
        new Date()
          .toISOString(),

      model_used:
        typeof (
          forecast
            ?.modelUsed ||
          forecast
            ?.model_used
        ) ===
          "string"
          ? (
              forecast
                ?.modelUsed ||
              forecast
                ?.model_used
            )
          : JSON
              .stringify(
                forecast
                  ?.modelUsed ||
                forecast
                  ?.model_used ||
                {}
              )
    };
  }

  /* =======================================================
     3. Metadata sync
  ======================================================= */

  async function syncMetadata(
    projectId,
    state,
    forecast =
      getForecast()
  ) {
    if (
      !projectId
    ) {
      return;
    }

    const status =
      deriveStatus({
        selectedIdea:
          state
            ?.selectedIdea,

        analysis:
          state
            ?.analysis,

        forecast
      });

    const payload = {
      status,

      selected_idea:
        state
          ?.selectedIdea ||
        null
    };

    if (
      state
        ?.selectedIdea
        ?.name
    ) {
      payload.title =
        state
          .selectedIdea
          .name;
    }

    const {
      error
    } =
      await supabaseClient
        .from(
          "projects"
        )
        .update(
          payload
        )
        .eq(
          "id",
          projectId
        );

    if (
      error
    ) {
      throw error;
    }
  }

  /* =======================================================
     4. Initial save
  ======================================================= */

  async function saveCurrentProject() {
    const user =
      await getUser();

    if (
      !user
    ) {
      window
        .KUApp
        .openAuthModal();

      alert(
        "프로젝트를 저장하려면 먼저 로그인해야 합니다."
      );

      return;
    }

    const state =
      window
        .KUApp
        .getState();

    if (
      !state
        .profile ||

      state
        .ideas
        .length ===
        0
    ) {
      alert(
        "먼저 창업 아이템 추천을 받아주세요."
      );

      return;
    }

    if (
      currentProjectId
    ) {
      await syncMetadata(
        currentProjectId,
        state
      );

      updateSaveButton({
        saved:
          true
      });

      return;
    }

    updateSaveButton({
      loading:
        true
    });

    let createdProjectId =
      null;

    try {
      const forecast =
        getForecast();

      const status =
        deriveStatus({
          selectedIdea:
            state
              .selectedIdea,

          analysis:
            state
              .analysis,

          forecast
        });

      const {
        data:
          project,

        error:
          projectError
      } =
        await supabaseClient
          .from(
            "projects"
          )
          .insert({
            user_id:
              user.id,

            title:
              projectTitle(
                state
              ),

            status,

            profile:
              state
                .profile,

            selected_idea:
              state
                .selectedIdea ||
              null
          })
          .select()
          .single();

      if (
        projectError
      ) {
        throw projectError;
      }

      createdProjectId =
        project.id;

      const {
        error:
          recommendationError
      } =
        await supabaseClient
          .from(
            "recommendations"
          )
          .insert({
            project_id:
              createdProjectId,

            ideas:
              state
                .ideas
          });

      if (
        recommendationError
      ) {
        throw recommendationError;
      }

      if (
        state
          .analysis
      ) {
        const {
          error:
            analysisError
        } =
          await supabaseClient
            .from(
              "analyses"
            )
            .insert(
              analysisPayload(
                createdProjectId,
                state
                  .analysis
              )
            );

        if (
          analysisError
        ) {
          throw analysisError;
        }
      }

      if (
        forecast
      ) {
        const {
          error:
            forecastError
        } =
          await supabaseClient
            .from(
              "forecasts"
            )
            .insert(
              forecastPayload(
                createdProjectId,
                forecast
              )
            );

        if (
          forecastError
        ) {
          throw forecastError;
        }
      }

      currentProjectId =
        createdProjectId;

      updateSaveButton({
        saved:
          true
      });

      alert(
        status ===
          "forecasted"
          ? "프로젝트, 심층 분석, 경제 전망을 저장했습니다."
          : status ===
              "analyzed"
            ? "프로젝트와 심층 분석 결과를 저장했습니다."
            : "프로젝트를 저장했습니다."
      );
    } catch (
      error
    ) {
      console.error(
        "프로젝트 저장 오류:",
        error
      );

      if (
        createdProjectId
      ) {
        await supabaseClient
          .from(
            "projects"
          )
          .delete()
          .eq(
            "id",
            createdProjectId
          );
      }

      updateSaveButton();

      alert(
        `프로젝트 저장에 실패했습니다: ${error.message}`
      );
    }
  }

  /* =======================================================
     5. Event-based autosave
  ======================================================= */

  document
    .addEventListener(
      "ku:recommendations-completed",
      () => {
        currentProjectId =
          null;

        updateSaveButton();
      }
    );

  document
    .addEventListener(
      "ku:analysis-completed",
      async (
        event
      ) => {
        if (
          !currentProjectId
        ) {
          return;
        }

        try {
          const state =
            window
              .KUApp
              .getState();

          await syncMetadata(
            currentProjectId,
            state
          );

          const {
            error
          } =
            await supabaseClient
              .from(
                "analyses"
              )
              .insert(
                analysisPayload(
                  currentProjectId,
                  event
                    .detail
                    .analysis
                )
              );

          if (
            error
          ) {
            throw error;
          }

          console.info(
            "심층 분석 결과 자동 저장 완료"
          );
        } catch (
          error
        ) {
          console.error(
            "심층 분석 자동 저장 오류:",
            error
          );
        }
      }
    );

  document
    .addEventListener(
      "ku:forecast-completed",
      async () => {
        if (
          !currentProjectId
        ) {
          return;
        }

        try {
          await syncMetadata(
            currentProjectId,
            window
              .KUApp
              .getState(),
            getForecast()
          );
        } catch (
          error
        ) {
          console.error(
            "경제 전망 상태 동기화 오류:",
            error
          );
        }
      }
    );

  /* =======================================================
     6. Fetch
  ======================================================= */

  async function latestMap(
    table,
    projectIds,
    fields
  ) {
    if (
      projectIds.length ===
      0
    ) {
      return {};
    }

    const {
      data,
      error
    } =
      await supabaseClient
        .from(
          table
        )
        .select(
          `project_id, ${fields}, created_at`
        )
        .in(
          "project_id",
          projectIds
        )
        .order(
          "created_at",
          {
            ascending:
              false
          }
        );

    if (
      error
    ) {
      throw error;
    }

    const result =
      {};

    (
      data ||
      []
    )
      .forEach(
        (
          row
        ) => {
          if (
            !result[
              row
                .project_id
            ]
          ) {
            result[
              row
                .project_id
            ] =
              row;
          }
        }
      );

    return result;
  }

  async function fetchProjects() {
    const {
      data:
        projects,

      error
    } =
      await supabaseClient
        .from(
          "projects"
        )
        .select(
          "*"
        )
        .order(
          "updated_at",
          {
            ascending:
              false
          }
        );

    if (
      error
    ) {
      throw error;
    }

    const safeProjects =
      projects ||
      [];

    const ids =
      safeProjects
        .map(
          (
            project
          ) =>
            project.id
        );

    const [
      analyses,
      forecasts
    ] =
      await Promise
        .all([
          latestMap(
            "analyses",
            ids,
            "scores, sections, summary"
          ),

          latestMap(
            "forecasts",
            ids,
            "fetched_at, trend_summary"
          )
        ]);

    const result =
      [];

    for (
      const project of
      safeProjects
    ) {
      const latestAnalysis =
        analyses[
          project.id
        ] ||
        null;

      const latestForecast =
        forecasts[
          project.id
        ] ||
        null;

      const repairedStatus =
        deriveStatus({
          selectedIdea:
            project
              .selected_idea,

          analysis:
            latestAnalysis,

          forecast:
            latestForecast
        });

      if (
        repairedStatus !==
        project.status
      ) {
        await supabaseClient
          .from(
            "projects"
          )
          .update({
            status:
              repairedStatus
          })
          .eq(
            "id",
            project.id
          );
      }

      result.push({
        ...project,

        status:
          repairedStatus,

        latest_analysis:
          latestAnalysis,

        latest_forecast:
          latestForecast
      });
    }

    return result;
  }

  /* =======================================================
     7. Render dashboard
  ======================================================= */

  function renderProjectList(
    projects
  ) {
    projectList
      .replaceChildren();

    if (
      projects.length ===
      0
    ) {
      projectList
        .appendChild(
          createElement(
            "div",
            "project-empty",
            "아직 저장한 프로젝트가 없습니다."
          )
        );

      return;
    }

    projects
      .forEach(
        (
          project
        ) => {
          const progress =
            progressValue(
              project
                .status
            );

          const score =
            averageScore(
              project
                .latest_analysis
                ?.scores
            );

          const card =
            createElement(
              "article",
              "project-card"
            );

          const top =
            createElement(
              "div",
              "project-card-top"
            );

          const main =
            createElement(
              "div"
            );

          main.appendChild(
            createElement(
              "h3",
              "",
              project
                .title
            )
          );

          const ideaText =
            createElement(
              "p",
              "project-selected-idea"
            );

          ideaText
            .appendChild(
              createElement(
                "strong",
                "",
                "선택 아이템: "
              )
            );

          ideaText
            .appendChild(
              document
                .createTextNode(
                  project
                    .selected_idea
                    ?.name ||
                  "아직 선택하지 않음"
                )
            );

          main.appendChild(
            ideaText
          );

          const meta =
            createElement(
              "div",
              "project-meta"
            );

          meta.appendChild(
            createElement(
              "span",
              "project-status",
              statusLabel(
                project
                  .status
              )
            )
          );

          meta.appendChild(
            createElement(
              "span",
              "project-score",
              score ===
                null
                ? "종합 점수: 분석 전"
                : `종합 점수: ${score}점`
            )
          );

          main.appendChild(
            meta
          );

          const actions =
            createElement(
              "div",
              "project-card-actions"
            );

          const openButton =
            createElement(
              "button",
              "project-small-btn",
              "이어하기"
            );

          openButton.type =
            "button";

          openButton
            .addEventListener(
              "click",
              () =>
                loadProject(
                  project.id
                )
            );

          const deleteButton =
            createElement(
              "button",
              "project-small-btn project-delete-btn",
              "삭제"
            );

          deleteButton.type =
            "button";

          deleteButton
            .addEventListener(
              "click",
              () =>
                deleteProject(
                  project.id
                )
            );

          actions.appendChild(
            openButton
          );

          actions.appendChild(
            deleteButton
          );

          top.appendChild(
            main
          );

          top.appendChild(
            actions
          );

          card.appendChild(
            top
          );

          const progressWrap =
            createElement(
              "div",
              "project-progress-wrap"
            );

          const progressHead =
            createElement(
              "div",
              "project-progress-head"
            );

          progressHead
            .appendChild(
              createElement(
                "span",
                "",
                "프로젝트 진행률"
              )
            );

          progressHead
            .appendChild(
              createElement(
                "span",
                "",
                `${progress}%`
              )
            );

          const track =
            createElement(
              "div",
              "project-progress-track"
            );

          const fill =
            createElement(
              "div",
              "project-progress-fill"
            );

          fill.style.width =
            `${progress}%`;

          track.appendChild(
            fill
          );

          progressWrap
            .appendChild(
              progressHead
            );

          progressWrap
            .appendChild(
              track
            );

          card.appendChild(
            progressWrap
          );

          const next =
            createElement(
              "div",
              "project-next-action"
            );

          next
            .appendChild(
              createElement(
                "strong",
                "",
                "다음 추천 행동: "
              )
            );

          next
            .appendChild(
              document
                .createTextNode(
                  nextAction(
                    project
                      .status
                  )
                )
            );

          card.appendChild(
            next
          );

          const dates =
            createElement(
              "div",
              "project-dates"
            );

          dates.appendChild(
            createElement(
              "span",
              "",
              `최근 수정: ${formatDate(project.updated_at)}`
            )
          );

          dates.appendChild(
            createElement(
              "span",
              "",
              `마지막 분석: ${formatDate(project.latest_analysis?.created_at)}`
            )
          );

          dates.appendChild(
            createElement(
              "span",
              "",
              `마지막 경제 전망: ${formatDate(project.latest_forecast?.fetched_at)}`
            )
          );

          card.appendChild(
            dates
          );

          projectList
            .appendChild(
              card
            );
        }
      );
  }

  async function showMyProjects() {
    const user =
      await getUser();

    if (
      !user
    ) {
      window
        .KUApp
        .openAuthModal();

      return;
    }

    openProjectsModal();

    projectList
      .replaceChildren(
        createElement(
          "div",
          "project-empty",
          "프로젝트 대시보드를 불러오는 중입니다..."
        )
      );

    try {
      renderProjectList(
        await fetchProjects()
      );
    } catch (
      error
    ) {
      console.error(
        "프로젝트 조회 오류:",
        error
      );

      projectList
        .replaceChildren(
          createElement(
            "div",
            "project-empty",
            `프로젝트 목록을 불러오지 못했습니다: ${error.message}`
          )
        );
    }
  }

  /* =======================================================
     8. Load project
  ======================================================= */

  async function loadProject(
    projectId
  ) {
    try {
      const [
        projectResponse,
        recommendationResponse,
        analysisResponse,
        forecastResponse
      ] =
        await Promise
          .all([
            supabaseClient
              .from(
                "projects"
              )
              .select(
                "*"
              )
              .eq(
                "id",
                projectId
              )
              .single(),

            supabaseClient
              .from(
                "recommendations"
              )
              .select(
                "*"
              )
              .eq(
                "project_id",
                projectId
              )
              .order(
                "created_at",
                {
                  ascending:
                    false
                }
              )
              .limit(
                1
              ),

            supabaseClient
              .from(
                "analyses"
              )
              .select(
                "*"
              )
              .eq(
                "project_id",
                projectId
              )
              .order(
                "created_at",
                {
                  ascending:
                    false
                }
              )
              .limit(
                1
              ),

            supabaseClient
              .from(
                "forecasts"
              )
              .select(
                "*"
              )
              .eq(
                "project_id",
                projectId
              )
              .order(
                "created_at",
                {
                  ascending:
                    false
                }
              )
              .limit(
                1
              )
          ]);

      if (
        projectResponse
          .error
      ) {
        throw projectResponse
          .error;
      }

      if (
        recommendationResponse
          .error
      ) {
        throw recommendationResponse
          .error;
      }

      if (
        analysisResponse
          .error
      ) {
        throw analysisResponse
          .error;
      }

      if (
        forecastResponse
          .error
      ) {
        throw forecastResponse
          .error;
      }

      const project =
        projectResponse
          .data;

      const recommendation =
        recommendationResponse
          .data
          ?.[0];

      const analysis =
        analysisResponse
          .data
          ?.[0];

      const forecast =
        forecastResponse
          .data
          ?.[0];

      currentProjectId =
        project.id;

      window
        .KUApp
        .loadProjectState({
          profile:
            project
              .profile,

          ideas:
            recommendation
              ?.ideas ||
            [],

          selectedIdea:
            project
              .selected_idea ||
            null,

          analysis:
            analysis ||
            null
        });

      updateSaveButton({
        saved:
          true
      });

      document.dispatchEvent(
        new CustomEvent(
          "ku:project-loaded",
          {
            detail: {
              projectId:
                project.id,

              forecast:
                forecast ||
              null
            }
          }
        )
      );

      closeProjectsModal();
    } catch (
      error
    ) {
      console.error(
        "프로젝트 불러오기 오류:",
        error
      );

      alert(
        `프로젝트를 불러오지 못했습니다: ${error.message}`
      );
    }
  }

  /* =======================================================
     9. Delete project
  ======================================================= */

  async function deleteProject(
    projectId
  ) {
    if (
      !window
        .confirm(
          "프로젝트를 삭제하시겠습니까?"
        )
    ) {
      return;
    }

    const {
      error
    } =
      await supabaseClient
        .from(
          "projects"
        )
        .delete()
        .eq(
          "id",
          projectId
        );

    if (
      error
    ) {
      alert(
        `프로젝트 삭제에 실패했습니다: ${error.message}`
      );

      return;
    }

    if (
      currentProjectId ===
      projectId
    ) {
      currentProjectId =
        null;
    }

    await showMyProjects();
  }

  /* =======================================================
     10. Public API
  ======================================================= */

  window.KUProjectManager = {
    getCurrentProjectId() {
      return currentProjectId;
    },

    clearCurrentProject() {
      currentProjectId =
        null;
    },

    async syncCurrentProject() {
      if (
        !currentProjectId
      ) {
        return;
      }

      await syncMetadata(
        currentProjectId,
        window
          .KUApp
          .getState()
      );
    }
  };

  /* =======================================================
     11. Events
  ======================================================= */

  saveProjectBtn
    .addEventListener(
      "click",
      saveCurrentProject
    );

  myProjectsBtn
    .addEventListener(
      "click",
      showMyProjects
    );

  closeProjectsModalBtn
    .addEventListener(
      "click",
      closeProjectsModal
    );

  newProjectBtn
    .addEventListener(
      "click",
      () => {
        closeProjectsModal();

        window
          .KUApp
          .resetApp();
      }
    );

  projectsModal
    .addEventListener(
      "click",
      (
        event
      ) => {
        if (
          event.target ===
          projectsModal
        ) {
          closeProjectsModal();
        }
      }
    );

  /* =======================================================
     12. Self tests
  ======================================================= */

  console.assert(
    deriveStatus({
      selectedIdea:
        null,

      analysis:
        null,

      forecast:
        null
    }) ===
      "recommended",

    "추천 상태 테스트 실패"
  );

  console.assert(
    deriveStatus({
      selectedIdea: {
        name:
          "테스트"
      },

      analysis: {
        summary:
          "분석"
      },

      forecast:
        null
    }) ===
      "analyzed",

    "심층 분석 상태 테스트 실패"
  );

  console.assert(
    progressValue(
      "forecasted"
    ) ===
      75,

    "경제 전망 진행률 테스트 실패"
  );

  console.info(
    "KU STARTUP PLANNER 프로젝트 관리 기능 연결 완료"
  );
})();
