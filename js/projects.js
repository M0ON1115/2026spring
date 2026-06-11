/* =========================================================
   KU STARTUP PLANNER
   프로젝트 저장 · 불러오기 · 대시보드
========================================================= */

(() => {
  const projectSaveButton =
    document.getElementById("saveProjectBtn");

  const projectListButton =
    document.getElementById("myProjectsBtn");

  const projectsModal =
    document.getElementById("projectsModal");

  const closeProjectsModalButton =
    document.getElementById("closeProjectsModalBtn");

  const newProjectButton =
    document.getElementById("newProjectBtn");

  const projectList =
    document.getElementById("projectList");

  let currentProjectId =
    null;

  /* =======================================================
     1. Utility
  ======================================================= */

  function getProjectStatusLabel(status) {
    const labels = {
      draft: "아이디어 탐색",
      recommended: "추천 아이템 검토 중",
      selected: "아이템 선택 완료",
      analyzed: "심층 분석 완료",
      forecasted: "경제 전망 완료"
    };

    return labels[status] ||
      "진행 중";
  }

  function getProjectProgress(status) {
    const map = {
      draft: 10,
      recommended: 25,
      selected: 40,
      analyzed: 60,
      forecasted: 75
    };

    return map[status] ||
      10;
  }

  function getProjectNextAction(project) {
    const actions = {
      draft:
        "사용자 조건을 입력하고 창업 아이템 추천을 받아보세요.",
      recommended:
        "추천 아이템 중 하나를 선택하고 심층 분석을 진행해보세요.",
      selected:
        "선택한 아이템의 시장성과 수익 모델을 심층 분석해보세요.",
      analyzed:
        "최신 공개 자료 기반 경제 전망 분석을 진행해보세요.",
      forecasted:
        "시장 검증을 위한 실행 체크리스트를 작성해보세요."
    };

    return actions[project.status] ||
      "다음 단계를 확인해주세요.";
  }

  function calculateAverageScore(scores) {
    const values =
      Object
        .values(scores || {})
        .map(Number)
        .filter(Number.isFinite);

    if (
      values.length === 0
    ) {
      return null;
    }

    return Math.round(
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      ) /
      values.length
    );
  }

  function formatDate(value) {
    if (!value) {
      return "기록 없음";
    }

    return new Intl
      .DateTimeFormat(
        "ko-KR",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        }
      )
      .format(
        new Date(value)
      );
  }

  async function getAuthenticatedUser() {
    const {
      data: {
        user
      }
    } =
      await supabaseClient
        .auth
        .getUser();

    return user ||
      null;
  }

  function createProjectTitle(profile) {
    const keyword =
      profile
        ?.interests
        ?.split(",")
        ?.[0]
        ?.trim();

    return keyword
      ? `${keyword} 창업 프로젝트`
      : "새 창업 프로젝트";
  }

  function openProjectsModal() {
    projectsModal.classList.remove(
      "hidden"
    );
  }

  function closeProjectsModal() {
    projectsModal.classList.add(
      "hidden"
    );
  }

  function updateSaveButton({
    saved = false,
    loading = false
  } = {}) {
    projectSaveButton.classList.remove(
      "hidden"
    );

    projectSaveButton.disabled =
      saved ||
      loading;

    projectSaveButton.textContent =
      loading
        ? "프로젝트를 저장하는 중입니다..."
        : saved
          ? "프로젝트 저장 완료 ✓"
          : "프로젝트로 저장하기";
  }

  /* =======================================================
     2. Save
  ======================================================= */

  async function saveCurrentProject() {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      openAuthModal();

      alert(
        "프로젝트를 저장하려면 먼저 로그인해야 합니다."
      );

      return;
    }

    if (
      !currentProfile ||
      currentIdeas.length === 0
    ) {
      return;
    }

    if (currentProjectId) {
      updateSaveButton({
        saved: true
      });

      return;
    }

    updateSaveButton({
      loading: true
    });

    try {
      const {
        data: project,
        error:
          projectError
      } =
        await supabaseClient
          .from("projects")
          .insert({
            user_id:
              user.id,
            title:
              createProjectTitle(
                currentProfile
              ),
            status:
              "recommended",
            profile:
              currentProfile
          })
          .select()
          .single();

      if (projectError) {
        throw projectError;
      }

      const {
        error:
          recommendationError
      } =
        await supabaseClient
          .from("recommendations")
          .insert({
            project_id:
              project.id,
            ideas:
              currentIdeas
          });

      if (
        recommendationError
      ) {
        throw recommendationError;
      }

      currentProjectId =
        project.id;

      updateSaveButton({
        saved: true
      });

      alert(
        "프로젝트가 저장되었습니다."
      );
    } catch (error) {
      console.error(error);

      updateSaveButton();

      alert(
        `프로젝트 저장에 실패했습니다: ${error.message}`
      );
    }
  }

  async function saveAnalysis() {
    if (
      !currentProjectId ||
      !selectedIdea ||
      !currentAnalysis
    ) {
      return;
    }

    await supabaseClient
      .from("projects")
      .update({
        title:
          selectedIdea.name,
        status:
          "analyzed",
        selected_idea:
          selectedIdea
      })
      .eq(
        "id",
        currentProjectId
      );

    await supabaseClient
      .from("analyses")
      .insert({
        project_id:
          currentProjectId,
        scores:
          currentAnalysis.scores,
        sections:
          currentAnalysis.sections,
        summary:
          currentAnalysis.summary
      });
  }

  const originalSelectIdea =
    selectIdea;

  selectIdea =
    async function selectIdeaWithSave(
      index
    ) {
      await originalSelectIdea(
        index
      );

      await saveAnalysis();
    };

  /* =======================================================
     3. Load list
  ======================================================= */

  async function fetchLatestMap(
    table,
    projectIds,
    fields
  ) {
    if (
      projectIds.length === 0
    ) {
      return {};
    }

    const {
      data,
      error
    } =
      await supabaseClient
        .from(table)
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
            ascending: false
          }
        );

    if (error) {
      throw error;
    }

    const result =
      {};

    (
      data || []
    ).forEach(
      (row) => {
        if (
          !result[row.project_id]
        ) {
          result[row.project_id] =
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
        .from("projects")
        .select("*")
        .order(
          "updated_at",
          {
            ascending: false
          }
        );

    if (error) {
      throw error;
    }

    const ids =
      (
        projects || []
      )
        .map(
          (project) =>
            project.id
        );

    const analyses =
      await fetchLatestMap(
        "analyses",
        ids,
        "scores"
      );

    const forecasts =
      await fetchLatestMap(
        "forecasts",
        ids,
        "fetched_at"
      );

    return (
      projects || []
    )
      .map(
        (project) => ({
          ...project,
          latest_analysis:
            analyses[project.id] ||
            null,
          latest_forecast:
            forecasts[project.id] ||
            null
        })
      );
  }

  function createChip(
    className,
    text
  ) {
    const chip =
      document.createElement("span");

    chip.className =
      className;

    chip.textContent =
      text;

    return chip;
  }

  function renderProjectList(projects) {
    projectList.replaceChildren();

    if (
      projects.length === 0
    ) {
      projectList.innerHTML = `
        <div class="project-empty">
          아직 저장한 프로젝트가 없습니다.
        </div>
      `;

      return;
    }

    projects.forEach(
      (project) => {
        const score =
          calculateAverageScore(
            project
              .latest_analysis
              ?.scores
          );

        const progress =
          getProjectProgress(
            project.status
          );

        const card =
          document.createElement("article");

        card.className =
          "project-card";

        card.innerHTML = `
          <div class="project-card-top">
            <div class="project-card-main">
              <h3>${project.title}</h3>

              <p class="project-selected-idea">
                <strong>선택 아이템:</strong>
                ${
                  project
                    .selected_idea
                    ?.name ||
                  "아직 선택하지 않음"
                }
              </p>

              <div class="project-meta">
                <span class="project-status">
                  ${getProjectStatusLabel(
                    project.status
                  )}
                </span>

                <span class="project-score">
                  ${
                    score === null
                      ? "종합 점수: 분석 전"
                      : `종합 점수: ${score}점`
                  }
                </span>
              </div>
            </div>

            <div class="project-card-actions">
              <button
                class="project-small-btn"
                data-action="open"
                type="button"
              >
                이어하기
              </button>

              <button
                class="project-small-btn project-delete-btn"
                data-action="delete"
                type="button"
              >
                삭제
              </button>
            </div>
          </div>

          <div class="project-progress-wrap">
            <div class="project-progress-head">
              <span>프로젝트 진행률</span>
              <span>${progress}%</span>
            </div>

            <div class="project-progress-track">
              <div
                class="project-progress-fill"
                style="width: ${progress}%"
              ></div>
            </div>
          </div>

          <div class="project-next-action">
            <strong>다음 추천 행동:</strong>
            ${getProjectNextAction(project)}
          </div>

          <div class="project-dates">
            <span>
              최근 수정:
              ${formatDate(
                project.updated_at
              )}
            </span>

            <span>
              마지막 분석:
              ${formatDate(
                project
                  .latest_analysis
                  ?.created_at
              )}
            </span>

            <span>
              마지막 경제 전망:
              ${formatDate(
                project
                  .latest_forecast
                  ?.fetched_at
              )}
            </span>
          </div>
        `;

        card
          .querySelector(
            "[data-action='open']"
          )
          .addEventListener(
            "click",
            () =>
              loadProject(
                project.id
              )
          );

        card
          .querySelector(
            "[data-action='delete']"
          )
          .addEventListener(
            "click",
            () =>
              deleteProject(
                project.id
              )
          );

        projectList.appendChild(
          card
        );
      }
    );
  }

  async function showMyProjects() {
    openProjectsModal();

    projectList.innerHTML = `
      <div class="project-empty">
        프로젝트 대시보드를 불러오는 중입니다...
      </div>
    `;

    try {
      renderProjectList(
        await fetchProjects()
      );
    } catch (error) {
      projectList.innerHTML = `
        <div class="project-empty">
          프로젝트 목록 조회 실패:
          ${error.message}
        </div>
      `;
    }
  }

  /* =======================================================
     4. Load project
  ======================================================= */

  function applyProfileToForm(profile) {
    primaryCollegeSelect.value =
      profile
        ?.primaryMajor
        ?.college ||
      "";

    renderMajorOptions(
      primaryCollegeSelect,
      primaryMajorSelect,
      false
    );

    primaryMajorSelect.value =
      profile
        ?.primaryMajor
        ?.major ||
      "";

    secondaryCollegeSelect.value =
      profile
        ?.secondaryMajor
        ?.college ||
      "해당 없음";

    renderMajorOptions(
      secondaryCollegeSelect,
      secondaryMajorSelect,
      true
    );

    secondaryMajorSelect.value =
      profile
        ?.secondaryMajor
        ?.major ||
      "해당 없음";

    document
      .querySelectorAll(
        "input[name='certificates']"
      )
      .forEach(
        (checkbox) => {
          checkbox.checked =
            profile
              ?.certificates
              ?.includes(
                checkbox.value
              ) ||
            false;
        }
      );

    [
      "interests",
      "goal",
      "budget",
      "time",
      "businessType",
      "target",
      "avoid"
    ].forEach(
      (id) => {
        document
          .getElementById(id)
          .value =
            profile?.[id] ||
            "";
      }
    );
  }

  async function loadProject(projectId) {
    const [
      projectResponse,
      recommendationResponse,
      analysisResponse,
      forecastResponse
    ] =
      await Promise.all([
        supabaseClient
          .from("projects")
          .select("*")
          .eq(
            "id",
            projectId
          )
          .single(),

        supabaseClient
          .from("recommendations")
          .select("*")
          .eq(
            "project_id",
            projectId
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          )
          .limit(1),

        supabaseClient
          .from("analyses")
          .select("*")
          .eq(
            "project_id",
            projectId
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          )
          .limit(1),

        supabaseClient
          .from("forecasts")
          .select("*")
          .eq(
            "project_id",
            projectId
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          )
          .limit(1)
      ]);

    const project =
      projectResponse.data;

    const recommendation =
      recommendationResponse
        .data?.[0];

    const analysis =
      analysisResponse
        .data?.[0];

    const forecast =
      forecastResponse
        .data?.[0];

    currentProjectId =
      project.id;

    currentProfile =
      project.profile;

    currentIdeas =
      normalizeIdeas(
        recommendation?.ideas ||
        []
      );

    selectedIdea =
      project.selected_idea ||
      null;

    currentAnalysis =
      analysis
        ? normalizeAnalysis(
            analysis
          )
        : null;

    applyProfileToForm(
      currentProfile
    );

    renderIdeas(
      currentIdeas
    );

    recommendationSection.classList.remove(
      "hidden"
    );

    updateSaveButton({
      saved: true
    });

    if (
      selectedIdea &&
      currentAnalysis
    ) {
      selectedIdeaText.textContent =
        `선택한 아이템: ${selectedIdea.name}`;

      renderAnalysis(
        currentAnalysis
      );

      analysisSection.classList.remove(
        "hidden"
      );

      renderBusinessPlan(
        currentProfile,
        selectedIdea,
        currentAnalysis
      );

      planSection.classList.remove(
        "hidden"
      );
    }

    if (
      window.KUForecastManager
    ) {
      if (forecast) {
        window
          .KUForecastManager
          .restoreForecast(
            forecast
          );
      } else {
        window
          .KUForecastManager
          .clearForecastUI();
      }
    }

    closeProjectsModal();

    recommendationSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  /* =======================================================
     5. Delete
  ======================================================= */

  async function deleteProject(projectId) {
    if (
      !confirm(
        "프로젝트를 삭제하시겠습니까?"
      )
    ) {
      return;
    }

    await supabaseClient
      .from("projects")
      .delete()
      .eq(
        "id",
        projectId
      );

    if (
      currentProjectId === projectId
    ) {
      currentProjectId =
        null;
    }

    await showMyProjects();
  }

  /* =======================================================
     6. Events and API
  ======================================================= */

  projectSaveButton.addEventListener(
    "click",
    saveCurrentProject
  );

  projectListButton.addEventListener(
    "click",
    showMyProjects
  );

  closeProjectsModalButton.addEventListener(
    "click",
    closeProjectsModal
  );

  newProjectButton.addEventListener(
    "click",
    () => {
      closeProjectsModal();
      resetApp();
    }
  );

  window.KUProjectManager = {
    getCurrentProjectId() {
      return currentProjectId;
    },

    clearCurrentProject() {
      currentProjectId =
        null;
    }
  };

  console.info(
    "KU STARTUP PLANNER 프로젝트 관리 기능 연결 완료"
  );
})();
