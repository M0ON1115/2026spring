/* KU STARTUP PLANNER - refactored front-end */



    /* =====================================================
       14. Market Validation
    ===================================================== */

    const validationItems = [
      {
        key:
          "customerInterviewGoal",

        label:
          "고객 인터뷰 목표 설정"
      },

      {
        key:
          "surveyRecorded",

        label:
          "설문조사 진행 여부 기록"
      },

      {
        key:
          "competitorResearch",

        label:
          "경쟁 서비스 조사 기록"
      },

      {
        key:
          "landingPageReady",

        label:
          "랜딩 페이지 제작 여부"
      },

      {
        key:
          "mvpReady",

        label:
          "MVP 제작 여부"
      },

      {
        key:
          "firstUsers",

        label:
          "첫 사용자 확보 여부"
      },

      {
        key:
          "firstPayment",

        label:
          "첫 결제 발생 여부"
      }
    ];

    function createEmptyValidationChecklist() {
      return validationItems.reduce(
        (checklist, item) => {
          checklist[item.key] =
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
          (item) => {
            base[item.key] =
              raw[item.key] === true;
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
        (item) =>
          normalized[item.key]
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

    function extractValidationChecklist(selectedIdea) {
      return normalizeValidationChecklist(
        selectedIdea?.validationChecklist
      );
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
        (item) => {
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
            checklist[item.key];

          checkbox.addEventListener(
            "change",
            async () => {
              state.validationChecklist[item.key] =
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
              item.label
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

      if (
        get("validationProgressFill")
      ) {
        get("validationProgressFill").style.width =
          "0%";
      }

      if (
        get("validationProgressText")
      ) {
        get("validationProgressText").textContent =
          "0% · 0/7";
      }

      if (
        get("validationTabBadge")
      ) {
        get("validationTabBadge").textContent =
          "대기";
      }
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
