/* =========================================================
   KU STARTUP PLANNER
   Supabase 프로젝트 저장 및 불러오기
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
     2. 공통 유틸리티
  ======================================================= */

  function getProjectStatusLabel(status) {
    const labels = {
      draft: "작성 중",
      recommended: "추천 완료",
      selected: "아이템 선택 완료",
      analyzed: "심층 분석 완료",
      forecasted: "경제 전망 완료"
    };

    return labels[status] || "진행 중";
  }

  function formatProjectDate(dateText) {
    if (!dateText) {
      return "";
    }

    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date(dateText));
  }

  async function getAuthenticatedUser() {
    if (!supabaseClient) {
      return null;
    }

    const {
      data: { user },
      error
    } = await supabaseClient.auth.getUser();

    if (error) {
      console.error("사용자 확인 오류:", error);
      return null;
    }

    return user;
  }

  function openProjectsModal() {
    projectsModal.classList.remove("hidden");
  }

  function closeProjectsModal() {
    projectsModal.classList.add("hidden");
  }

  function createProjectTitle(profile) {
    const firstInterest =
      profile?.interests
        ?.split(",")
        ?.map((value) => value.trim())
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
    projectSaveButton.classList.remove("hidden");

    projectSaveButton.disabled =
      loading || saved;

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
     3. 로그인 UI 확장
  ======================================================= */

  const originalUpdateAuthUI =
    updateAuthUI;

  updateAuthUI =
    function updateAuthUIWithProjects(session) {
      originalUpdateAuthUI(session);

      const isLoggedIn =
        Boolean(session?.user);

      projectListButton
        .classList
        .toggle("hidden", !isLoggedIn);
    };

  async function synchronizeProjectAuthUI() {
    if (!supabaseClient) {
      return;
    }

    const {
      data: { session }
    } =
      await supabaseClient
        .auth
        .getSession();

    updateAuthUI(session);
  }

  /* =======================================================
     4. 프로젝트 저장
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

    let createdProjectId = null;

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
        error: recommendationError
      } =
        await supabaseClient
          .from("recommendations")
          .insert({
            project_id:
              createdProjectId,

            ideas:
              currentIdeas
          });

      if (recommendationError) {
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
     5. 분석 결과 자동 저장
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
        error: projectError
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
        error: analysisError
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
    async function selectIdeaAndSave(index) {
      await originalSelectIdea(index);

      await saveAnalysisToCurrentProject();
    };

  /* =======================================================
     6. 프로젝트 목록 조회
  ======================================================= */

  async function fetchProjects() {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      return [];
    }

    const {
      data,
      error
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

    if (error) {
      throw error;
    }

    return data || [];
  }

  function renderEmptyProjectList() {
    projectList.replaceChildren();

    const empty =
      document.createElement("div");

    empty.className =
      "project-empty";

    empty.textContent =
      "아직 저장한 프로젝트가 없습니다. 창업 아이템을 추천받은 뒤 프로젝트로 저장해보세요.";

    projectList.appendChild(empty);
  }

  function renderProjectList(projects) {
    projectList.replaceChildren();

    if (projects.length === 0) {
      renderEmptyProjectList();
      return;
    }

    projects.forEach((project) => {
      const card =
        document.createElement("article");

      const main =
        document.createElement("div");

      const title =
        document.createElement("h3");

      const meta =
        document.createElement("div");

      const status =
        document.createElement("span");

      const date =
        document.createElement("span");

      const actions =
        document.createElement("div");

      const openButton =
        document.createElement("button");

      const deleteButton =
        document.createElement("button");

      card.className =
        "project-card";

      main.className =
        "project-card-main";

      meta.className =
        "project-meta";

      status.className =
        "project-status";

      actions.className =
        "project-card-actions";

      openButton.className =
        "project-small-btn";

      deleteButton.className =
        "project-small-btn project-delete-btn";

      title.textContent =
        project.title;

      status.textContent =
        getProjectStatusLabel(
          project.status
        );

      date.textContent =
        `최근 수정: ${formatProjectDate(
          project.updated_at
        )}`;

      openButton.type =
        "button";

      openButton.textContent =
        "이어하기";

      deleteButton.type =
        "button";

      deleteButton.textContent =
        "삭제";

      openButton.addEventListener(
        "click",
        () =>
          loadProject(
            project.id
          )
      );

      deleteButton.addEventListener(
        "click",
        () =>
          deleteProject(
            project.id,
            project.title
          )
      );

      meta.appendChild(status);
      meta.appendChild(date);

      main.appendChild(title);
      main.appendChild(meta);

      actions.appendChild(openButton);
      actions.appendChild(deleteButton);

      card.appendChild(main);
      card.appendChild(actions);

      projectList.appendChild(card);
    });
  }

  async function showMyProjects() {
    const user =
      await getAuthenticatedUser();

    if (!user) {
      openAuthModal();
      return;
    }

    openProjectsModal();

    projectList.replaceChildren();

    const loading =
      document.createElement("div");

    loading.className =
      "project-empty";

    loading.textContent =
      "프로젝트 목록을 불러오는 중입니다...";

    projectList.appendChild(loading);

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

      projectList.replaceChildren();

      const errorBox =
        document.createElement("div");

      errorBox.className =
        "project-empty";

      errorBox.textContent =
        `프로젝트 목록을 불러오지 못했습니다: ${error.message}`;

      projectList.appendChild(
        errorBox
      );
    }
  }

  /* =======================================================
     7. 프로젝트 불러오기
  ======================================================= */

  function applyProfileToForm(profile) {
    if (!profile) {
      return;
    }

    primaryCollegeSelect.value =
      profile.primaryMajor?.college || "";

    renderMajorOptions(
      primaryCollegeSelect,
      primaryMajorSelect,
      false
    );

    primaryMajorSelect.value =
      profile.primaryMajor?.major || "";

    secondaryCollegeSelect.value =
      profile.secondaryMajor?.college ||
      "해당 없음";

    renderMajorOptions(
      secondaryCollegeSelect,
      secondaryMajorSelect,
      true
    );

    secondaryMajorSelect.value =
      profile.secondaryMajor?.major ||
      "해당 없음";

    document
      .querySelectorAll(
        "input[name='certificates']"
      )
      .forEach((checkbox) => {
        checkbox.checked =
          profile.certificates
            ?.includes(
              checkbox.value
            ) || false;
      });

    document
      .getElementById("interests")
      .value =
        profile.interests || "";

    document
      .getElementById("goal")
      .value =
        profile.goal ||
        "수익 창출";

    document
      .getElementById("budget")
      .value =
        profile.budget || "";

    document
      .getElementById("time")
      .value =
        profile.time || "";

    document
      .getElementById("businessType")
      .value =
        profile.businessType ||
        "온라인 서비스";

    document
      .getElementById("target")
      .value =
        profile.target || "";

    document
      .getElementById("avoid")
      .value =
        profile.avoid || "";
  }

  async function loadProject(projectId) {
    try {
      const [
        projectResponse,
        recommendationResponse,
        analysisResponse
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
            .from("analyses")
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

      if (projectResponse.error) {
        throw projectResponse.error;
      }

      if (recommendationResponse.error) {
        throw recommendationResponse.error;
      }

      if (analysisResponse.error) {
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
          recommendation?.ideas || []
        );

      selectedIdea =
        project.selected_idea || null;

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
      } else {
        analysisSection
          .classList
          .add("hidden");

        hideStatus(
          analysisStatusCard
        );
      }

      planSection
        .classList
        .add("hidden");

      hideStatus(
        planStatusCard
      );

      closeProjectsModal();

      recommendationSection
        .scrollIntoView({
          behavior: "smooth",
          block: "start"
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
     8. 프로젝트 삭제
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
          .from("projects")
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
     9. 기존 기능 확장
  ======================================================= */

  const originalRenderIdeas =
    renderIdeas;

  renderIdeas =
    function renderIdeasWithSaveButton(ideas) {
      originalRenderIdeas(ideas);

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
     10. 이벤트 연결
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

      inputPanel
        .scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
    }
  );

  projectsModal.addEventListener(
    "click",
    (event) => {
      if (
        event.target ===
        projectsModal
      ) {
        closeProjectsModal();
      }
    }
  );

  /* =======================================================
     11. 초기화
  ======================================================= */

  synchronizeProjectAuthUI();

  console.info(
    "KU STARTUP PLANNER 프로젝트 관리 기능이 연결되었습니다."
  );
})();
