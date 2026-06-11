/* =========================================================
   KU STARTUP PLANNER
   프로젝트 저장 · 불러오기 · 상태 동기화 · 대시보드
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
     1. 초기 검증
  ======================================================= */

  function validateProjectElements() {
    const requiredElements = [
      ["saveProjectBtn", projectSaveButton],
      ["myProjectsBtn", projectListButton],
      ["projectsModal", projectsModal],
      ["closeProjectsModalBtn", closeProjectsModalButton],
      ["newProjectBtn", newProjectButton],
      ["projectList", projectList]
    ];

    const missingElements =
      requiredElements
        .filter(([, element]) => !element)
        .map(([id]) => id);

    if (
      missingElements.length >
      0
    ) {
      throw new Error(
        `프로젝트 관리 UI 요소를 찾지 못했습니다: ${missingElements.join(", ")}`
      );
    }
  }

  validateProjectElements();

  /* =======================================================
     2. 프로젝트 상태 계산
  ======================================================= */

  function getCurrentForecast() {
    return (
      window
        .KUForecastManager
        ?.getCurrentForecast?.() ||
      null
    );
  }

  function deriveProjectStatus({
    selectedIdea = null,
    analysis = null,
    forecast = null
  } = {}) {
    if (forecast) {
      return "forecasted";
    }

    if (analysis) {
      return "analyzed";
    }

    if (selectedIdea) {
      return "selected";
    }

    return "recommended";
  }

  function getProjectStatusLabel(
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
      labels[status] ||
      "진행 중"
    );
  }

  function getProjectProgress(
    status
  ) {
    const progressMap = {
      draft: 10,
      recommended: 25,
      selected: 40,
      analyzed: 60,
      forecasted: 75
    };

    return (
      progressMap[status] ||
      10
    );
  }

  function getProjectNextAction(
    project
  ) {
    const actionMap = {
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

    return (
      actionMap[
        project.status
      ] ||
      "다음 단계를 확인해주세요."
    );
  }

  function calculateAverageScore(
    scores
  ) {
    const values =
      Object
        .values(
          scores ||
          {}
        )
        .map(Number)
        .filter(
          Number.isFinite
        );

    if (
      values.length ===
      0
    ) {
      return null;
    }

    return Math.round(
      values.reduce(
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
    if (!value) {
      return "기록 없음";
    }

    const date =
      new Date(
        value
      );

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

  /* =======================================================
     3. 공통 유틸리티
  ======================================================= */

  async function getAuthenticatedUser() {
    if (!supabaseClient) {
      return null;
    }

    const {
      data: {
        user
      },

      error
    } =
      await supabaseClient
        .auth
        .getUser();

    if (error) {
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

  function createProjectTitle(
    profile
  ) {
    if (
      selectedIdea
        ?.name
    ) {
      return selectedIdea
        .name;
    }

    const firstInterest =
      profile
        ?.interests
        ?.split(",")
        ?.map(
          (
            value
          ) =>
            value
              .trim()
        )
        ?.filter(
          Boolean
        )
        ?.[0];

    return firstInterest
      ? `${firstInterest} 창업 프로젝트`
      : "새 창업 프로젝트";
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

  function updateSaveButton({
    saved = false,
    loading = false
  } = {}) {
    projectSaveButton
      .classList
      .remove(
        "hidden"
      );

    projectSaveButton.disabled =
      saved ||
      loading;

    if (loading) {
      projectSaveButton.textContent =
        "프로젝트를 저장하는 중입니다...";

      return;
    }

    if (saved) {
      projectSaveButton.textContent =
        "프로젝트 저장 완료 ✓";

      return;
    }

    projectSaveButton.textContent =
      "프로젝트로 저장하기";
  }

  /* =======================================================
     4. Supabase 저장용 데이터 변환
  ======================================================= */

  function makeAnalysisInsertPayload(
    projectId,
    analysis
  ) {
    return {
      project_id:
        projectId,

      scores:
        analysis
          .scores ||
        {},

      sections:
        analysis
          .sections ||
        {},

      summary:
        analysis
          .summary ||
        ""
    };
  }

  function makeForecastInsertPayload(
    projectId,
    forecast
  ) {
    return {
      project_id:
        projectId,

      economic_factors:
        forecast
          .economicFactors ||
        forecast
          .economic_factors ||
        [],

      outlook:
        forecast
          .outlook ||
        {},

      scenarios:
        forecast
          .scenarios ||
        {},

      actions:
        forecast
          .actions ||
        [],

      trend_summary:
        forecast
          .trendSummary ||
        forecast
          .trend_summary ||
        "",

      sources:
        forecast
          .sources ||
        [],

      data_snapshot:
        forecast
          .dataSnapshot ||
        forecast
          .data_snapshot ||
        {},

      fetched_at:
        forecast
          .fetchedAt ||
        forecast
          .fetched_at ||
        new Date()
          .toISOString(),

      model_used:
        typeof (
          forecast
            .modelUsed ||
          forecast
            .model_used
        ) ===
        "string"
          ? (
              forecast
                .modelUsed ||
              forecast
                .model_used
            )
          : JSON.stringify(
              forecast
                .modelUsed ||
              forecast
                .model_used ||
              {}
            )
    };
  }

  /* =======================================================
     5. 프로젝트 메타데이터 동기화
  ======================================================= */

  async function synchronizeProjectMetadata(
    projectId,
    {
      selectedIdea:
        syncedSelectedIdea =
          selectedIdea,

      analysis:
        syncedAnalysis =
          currentAnalysis,

      forecast:
        syncedForecast =
          getCurrentForecast()
    } = {}
  ) {
    if (!projectId) {
      return;
    }

    const status =
      deriveProjectStatus({
        selectedIdea:
          syncedSelectedIdea,

        analysis:
          syncedAnalysis,

        forecast:
          syncedForecast
      });

    const payload = {
      status,

      selected_idea:
        syncedSelectedIdea ||
        null
    };

    if (
      syncedSelectedIdea
        ?.name
    ) {
      payload.title =
        syncedSelectedIdea
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

    if (error) {
      throw error;
    }
  }

  /* =======================================================
     6. 프로젝트 최초 저장
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
      currentIdeas.length ===
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
      try {
        await synchronizeProjectMetadata(
          currentProjectId
        );

        updateSaveButton({
          saved:
            true
        });

        alert(
          "현재 프로젝트의 진행 상태를 동기화했습니다."
        );
      } catch (error) {
        console.error(
          "프로젝트 상태 동기화 오류:",
          error
        );

        alert(
          `프로젝트 상태 동기화에 실패했습니다: ${error.message}`
        );
      }

      return;
    }

    updateSaveButton({
      loading:
        true
    });

    let createdProjectId =
      null;

    try {
      const activeForecast =
        getCurrentForecast();

      const initialStatus =
        deriveProjectStatus({
          selectedIdea,
          analysis:
            currentAnalysis,
          forecast:
            activeForecast
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
              createProjectTitle(
                currentProfile
              ),

            status:
              initialStatus,

            profile:
              currentProfile,

            selected_idea:
              selectedIdea ||
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
              currentIdeas
          });

      if (
        recommendationError
      ) {
        throw recommendationError;
      }

      if (
        currentAnalysis
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
              makeAnalysisInsertPayload(
                createdProjectId,
                currentAnalysis
              )
            );

        if (
          analysisError
        ) {
          throw analysisError;
        }
      }

      if (
        activeForecast
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
              makeForecastInsertPayload(
                createdProjectId,
                activeForecast
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
        initialStatus ===
          "forecasted"
          ? "프로젝트, 심층 분석, 경제 전망 결과를 저장했습니다."
          : initialStatus ===
              "analyzed"
            ? "프로젝트와 심층 분석 결과를 저장했습니다."
            : "프로젝트를 저장했습니다."
      );
    } catch (error) {
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
     7. 저장된 프로젝트의 분석 자동 저장
  ======================================================= */

  async function saveAnalysisToCurrentProject() {
    if (
      !currentProjectId ||
      !selectedIdea ||
      !currentAnalysis
    ) {
      return;
    }

    try {
      await synchronizeProjectMetadata(
        currentProjectId,
        {
          selectedIdea,
          analysis:
            currentAnalysis,
          forecast:
            getCurrentForecast()
        }
      );

      const {
        error
      } =
        await supabaseClient
          .from(
            "analyses"
          )
          .insert(
            makeAnalysisInsertPayload(
              currentProjectId,
              currentAnalysis
            )
          );

      if (error) {
        throw error;
      }

      console.info(
        "심층 분석 결과를 자동 저장했습니다."
      );
    } catch (error) {
      console.error(
        "심층 분석 자동 저장 오류:",
        error
      );
    }
  }

  const originalSelectIdea =
    selectIdea;

  selectIdea =
    async function selectIdeaWithProjectSave(
      index
    ) {
      await originalSelectIdea(
        index
      );

      await saveAnalysisToCurrentProject();
    };

  /* =======================================================
     8. 최신 행 조회
  ======================================================= */

  async function fetchLatestMap(
    tableName,
    projectIds,
    selectFields
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
          tableName
        )
        .select(
          `project_id, ${selectFields}, created_at`
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

    if (error) {
      throw error;
    }

    const map =
      {};

    (
      data ||
      []
    ).forEach(
      (
        row
      ) => {
        if (
          !map[
            row.project_id
          ]
        ) {
          map[
            row.project_id
          ] =
            row;
        }
      }
    );

    return map;
  }

  /* =======================================================
     9. 기존 잘못된 상태 자동 보정
  ======================================================= */

  async function repairProjectStatus(
    project
  ) {
    const correctedStatus =
      deriveProjectStatus({
        selectedIdea:
          project
            .selected_idea,

        analysis:
          project
            .latest_analysis,

        forecast:
          project
            .latest_forecast
      });

    if (
      correctedStatus ===
      project.status
    ) {
      return {
        ...project,
        status:
          correctedStatus
      };
    }

    try {
      await supabaseClient
        .from(
          "projects"
        )
        .update({
          status:
            correctedStatus
        })
        .eq(
          "id",
          project.id
        );

      console.info(
        `프로젝트 상태 자동 보정: ${project.status} → ${correctedStatus}`
      );
    } catch (error) {
      console.warn(
        "프로젝트 상태 자동 보정 실패:",
        error
      );
    }

    return {
      ...project,
      status:
        correctedStatus
    };
  }

  /* =======================================================
     10. 프로젝트 목록 조회
  ======================================================= */

  async function fetchProjects() {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      return [];
    }

    const {
      data:
        projects,

      error:
        projectError
    } =
      await supabaseClient
        .from(
          "projects"
        )
        .select("*")
        .order(
          "updated_at",
          {
            ascending:
              false
          }
        );

    if (
      projectError
    ) {
      throw projectError;
    }

    const safeProjects =
      projects ||
      [];

    const projectIds =
      safeProjects
        .map(
          (
            project
          ) =>
            project.id
        );

    const [
      latestAnalyses,
      latestForecasts
    ] =
      await Promise.all([
        fetchLatestMap(
          "analyses",
          projectIds,
          "scores, sections, summary"
        ),

        fetchLatestMap(
          "forecasts",
          projectIds,
          "fetched_at, trend_summary"
        )
      ]);

    const projectsWithRelations =
      safeProjects
        .map(
          (
            project
          ) => ({
            ...project,

            latest_analysis:
              latestAnalyses[
                project.id
              ] ||
              null,

            latest_forecast:
              latestForecasts[
                project.id
              ] ||
              null
          })
        );

    return Promise.all(
      projectsWithRelations
        .map(
          repairProjectStatus
        )
    );
  }

  /* =======================================================
     11. 프로젝트 목록 렌더링
  ======================================================= */

  function renderEmptyProjectList() {
    projectList
      .replaceChildren();

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "project-empty";

    empty.textContent =
      "아직 저장한 프로젝트가 없습니다.";

    projectList
      .appendChild(
        empty
      );
  }

  function renderProjectList(
    projects
  ) {
    projectList
      .replaceChildren();

    if (
      projects.length ===
      0
    ) {
      renderEmptyProjectList();

      return;
    }

    projects.forEach(
      (
        project
      ) => {
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
          document.createElement(
            "article"
          );

        card.className =
          "project-card";

        const top =
          document.createElement(
            "div"
          );

        top.className =
          "project-card-top";

        const main =
          document.createElement(
            "div"
          );

        main.className =
          "project-card-main";

        const title =
          document.createElement(
            "h3"
          );

        title.textContent =
          project.title;

        const selectedIdeaText =
          document.createElement(
            "p"
          );

        selectedIdeaText.className =
          "project-selected-idea";

        const selectedIdeaLabel =
          document.createElement(
            "strong"
          );

        selectedIdeaLabel.textContent =
          "선택 아이템: ";

        selectedIdeaText
          .appendChild(
            selectedIdeaLabel
          );

        selectedIdeaText
          .appendChild(
            document.createTextNode(
              project
                .selected_idea
                ?.name ||
              "아직 선택하지 않음"
            )
          );

        const meta =
          document.createElement(
            "div"
          );

        meta.className =
          "project-meta";

        const status =
          document.createElement(
            "span"
          );

        status.className =
          "project-status";

        status.textContent =
          getProjectStatusLabel(
            project.status
          );

        const scoreChip =
          document.createElement(
            "span"
          );

        scoreChip.className =
          "project-score";

        scoreChip.textContent =
          score ===
          null
            ? "종합 점수: 분석 전"
            : `종합 점수: ${score}점`;

        meta.appendChild(
          status
        );

        meta.appendChild(
          scoreChip
        );

        main.appendChild(
          title
        );

        main.appendChild(
          selectedIdeaText
        );

        main.appendChild(
          meta
        );

        const actions =
          document.createElement(
            "div"
          );

        actions.className =
          "project-card-actions";

        const openButton =
          document.createElement(
            "button"
          );

        openButton.type =
          "button";

        openButton.className =
          "project-small-btn";

        openButton.textContent =
          "이어하기";

        openButton
          .addEventListener(
            "click",
            () =>
              loadProject(
                project.id
              )
          );

        const deleteButton =
          document.createElement(
            "button"
          );

        deleteButton.type =
          "button";

        deleteButton.className =
          "project-small-btn project-delete-btn";

        deleteButton.textContent =
          "삭제";

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

        const progressWrap =
          document.createElement(
            "div"
          );

        progressWrap.className =
          "project-progress-wrap";

        const progressHead =
          document.createElement(
            "div"
          );

        progressHead.className =
          "project-progress-head";

        const progressLabel =
          document.createElement(
            "span"
          );

        progressLabel.textContent =
          "프로젝트 진행률";

        const progressValue =
          document.createElement(
            "span"
          );

        progressValue.textContent =
          `${progress}%`;

        progressHead.appendChild(
          progressLabel
        );

        progressHead.appendChild(
          progressValue
        );

        const progressTrack =
          document.createElement(
            "div"
          );

        progressTrack.className =
          "project-progress-track";

        const progressFill =
          document.createElement(
            "div"
          );

        progressFill.className =
          "project-progress-fill";

        progressFill.style.width =
          `${progress}%`;

        progressTrack.appendChild(
          progressFill
        );

        progressWrap.appendChild(
          progressHead
        );

        progressWrap.appendChild(
          progressTrack
        );

        const nextAction =
          document.createElement(
            "div"
          );

        nextAction.className =
          "project-next-action";

        const nextActionLabel =
          document.createElement(
            "strong"
          );

        nextActionLabel.textContent =
          "다음 추천 행동: ";

        nextAction.appendChild(
          nextActionLabel
        );

        nextAction.appendChild(
          document.createTextNode(
            getProjectNextAction(
              project
            )
          )
        );

        const dates =
          document.createElement(
            "div"
          );

        dates.className =
          "project-dates";

        const updatedDate =
          document.createElement(
            "span"
          );

        updatedDate.textContent =
          `최근 수정: ${formatDate(
            project.updated_at
          )}`;

        const analysisDate =
          document.createElement(
            "span"
          );

        analysisDate.textContent =
          `마지막 분석: ${formatDate(
            project
              .latest_analysis
              ?.created_at
          )}`;

        const forecastDate =
          document.createElement(
            "span"
          );

        forecastDate.textContent =
          `마지막 경제 전망: ${formatDate(
            project
              .latest_forecast
              ?.fetched_at
          )}`;

        dates.appendChild(
          updatedDate
        );

        dates.appendChild(
          analysisDate
        );

        dates.appendChild(
          forecastDate
        );

        card.appendChild(
          top
        );

        card.appendChild(
          progressWrap
        );

        card.appendChild(
          nextAction
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
      await getAuthenticatedUser();

    if (!user) {
      openAuthModal();

      return;
    }

    openProjectsModal();

    projectList
      .replaceChildren();

    const loading =
      document.createElement(
        "div"
      );

    loading.className =
      "project-empty";

    loading.textContent =
      "프로젝트 대시보드를 불러오는 중입니다...";

    projectList
      .appendChild(
        loading
      );

    try {
      const projects =
        await fetchProjects();

      renderProjectList(
        projects
      );
    } catch (error) {
      console.error(
        "프로젝트 목록 조회 오류:",
        error
      );

      projectList
        .replaceChildren();

      const errorBox =
        document.createElement(
          "div"
        );

      errorBox.className =
        "project-empty";

      errorBox.textContent =
        `프로젝트 목록을 불러오지 못했습니다: ${error.message}`;

      projectList
        .appendChild(
          errorBox
        );
    }
  }

  /* =======================================================
     12. 입력 폼 복원
  ======================================================= */

  function applyProfileToForm(
    profile
  ) {
    if (!profile) {
      return;
    }

    primaryCollegeSelect.value =
      profile
        .primaryMajor
        ?.college ||
      "";

    renderMajorOptions(
      primaryCollegeSelect,
      primaryMajorSelect,
      false
    );

    primaryMajorSelect.value =
      profile
        .primaryMajor
        ?.major ||
      "";

    secondaryCollegeSelect.value =
      profile
        .secondaryMajor
        ?.college ||
      "해당 없음";

    renderMajorOptions(
      secondaryCollegeSelect,
      secondaryMajorSelect,
      true
    );

    secondaryMajorSelect.value =
      profile
        .secondaryMajor
        ?.major ||
      "해당 없음";

    document
      .querySelectorAll(
        "input[name='certificates']"
      )
      .forEach(
        (
          checkbox
        ) => {
          checkbox.checked =
            profile
              .certificates
              ?.includes(
                checkbox.value
              ) ||
            false;
        }
      );

    const values = {
      interests:
        profile.interests ||
        "",

      goal:
        profile.goal ||
        "수익 창출",

      budget:
        profile.budget ||
        "",

      time:
        profile.time ||
        "",

      businessType:
        profile.businessType ||
        "온라인 서비스",

      target:
        profile.target ||
        "",

      avoid:
        profile.avoid ||
        ""
    };

    Object
      .entries(
        values
      )
      .forEach(
        ([
          id,
          value
        ]) => {
          const element =
            document.getElementById(
              id
            );

          if (
            element
          ) {
            element.value =
              value;
          }
        }
      );
  }

  /* =======================================================
     13. 프로젝트 불러오기
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
        await Promise.all([
          supabaseClient
            .from(
              "projects"
            )
            .select("*")
            .eq(
              "id",
              projectId
            )
            .single(),

          supabaseClient
            .from(
              "recommendations"
            )
            .select("*")
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
            .limit(1),

          supabaseClient
            .from(
              "analyses"
            )
            .select("*")
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
            .limit(1),

          supabaseClient
            .from(
              "forecasts"
            )
            .select("*")
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
            .limit(1)
        ]);

      if (
        projectResponse.error
      ) {
        throw projectResponse.error;
      }

      if (
        recommendationResponse.error
      ) {
        throw recommendationResponse.error;
      }

      if (
        analysisResponse.error
      ) {
        throw analysisResponse.error;
      }

      if (
        forecastResponse.error
      ) {
        throw forecastResponse.error;
      }

      const project =
        projectResponse.data;

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

      currentProfile =
        project.profile;

      currentIdeas =
        normalizeIdeas(
          recommendation
            ?.ideas ||
          []
        );

      selectedIdea =
        project
          .selected_idea ||
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

      recommendationSection
        .classList
        .remove(
          "hidden"
        );

      updateSaveButton({
        saved:
          true
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

        analysisSection
          .classList
          .remove(
            "hidden"
          );

        renderBusinessPlan(
          currentProfile,
          selectedIdea,
          currentAnalysis
        );

        planSection
          .classList
          .remove(
            "hidden"
          );

        showStatus(
          analysisStatusCard,
          analysisStatusText,
          "저장된 아이템 분석을 불러왔습니다!",
          true
        );

        showStatus(
          planStatusCard,
          planStatusText,
          "저장된 창업 계획 초안을 불러왔습니다!",
          true
        );
      } else {
        analysisSection
          .classList
          .add(
            "hidden"
          );

        planSection
          .classList
          .add(
            "hidden"
          );

        hideStatus(
          analysisStatusCard
        );

        hideStatus(
          planStatusCard
        );
      }

      if (
        window
          .KUForecastManager
      ) {
        if (
          forecast
        ) {
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

      await synchronizeProjectMetadata(
        currentProjectId,
        {
          selectedIdea,
          analysis:
            currentAnalysis,
          forecast
        }
      );

      closeProjectsModal();

      recommendationSection
        .scrollIntoView({
          behavior:
            "smooth",

          block:
            "start"
        });
    } catch (error) {
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
     14. 프로젝트 삭제
  ======================================================= */

  async function deleteProject(
    projectId
  ) {
    const confirmed =
      window.confirm(
        "프로젝트를 삭제하시겠습니까?"
      );

    if (!confirmed) {
      return;
    }

    try {
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

      if (error) {
        throw error;
      }

      if (
        currentProjectId ===
        projectId
      ) {
        currentProjectId =
          null;
      }

      await showMyProjects();
    } catch (error) {
      console.error(
        "프로젝트 삭제 오류:",
        error
      );

      alert(
        `프로젝트 삭제에 실패했습니다: ${error.message}`
      );
    }
  }

  /* =======================================================
     15. 기존 기능 확장
  ======================================================= */

  const originalRenderIdeas =
    renderIdeas;

  renderIdeas =
    function renderIdeasWithSaveButton(
      ideas
    ) {
      originalRenderIdeas(
        ideas
      );

      projectSaveButton
        .classList
        .remove(
          "hidden"
        );

      if (
        currentProjectId
      ) {
        updateSaveButton({
          saved:
            true
        });
      } else {
        updateSaveButton();
      }
    };

  const originalResetApp =
    resetApp;

  resetApp =
    function resetAppWithProjectReset() {
      currentProjectId =
        null;

      originalResetApp();
    };

  /* =======================================================
     16. 이벤트 연결
  ======================================================= */

  projectSaveButton
    .addEventListener(
      "click",
      saveCurrentProject
    );

  projectListButton
    .addEventListener(
      "click",
      showMyProjects
    );

  closeProjectsModalButton
    .addEventListener(
      "click",
      closeProjectsModal
    );

  newProjectButton
    .addEventListener(
      "click",
      () => {
        closeProjectsModal();

        resetApp();
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
     17. 외부 기능 연결
  ======================================================= */

  window.KUProjectManager = {
    getCurrentProjectId() {
      return currentProjectId;
    },

    clearCurrentProject() {
      currentProjectId =
        null;
    },

    async synchronizeCurrentProject() {
      if (
        !currentProjectId
      ) {
        return;
      }

      await synchronizeProjectMetadata(
        currentProjectId
      );
    }
  };

  /* =======================================================
     18. 자체 테스트
  ======================================================= */

  function runProjectManagerSelfTests() {
    console.assert(
      deriveProjectStatus({
        selectedIdea:
          null,

        analysis:
          null,

        forecast:
          null
      }) ===
        "recommended",

      "추천 상태 계산 테스트 실패"
    );

    console.assert(
      deriveProjectStatus({
        selectedIdea: {
          name:
            "테스트 아이템"
        },

        analysis: {
          summary:
            "테스트 분석"
        },

        forecast:
          null
      }) ===
        "analyzed",

      "심층 분석 상태 계산 테스트 실패"
    );

    console.assert(
      deriveProjectStatus({
        selectedIdea: {
          name:
            "테스트 아이템"
        },

        analysis: {
          summary:
            "테스트 분석"
        },

        forecast: {
          trendSummary:
            "테스트 전망"
        }
      }) ===
        "forecasted",

      "경제 전망 상태 계산 테스트 실패"
    );

    console.assert(
      getProjectProgress(
        "analyzed"
      ) ===
        60,

      "심층 분석 진행률 테스트 실패"
    );

    console.assert(
      getProjectProgress(
        "forecasted"
      ) ===
        75,

      "경제 전망 진행률 테스트 실패"
    );
  }

  runProjectManagerSelfTests();

  console.info(
    "KU STARTUP PLANNER 프로젝트 상태 동기화 기능 연결 완료"
  );
})();
