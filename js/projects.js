/* =========================================================
   KU STARTUP PLANNER
   프로젝트 저장 · 불러오기 · 대시보드 관리
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

  let currentProjectId = null;

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

    if (missingElements.length > 0) {
      throw new Error(
        `프로젝트 관리 UI 요소를 찾지 못했습니다: ${missingElements.join(", ")}`
      );
    }
  }

  validateProjectElements();

  /* =======================================================
     2. 프로젝트 대시보드 전용 CSS
     index.html을 수정하지 않아도 되도록 JS에서 주입
  ======================================================= */

  function injectProjectDashboardStyles() {
    if (
      document.getElementById(
        "project-dashboard-styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "project-dashboard-styles";

    style.textContent = `
      .project-card {
        display: block;
        padding: 19px;
        border: 1px solid #e5e7eb;
        border-radius: 20px;
        background: white;
        box-shadow: 0 7px 20px rgba(134, 38, 51, 0.045);
      }

      .project-card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
      }

      .project-card-main {
        min-width: 0;
        flex: 1;
      }

      .project-card h3 {
        margin: 0 0 9px;
        color: #1f2937;
        font-size: 17px;
        letter-spacing: -0.025em;
      }

      .project-selected-idea {
        margin: 0 0 11px;
        color: #4b5563;
        font-size: 13px;
        line-height: 1.6;
      }

      .project-selected-idea strong {
        color: #862633;
      }

      .project-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        color: #6b7280;
        font-size: 12px;
      }

      .project-status {
        display: inline-flex;
        padding: 4px 7px;
        border-radius: 999px;
        background: #f3e8eb;
        color: #862633;
        font-weight: 800;
      }

      .project-score {
        display: inline-flex;
        padding: 4px 7px;
        border-radius: 999px;
        background: #f7f7f8;
        color: #374151;
        font-weight: 800;
      }

      .project-card-actions {
        display: flex;
        flex: 0 0 auto;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 7px;
      }

      .project-small-btn {
        padding: 8px 11px;
        border: none;
        border-radius: 999px;
        background: #862633;
        color: white;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
      }

      .project-delete-btn {
        background: #f3f4f6;
        color: #6b7280;
      }

      .project-progress-wrap {
        margin-top: 16px;
      }

      .project-progress-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
        color: #6b7280;
        font-size: 12px;
        font-weight: 700;
      }

      .project-progress-track {
        width: 100%;
        height: 8px;
        overflow: hidden;
        border-radius: 999px;
        background: #f3e8eb;
      }

      .project-progress-fill {
        height: 100%;
        border-radius: 999px;
        background: #862633;
        transition: width 0.25s ease;
      }

      .project-next-action {
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: 14px;
        background: #fbf4f5;
        color: #4b5563;
        font-size: 13px;
        line-height: 1.6;
      }

      .project-next-action strong {
        color: #862633;
      }

      .project-dates {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        margin-top: 11px;
        color: #9ca3af;
        font-size: 12px;
      }

      @media (max-width: 700px) {
        .project-card-top {
          flex-direction: column;
        }

        .project-card-actions {
          justify-content: flex-start;
        }
      }
    `;

    document.head.appendChild(
      style
    );
  }

  injectProjectDashboardStyles();

  /* =======================================================
     3. 공통 유틸리티
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
    const progressMap = {
      draft: 10,
      recommended: 25,
      selected: 40,
      analyzed: 60,
      forecasted: 75
    };

    return progressMap[status] || 10;
  }

  function getProjectNextAction(project) {
    if (!project) {
      return "프로젝트 정보를 확인해주세요.";
    }

    if (
      project.status === "draft"
    ) {
      return "사용자 조건을 입력하고 창업 아이템 추천을 받아보세요.";
    }

    if (
      project.status === "recommended"
    ) {
      return "추천 아이템 중 하나를 선택하고 심층 분석을 진행해보세요.";
    }

    if (
      project.status === "selected"
    ) {
      return "선택한 아이템의 시장성, 고객, 경쟁, 수익 모델을 심층 분석해보세요.";
    }

    if (
      project.status === "analyzed"
    ) {
      return "경제 환경 기반 사업 전망 분석을 진행해보세요.";
    }

    if (
      project.status === "forecasted"
    ) {
      return "시장 검증을 위한 실행 체크리스트를 작성해보세요.";
    }

    return "다음 단계를 확인해주세요.";
  }

  function calculateAverageScore(scores) {
    if (
      !scores ||
      typeof scores !== "object"
    ) {
      return null;
    }

    const values =
      Object
        .values(scores)
        .map(Number)
        .filter(
          (value) =>
            Number.isFinite(value)
        );

    if (values.length === 0) {
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

  function formatProjectDate(dateText) {
    if (!dateText) {
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
        new Date(dateText)
      );
  }

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

    return user;
  }

  function openProjectsModal() {
    projectsModal
      .classList
      .remove("hidden");
  }

  function closeProjectsModal() {
    projectsModal
      .classList
      .add("hidden");
  }

  function createProjectTitle(profile) {
    const firstInterest =
      profile
        ?.interests
        ?.split(",")
        ?.map(
          (value) =>
            value.trim()
        )
        ?.filter(Boolean)
        ?.[0];

    return firstInterest
      ? `${firstInterest} 창업 프로젝트`
      : "새 창업 프로젝트";
  }

  function updateSaveButton({
    saved = false,
    loading = false
  } = {}) {
    projectSaveButton
      .classList
      .remove("hidden");

    projectSaveButton.disabled =
      loading ||
      saved;

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
     4. 로그인 UI 동기화
  ======================================================= */

  async function synchronizeProjectAuthUI() {
    if (!supabaseClient) {
      return;
    }

    const {
      data: {
        session
      }
    } =
      await supabaseClient
        .auth
        .getSession();

    const isLoggedIn =
      Boolean(
        session?.user
      );

    projectListButton
      .classList
      .toggle(
        "hidden",
        !isLoggedIn
      );
  }

  if (supabaseClient) {
    supabaseClient
      .auth
      .onAuthStateChange(
        (
          _event,
          session
        ) => {
          const isLoggedIn =
            Boolean(
              session?.user
            );

          projectListButton
            .classList
            .toggle(
              "hidden",
              !isLoggedIn
            );
        }
      );
  }

  /* =======================================================
     5. 프로젝트 저장
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
      alert(
        "먼저 창업 아이템 추천을 받아주세요."
      );

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

    let createdProjectId =
      null;

    try {
      const {
        data: project,
        error: projectError
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

      createdProjectId =
        project.id;

      const {
        error:
          recommendationError
      } =
        await supabaseClient
          .from("recommendations")
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

      currentProjectId =
        createdProjectId;

      updateSaveButton({
        saved: true
      });

      alert(
        "프로젝트가 저장되었습니다. 이후 심층 분석 결과도 자동으로 저장됩니다."
      );
    } catch (error) {
      console.error(
        "프로젝트 저장 오류:",
        error
      );

      if (createdProjectId) {
        await supabaseClient
          .from("projects")
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
     6. 분석 결과 자동 저장
  ======================================================= */

  async function saveAnalysisToCurrentProject() {
    if (
      !currentProjectId ||
      !selectedIdea ||
      !currentAnalysis
    ) {
      return;
    }

    const user =
      await getAuthenticatedUser();

    if (!user) {
      return;
    }

    try {
      const {
        error:
          projectError
      } =
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

      if (projectError) {
        throw projectError;
      }

      const {
        error:
          analysisError
      } =
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

      if (analysisError) {
        throw analysisError;
      }

      console.info(
        "심층 분석 결과가 자동 저장되었습니다."
      );
    } catch (error) {
      console.error(
        "분석 자동 저장 오류:",
        error
      );
    }
  }

  const originalSelectIdea =
    selectIdea;

  selectIdea =
    async function selectIdeaAndSave(
      index
    ) {
      await originalSelectIdea(
        index
      );

      await saveAnalysisToCurrentProject();
    };

  /* =======================================================
     7. 프로젝트 목록 데이터 조회
  ======================================================= */

  async function fetchLatestAnalysesByProjectIds(
    projectIds
  ) {
    if (
      !Array.isArray(
        projectIds
      ) ||
      projectIds.length === 0
    ) {
      return {};
    }

    const {
      data,
      error
    } =
      await supabaseClient
        .from("analyses")
        .select(
          "project_id, scores, created_at"
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

    const latestByProjectId =
      {};

    (
      data || []
    ).forEach(
      (analysis) => {
        if (
          !latestByProjectId[
            analysis.project_id
          ]
        ) {
          latestByProjectId[
            analysis.project_id
          ] =
            analysis;
        }
      }
    );

    return latestByProjectId;
  }

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
        .from("projects")
        .select(
          "id, title, status, selected_idea, created_at, updated_at"
        )
        .order(
          "updated_at",
          {
            ascending: false
          }
        );

    if (projectError) {
      throw projectError;
    }

    const safeProjects =
      projects || [];

    const analysisMap =
      await fetchLatestAnalysesByProjectIds(
        safeProjects.map(
          (project) =>
            project.id
        )
      );

    return safeProjects.map(
      (project) => ({
        ...project,

        latest_analysis:
          analysisMap[
            project.id
          ] ||
          null
      })
    );
  }

  /* =======================================================
     8. 프로젝트 목록 렌더링
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
      "아직 저장한 프로젝트가 없습니다. 창업 아이템을 추천받은 뒤 프로젝트로 저장해보세요.";

    projectList
      .appendChild(
        empty
      );
  }

  function createMetaChip(
    className,
    text
  ) {
    const chip =
      document.createElement(
        "span"
      );

    chip.className =
      className;

    chip.textContent =
      text;

    return chip;
  }

  function renderProjectList(
    projects
  ) {
    projectList
      .replaceChildren();

    if (
      projects.length === 0
    ) {
      renderEmptyProjectList();

      return;
    }

    projects.forEach(
      (project) => {
        const card =
          document.createElement(
            "article"
          );

        const top =
          document.createElement(
            "div"
          );

        const main =
          document.createElement(
            "div"
          );

        const title =
          document.createElement(
            "h3"
          );

        const selectedIdeaText =
          document.createElement(
            "p"
          );

        const selectedIdeaLabel =
          document.createElement(
            "strong"
          );

        const meta =
          document.createElement(
            "div"
          );

        const actions =
          document.createElement(
            "div"
          );

        const openButton =
          document.createElement(
            "button"
          );

        const deleteButton =
          document.createElement(
            "button"
          );

        const progressWrap =
          document.createElement(
            "div"
          );

        const progressHead =
          document.createElement(
            "div"
          );

        const progressLabel =
          document.createElement(
            "span"
          );

        const progressValue =
          document.createElement(
            "span"
          );

        const progressTrack =
          document.createElement(
            "div"
          );

        const progressFill =
          document.createElement(
            "div"
          );

        const nextAction =
          document.createElement(
            "div"
          );

        const nextActionLabel =
          document.createElement(
            "strong"
          );

        const dates =
          document.createElement(
            "div"
          );

        const updatedDate =
          document.createElement(
            "span"
          );

        const analysisDate =
          document.createElement(
            "span"
          );

        const averageScore =
          calculateAverageScore(
            project
              .latest_analysis
              ?.scores
          );

        const progress =
          getProjectProgress(
            project.status
          );

        const selectedIdeaName =
          project
            .selected_idea
            ?.name ||
          "아직 선택하지 않음";

        card.className =
          "project-card";

        top.className =
          "project-card-top";

        main.className =
          "project-card-main";

        selectedIdeaText.className =
          "project-selected-idea";

        meta.className =
          "project-meta";

        actions.className =
          "project-card-actions";

        openButton.className =
          "project-small-btn";

        deleteButton.className =
          "project-small-btn project-delete-btn";

        progressWrap.className =
          "project-progress-wrap";

        progressHead.className =
          "project-progress-head";

        progressTrack.className =
          "project-progress-track";

        progressFill.className =
          "project-progress-fill";

        nextAction.className =
          "project-next-action";

        dates.className =
          "project-dates";

        title.textContent =
          project.title;

        selectedIdeaLabel.textContent =
          "선택 아이템: ";

        selectedIdeaText
          .appendChild(
            selectedIdeaLabel
          );

        selectedIdeaText
          .appendChild(
            document.createTextNode(
              selectedIdeaName
            )
          );

        meta.appendChild(
          createMetaChip(
            "project-status",
            getProjectStatusLabel(
              project.status
            )
          )
        );

        meta.appendChild(
          createMetaChip(
            "project-score",
            averageScore === null
              ? "종합 점수: 분석 전"
              : `종합 점수: ${averageScore}점`
          )
        );

        openButton.type =
          "button";

        openButton.textContent =
          "이어하기";

        deleteButton.type =
          "button";

        deleteButton.textContent =
          "삭제";

        openButton
          .addEventListener(
            "click",
            () =>
              loadProject(
                project.id
              )
          );

        deleteButton
          .addEventListener(
            "click",
            () =>
              deleteProject(
                project.id,
                project.title
              )
          );

        actions.appendChild(
          openButton
        );

        actions.appendChild(
          deleteButton
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

        top.appendChild(
          main
        );

        top.appendChild(
          actions
        );

        progressLabel.textContent =
          "프로젝트 진행률";

        progressValue.textContent =
          `${progress}%`;

        progressFill.style.width =
          `${progress}%`;

        progressHead.appendChild(
          progressLabel
        );

        progressHead.appendChild(
          progressValue
        );

        progressTrack.appendChild(
          progressFill
        );

        progressWrap.appendChild(
          progressHead
        );

        progressWrap.appendChild(
          progressTrack
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

        updatedDate.textContent =
          `최근 수정: ${formatProjectDate(
            project.updated_at
          )}`;

        analysisDate.textContent =
          `마지막 분석: ${formatProjectDate(
            project
              .latest_analysis
              ?.created_at
          )}`;

        dates.appendChild(
          updatedDate
        );

        dates.appendChild(
          analysisDate
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

        projectList.appendChild(
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
     9. 저장 프로젝트 불러오기
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
        (checkbox) => {
          checkbox.checked =
            profile
              .certificates
              ?.includes(
                checkbox.value
              ) ||
            false;
        }
      );

    document
      .getElementById(
        "interests"
      )
      .value =
        profile.interests ||
        "";

    document
      .getElementById(
        "goal"
      )
      .value =
        profile.goal ||
        "수익 창출";

    document
      .getElementById(
        "budget"
      )
      .value =
        profile.budget ||
        "";

    document
      .getElementById(
        "time"
      )
      .value =
        profile.time ||
        "";

    document
      .getElementById(
        "businessType"
      )
      .value =
        profile.businessType ||
        "온라인 서비스";

    document
      .getElementById(
        "target"
      )
      .value =
        profile.target ||
        "";

    document
      .getElementById(
        "avoid"
      )
      .value =
        profile.avoid ||
        "";
  }

  async function loadProject(
    projectId
  ) {
    try {
      const [
        projectResponse,
        recommendationResponse,
        analysisResponse
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
            .select(
              "ideas, created_at"
            )
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
            .from(
              "analyses"
            )
            .select(
              "scores, sections, summary, created_at"
            )
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

      const project =
        projectResponse.data;

      const recommendation =
        recommendationResponse
          .data?.[0];

      const analysis =
        analysisResponse
          .data?.[0];

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
        .remove("hidden");

      showStatus(
        recommendStatusCard,
        recommendStatusText,
        "저장된 추천 아이템을 불러왔습니다!",
        true
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

        analysisSection
          .classList
          .remove("hidden");

        showStatus(
          analysisStatusCard,
          analysisStatusText,
          "저장된 아이템 분석을 불러왔습니다!",
          true
        );

        renderBusinessPlan(
          currentProfile,
          selectedIdea,
          currentAnalysis
        );

        planSection
          .classList
          .remove("hidden");

        showStatus(
          planStatusCard,
          planStatusText,
          "저장된 창업 계획 초안을 불러왔습니다!",
          true
        );
      } else {
        analysisSection
          .classList
          .add("hidden");

        planSection
          .classList
          .add("hidden");

        hideStatus(
          analysisStatusCard
        );

        hideStatus(
          planStatusCard
        );
      }

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
     10. 프로젝트 삭제
  ======================================================= */

  async function deleteProject(
    projectId,
    title
  ) {
    const confirmed =
      window.confirm(
        `"${title}" 프로젝트를 삭제하시겠습니까?`
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

        updateSaveButton();
      }

      await showMyProjects();
    } catch (error) {
      console.error(
        "프로젝트 삭제 오류:",
        error
      );

      alert(
        `프로젝트를 삭제하지 못했습니다: ${error.message}`
      );
    }
  }

  /* =======================================================
     11. 기존 기능 확장
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
        .remove("hidden");

      if (currentProjectId) {
        updateSaveButton({
          saved: true
        });
      } else {
        updateSaveButton();
      }
    };

  const originalResetApp =
    resetApp;

  resetApp =
    function resetAppWithProjectState() {
      originalResetApp();

      currentProjectId =
        null;

      projectSaveButton
        .classList
        .add("hidden");

      closeProjectsModal();
    };

  /* =======================================================
     12. 이벤트 연결
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

        inputPanel
          .scrollIntoView({
            behavior:
              "smooth",

            block:
              "start"
          });
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
     13. 간단 자체 테스트
  ======================================================= */

  function runProjectDashboardSelfTests() {
    console.assert(
      calculateAverageScore({
        a: 80,
        b: 90
      }) === 85,
      "평균 점수 계산 테스트 실패"
    );

    console.assert(
      calculateAverageScore(
        {}
      ) === null,
      "빈 점수 객체 처리 테스트 실패"
    );

    console.assert(
      getProjectProgress(
        "analyzed"
      ) === 60,
      "프로젝트 진행률 계산 테스트 실패"
    );

    console.assert(
      getProjectStatusLabel(
        "recommended"
      ) ===
        "추천 아이템 검토 중",
      "프로젝트 상태 표시 테스트 실패"
    );
  }

  runProjectDashboardSelfTests();

  /* =======================================================
     14. 초기화
  ======================================================= */

  synchronizeProjectAuthUI();

  console.info(
    "KU STARTUP PLANNER 프로젝트 대시보드가 연결되었습니다."
  );
})();
