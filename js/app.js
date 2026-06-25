/* KU STARTUP PLANNER - refactored front-end */



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

    console.info(
      "KU STARTUP PLANNER front-end loaded:",
      "20260625-forecast-renderer-1"
    );
