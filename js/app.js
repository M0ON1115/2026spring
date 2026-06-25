/* KU STARTUP PLANNER - refactored front-end */



    const FRONTEND_VERSION =
      "20260625-forecast-validation-1";

    function ensureValidationWorkspaceUi() {
      if (
        get("validationTabBtn")
      ) {
        return;
      }

      const nav =
        document.querySelector(
          ".workspace-tab-nav"
        );

      const forecastPanel =
        get("forecastTabPanel");

      if (
        !nav ||
        !forecastPanel
      ) {
        return;
      }

      const tabButton =
        createElement(
          "button",
          "tab-btn"
        );

      tabButton.id =
        "validationTabBtn";

      tabButton.type =
        "button";

      tabButton.appendChild(
        document.createTextNode(
          "시장 검증 "
        )
      );

      const badge =
        createElement(
          "span",
          "tab-badge",
          "대기"
        );

      badge.id =
        "validationTabBadge";

      tabButton.appendChild(badge);
      nav.appendChild(tabButton);

      const panel =
        createElement(
          "section",
          "tab-panel hidden"
        );

      panel.id =
        "validationTabPanel";

      panel.appendChild(
        createElement(
          "div",
          "forecast-intro",
          "선택한 창업 아이템을 실제 시장에서 검증하기 위한 진행 상황을 기록합니다."
        )
      );

      const progressCard =
        createElement(
          "div",
          "validation-progress-card"
        );

      const progressHead =
        createElement(
          "div",
          "project-progress-head"
        );

      progressHead.appendChild(
        createElement(
          "span",
          "",
          "프로젝트 진행률"
        )
      );

      const progressText =
        createElement(
          "span",
          "",
          "0% · 0/7"
        );

      progressText.id =
        "validationProgressText";

      progressHead.appendChild(
        progressText
      );

      const progressTrack =
        createElement(
          "div",
          "project-progress-track"
        );

      const progressFill =
        createElement(
          "div",
          "project-progress-fill"
        );

      progressFill.id =
        "validationProgressFill";

      progressTrack.appendChild(
        progressFill
      );

      progressCard.appendChild(
        progressHead
      );

      progressCard.appendChild(
        progressTrack
      );

      panel.appendChild(
        progressCard
      );

      const checklist =
        createElement(
          "div",
          "validation-checklist"
        );

      checklist.id =
        "validationChecklist";

      panel.appendChild(
        checklist
      );

      forecastPanel.insertAdjacentElement(
        "afterend",
        panel
      );
    }

    function ensureValidationStyles() {
      if (
        get("validationDynamicStyles")
      ) {
        return;
      }

      const style =
        document.createElement("style");

      style.id =
        "validationDynamicStyles";

      style.textContent =
        `.workspace-tab-nav{grid-template-columns:repeat(3,minmax(0,1fr));}.validation-progress-card{margin-top:18px;padding:17px;border:1px solid #e5e7eb;border-radius:18px;background:#f9fafb;}.validation-checklist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:18px;}.validation-item{display:flex;align-items:center;gap:10px;padding:15px;border:1px solid #e5e7eb;border-radius:18px;background:white;box-shadow:0 8px 22px rgba(134,38,51,.05);color:#374151;font-size:14px;font-weight:800;line-height:1.55;}.validation-item input{width:auto;margin:0;accent-color:#862633;}@media(max-width:900px){.validation-checklist{grid-template-columns:1fr;}}`;

      document.head.appendChild(
        style
      );
    }

    const validationItems = [
      ["customerInterviewGoal", "고객 인터뷰 목표 설정"],
      ["surveyRecorded", "설문조사 진행 여부 기록"],
      ["competitorResearch", "경쟁 서비스 조사 기록"],
      ["landingPageReady", "랜딩 페이지 제작 여부"],
      ["mvpReady", "MVP 제작 여부"],
      ["firstUsers", "첫 사용자 확보 여부"],
      ["firstPayment", "첫 결제 발생 여부"]
    ];

    function createEmptyValidationChecklist() {
      return validationItems.reduce(
        (checklist, [key]) => {
          checklist[key] =
            false;

          return checklist;
        },
        {}
      );
    }

    function normalizeValidationChecklist(raw) {
      const base =
        createEmptyValidationChecklist();

      if (
        raw &&
        typeof raw === "object"
      ) {
        validationItems.forEach(
          ([key]) => {
            base[key] =
              raw[key] === true;
          }
        );
      }

      return base;
    }

    function getValidationChecklist() {
      state.validationChecklist =
        normalizeValidationChecklist(
          state.validationChecklist
        );

      return state.validationChecklist;
    }

    function completedValidationCount(checklist) {
      const normalized =
        normalizeValidationChecklist(
          checklist
        );

      return validationItems.filter(
        ([key]) =>
          normalized[key]
      ).length;
    }

    function hasStartedValidation(checklist) {
      return completedValidationCount(
        checklist
      ) > 0;
    }

    function isValidationComplete(checklist) {
      return completedValidationCount(
        checklist
      ) === validationItems.length;
    }

    function selectedIdeaForProjectSave() {
      if (
        !state.selectedIdea
      ) {
        return null;
      }

      return {
        ...state.selectedIdea,

        validationChecklist:
          getValidationChecklist()
      };
    }

    function stripValidationFromSelectedIdea(selectedIdea) {
      if (
        !selectedIdea
      ) {
        return null;
      }

      const {
        validationChecklist,
        ...cleanSelectedIdea
      } = selectedIdea;

      return cleanSelectedIdea;
    }

    function extractValidationChecklist(selectedIdea) {
      return normalizeValidationChecklist(
        selectedIdea?.validationChecklist
      );
    }

    function validationStatusFromChecklist(checklist, fallbackStatus) {
      if (
        isValidationComplete(
          checklist
        )
      ) {
        return "mvp_validated";
      }

      if (
        hasStartedValidation(
          checklist
        )
      ) {
        return "validating";
      }

      return fallbackStatus;
    }

    function validationProgressPercent(checklist) {
      if (
        isValidationComplete(
          checklist
        )
      ) {
        return 100;
      }

      if (
        hasStartedValidation(
          checklist
        )
      ) {
        return 85;
      }

      if (
        state.forecast
      ) {
        return 75;
      }

      if (
        state.analysis
      ) {
        return 60;
      }

      if (
        state.selectedIdea
      ) {
        return 40;
      }

      return 25;
    }

    function renderValidationProgress() {
      if (
        !get("validationProgressFill")
      ) {
        return;
      }

      const checklist =
        getValidationChecklist();

      const completed =
        completedValidationCount(
          checklist
        );

      const percent =
        validationProgressPercent(
          checklist
        );

      get("validationProgressFill").style.width =
        `${percent}%`;

      get("validationProgressText").textContent =
        `${percent}% · ${completed}/${validationItems.length}`;

      get("validationTabBadge").textContent =
        completed === 0
          ? "대기"
          : completed === validationItems.length
            ? "✓ 완료"
            : `${completed}/${validationItems.length}`;
    }

    function renderValidationChecklist() {
      const list =
        get("validationChecklist");

      if (
        !list
      ) {
        return;
      }

      const checklist =
        getValidationChecklist();

      clear(list);

      validationItems.forEach(
        ([key, labelText]) => {
          const label =
            createElement(
              "label",
              "validation-item"
            );

          const checkbox =
            document.createElement("input");

          checkbox.type =
            "checkbox";

          checkbox.checked =
            checklist[key];

          checkbox.addEventListener(
            "change",
            async () => {
              state.validationChecklist[key] =
                checkbox.checked;

              renderValidationProgress();

              try {
                await saveValidationIfNeeded();
              } catch (error) {
                alert(
                  `시장 검증 체크리스트 저장에 실패했습니다: ${error.message}`
                );
              }
            }
          );

          label.appendChild(checkbox);

          label.appendChild(
            createElement(
              "span",
              "",
              labelText
            )
          );

          list.appendChild(label);
        }
      );

      renderValidationProgress();
    }

    function clearValidationUI() {
      state.validationChecklist =
        createEmptyValidationChecklist();

      state.savedValidationSignature =
        null;

      if (
        get("validationChecklist")
      ) {
        clear(
          get("validationChecklist")
        );
      }

      renderValidationProgress();
    }

    async function saveValidationIfNeeded() {
      if (
        !state.currentProjectId ||
        !state.selectedIdea
      ) {
        return;
      }

      const currentSignature =
        signature(
          getValidationChecklist()
        );

      if (
        state.savedValidationSignature ===
        currentSignature
      ) {
        return;
      }

      await syncProjectMetadata();

      state.savedValidationSignature =
        currentSignature;
    }

    function patchValidationProjectFlow() {
      const originalDeriveStatus =
        deriveStatus;

      deriveStatus =
        function deriveStatusWithValidation() {
          return validationStatusFromChecklist(
            state.validationChecklist,
            originalDeriveStatus()
          );
        };

      syncProjectMetadata =
        async function syncProjectMetadataWithValidation() {
          if (
            !state.currentProjectId
          ) {
            return;
          }

          const {
            error
          } =
            await supabaseClient
              .from("projects")
              .update({
                title:
                  state.selectedIdea?.name ||
                  "새 창업 프로젝트",

                status:
                  deriveStatus(),

                selected_idea:
                  selectedIdeaForProjectSave()
              })
              .eq(
                "id",
                state.currentProjectId
              );

          if (error) {
            throw error;
          }
        };

      const originalStatusLabel =
        statusLabel;

      statusLabel =
        (status) => ({
          validating:
            "시장 검증 진행 중",

          mvp_validated:
            "MVP 검증 완료"
        }[status] || originalStatusLabel(status));

      const originalProgress =
        progress;

      progress =
        (status) => ({
          validating:
            85,

          mvp_validated:
            100
        }[status] || originalProgress(status));

      const originalNextAction =
        nextAction;

      nextAction =
        (status) => ({
          validating:
            "남은 시장 검증 항목을 완료하세요.",

          mvp_validated:
            "MVP 검증 결과를 바탕으로 다음 실행 계획을 세우세요."
        }[status] || originalNextAction(status));

      const originalFetchProjects =
        fetchProjects;

      fetchProjects =
        async function fetchProjectsWithValidation() {
          const projects =
            await originalFetchProjects();

          return projects.map(
            (project) => ({
              ...project,

              status:
                validationStatusFromChecklist(
                  project.selected_idea?.validationChecklist,
                  project.status
                )
            })
          );
        };

      const originalLoadProject =
        loadProject;

      loadProject =
        async function loadProjectWithValidation(projectId) {
          await originalLoadProject(projectId);

          state.validationChecklist =
            extractValidationChecklist(
              state.selectedIdea
            );

          state.selectedIdea =
            stripValidationFromSelectedIdea(
              state.selectedIdea
            );

          state.savedValidationSignature =
            signature(
              getValidationChecklist()
            );

          renderValidationChecklist();
        };
    }

    ensureValidationWorkspaceUi();
    ensureValidationStyles();
    patchValidationProjectFlow();



    /* =====================================================
       17. Event Bindings
    ===================================================== */

    get("heroStartBtn").addEventListener(
      "click",
      () => {
        get("inputPanel").scrollIntoView({
          behavior:
            "smooth"
        });
      }
    );

    get("heroSampleBtn").addEventListener(
      "click",
      fillSample
    );

    get("sampleBtn").addEventListener(
      "click",
      fillSample
    );

    get("resetBtn").addEventListener(
      "click",
      () => {
        window.location.reload();
      }
    );

    get("recommendBtn").addEventListener(
      "click",
      recommend
    );

    get("planBtn").addEventListener(
      "click",
      generatePlan
    );

    get("copyPlanBtn").addEventListener(
      "click",
      async () => {
        try {
          await navigator.clipboard.writeText(
            get("planBox").innerText
          );

          alert(
            "창업 계획 초안이 복사되었습니다."
          );
        } catch {
          alert(
            "복사에 실패했습니다."
          );
        }
      }
    );

    get("analysisTabBtn").addEventListener(
      "click",
      () => {
        showTab(
          "analysis"
        );
      }
    );

    get("forecastTabBtn").addEventListener(
      "click",
      () => {
        if (
          !get("forecastTabBtn").disabled
        ) {
          showTab(
            "forecast"
          );
        }
      }
    );

    get("validationTabBtn").addEventListener(
      "click",
      () => {
        renderValidationChecklist();

        showTab(
          "validation"
        );
      }
    );

    get("forecastBtn").addEventListener(
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
    );

    get("saveProjectBtn").addEventListener(
      "click",
      saveProject
    );

    get("loginBtn").addEventListener(
      "click",
      () => {
        get("authModal").classList.remove(
          "hidden"
        );
      }
    );

    get("logoutBtn").addEventListener(
      "click",
      logout
    );

    get("googleLoginBtn").addEventListener(
      "click",
      loginWithGoogle
    );

    get("guestContinueBtn").addEventListener(
      "click",
      () => {
        get("authModal").classList.add(
          "hidden"
        );
      }
    );

    get("closeAuthModalBtn").addEventListener(
      "click",
      () => {
        get("authModal").classList.add(
          "hidden"
        );
      }
    );

    get("myProjectsBtn").addEventListener(
      "click",
      showProjects
    );

    get("closeProjectsModalBtn").addEventListener(
      "click",
      () => {
        get("projectsModal").classList.add(
          "hidden"
        );
      }
    );

    get("newProjectBtn").addEventListener(
      "click",
      () => {
        window.location.reload();
      }
    );

    get("primaryCollege").addEventListener(
      "change",
      () => {
        renderMajorOptions(
          "primaryCollege",
          "primaryMajor",
          false
        );
      }
    );

    get("secondaryCollege").addEventListener(
      "change",
      () => {
        renderMajorOptions(
          "secondaryCollege",
          "secondaryMajor",
          true
        );
      }
    );

    get("certificateChecklist").addEventListener(
      "change",
      handleCertificateChange
    );



    /* =====================================================
       18. Self Tests
    ===================================================== */

    console.assert(
      typeof analyzeForecast ===
        "function",
      "경제 전망 함수 연결 실패"
    );

    console.assert(
      get("forecastBtn") !==
        null,
      "경제 전망 버튼 연결 실패"
    );

    console.assert(
      get("forecastTabPanel") !==
        null,
      "경제 전망 독립 탭 연결 실패"
    );

    console.assert(
      typeof renderValidationChecklist ===
        "function",
      "시장 검증 체크리스트 연결 실패"
    );



    /* =====================================================
       19. Initialize
    ===================================================== */

    renderCollegeOptions();

    renderMajorOptions(
      "primaryCollege",
      "primaryMajor",
      false
    );

    renderMajorOptions(
      "secondaryCollege",
      "secondaryMajor",
      true
    );

    renderCertificates();

    initializeAuth();

    renderValidationChecklist();

    console.info(
      "KU STARTUP PLANNER front-end loaded:",
      FRONTEND_VERSION
    );
