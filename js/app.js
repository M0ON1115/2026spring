/* KU STARTUP PLANNER - refactored front-end */



    const FRONTEND_VERSION =
      "20260625-validation-log-edit-final";

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

      const completionMessage =
        createElement(
          "div",
          "validation-completion-message hidden",
          VALIDATION_COMPLETE_MESSAGE
        );

      completionMessage.id =
        "validationCompletionMessage";

      panel.appendChild(
        completionMessage
      );

      const memoSection =
        createElement(
          "section",
          "validation-section validation-memo-section"
        );

      memoSection.appendChild(
        createElement(
          "h3",
          "section-heading",
          "프로젝트 메모"
        )
      );

      memoSection.appendChild(
        createElement(
          "p",
          "validation-section-desc",
          "인터뷰 결과, 고객 반응, 아이템 수정 방향 등 프로젝트 진행 중 확인한 내용을 기록합니다."
        )
      );

      const memoInput =
        document.createElement("textarea");

      memoInput.id =
        "projectMemoInput";

      memoInput.className =
        "validation-textarea";

      memoInput.rows =
        5;

      memoInput.placeholder =
        "예: 대학생 5명 인터뷰 결과, 과제 초안 작성 기능에 대한 수요는 있으나 표절 우려가 큼.";

      memoSection.appendChild(
        memoInput
      );

      const memoHelper =
        createElement(
          "div",
          "validation-helper",
          "메모는 프로젝트 저장 데이터에 함께 보관됩니다."
        );

      memoHelper.id =
        "projectMemoHelper";

      memoSection.appendChild(
        memoHelper
      );

      panel.appendChild(
        memoSection
      );

      const logSection =
        createElement(
          "section",
          "validation-section validation-log-section"
        );

      logSection.appendChild(
        createElement(
          "h3",
          "section-heading",
          "검증 기록"
        )
      );

      logSection.appendChild(
        createElement(
          "p",
          "validation-section-desc",
          "고객 인터뷰, 설문조사, 경쟁 조사, 아이디어 수정 등 시장 검증 과정에서 확인한 내용을 기록 단위로 추가·삭제합니다."
        )
      );

      const logForm =
        createElement(
          "div",
          "validation-log-form"
        );

      const logType =
        document.createElement("select");

      logType.id =
        "validationLogType";

      logType.className =
        "validation-input";

      [
        ["customer_interview", "고객 인터뷰"],
        ["survey", "설문조사"],
        ["competitor_research", "경쟁 조사"],
        ["idea_revision", "아이디어 수정"],
        ["mvp_test", "MVP 테스트"],
        ["payment_test", "결제 검증"],
        ["other", "기타"]
      ].forEach(([value, label]) => {
        const option =
          document.createElement("option");

        option.value =
          value;

        option.textContent =
          label;

        logType.appendChild(option);
      });

      const logDate =
        document.createElement("input");

      logDate.id =
        "validationLogDate";

      logDate.type =
        "date";

      logDate.className =
        "validation-input";

      const logTitle =
        document.createElement("input");

      logTitle.id =
        "validationLogTitle";

      logTitle.type =
        "text";

      logTitle.className =
        "validation-input";

      logTitle.placeholder =
        "기록 제목";

      const logContent =
        document.createElement("textarea");

      logContent.id =
        "validationLogContent";

      logContent.className =
        "validation-textarea";

      logContent.rows =
        4;

      logContent.placeholder =
        "예: 고려대 학생 5명 인터뷰. 과제 초안 작성 기능에는 관심이 있었지만 표절 우려가 컸음.";

      const addLogButton =
        createElement(
          "button",
          "validation-log-add-btn",
          "기록 추가"
        );

      addLogButton.id =
        "addValidationLogBtn";

      addLogButton.type =
        "button";

      const cancelEditButton =
        createElement(
          "button",
          "validation-log-cancel-edit-btn hidden",
          "수정 취소"
        );

      cancelEditButton.id =
        "cancelValidationLogEditBtn";

      cancelEditButton.type =
        "button";

      logForm.appendChild(logType);
      logForm.appendChild(logDate);
      logForm.appendChild(logTitle);
      logForm.appendChild(logContent);
      logForm.appendChild(addLogButton);
      logForm.appendChild(cancelEditButton);

      logSection.appendChild(logForm);

      const logList =
        createElement(
          "div",
          "validation-log-list"
        );

      logList.id =
        "validationLogList";

      logSection.appendChild(logList);

      panel.appendChild(
        logSection
      );

      const historySection =
        createElement(
          "section",
          "validation-section validation-history-section"
        );

      historySection.appendChild(
        createElement(
          "h3",
          "section-heading",
          "자동 변경 이력"
        )
      );

      historySection.appendChild(
        createElement(
          "p",
          "validation-section-desc",
          "체크리스트 변경, 메모 수정, 날짜 변경이 발생하면 자동으로 남는 내부 변경 기록입니다."
        )
      );

      const historyList =
        createElement(
          "div",
          "validation-history-list"
        );

      historyList.id =
        "validationHistoryList";

      historySection.appendChild(
        historyList
      );

      panel.appendChild(
        historySection
      );

      const comparisonSection =
        createElement(
          "section",
          "validation-section validation-comparison-section"
        );

      comparisonSection.appendChild(
        createElement(
          "h3",
          "section-heading",
          "분석 기록 요약"
        )
      );

      const comparisonBox =
        createElement(
          "div",
          "validation-comparison-box"
        );

      comparisonBox.id =
        "validationComparisonBox";

      comparisonSection.appendChild(
        comparisonBox
      );

      panel.appendChild(
        comparisonSection
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
        `.workspace-tab-nav{grid-template-columns:repeat(3,minmax(0,1fr));}.validation-progress-card,.validation-section{margin-top:18px;padding:17px;border:1px solid #e5e7eb;border-radius:18px;background:#f9fafb;}.validation-checklist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:18px;}.validation-item{display:block;padding:15px;border:1px solid #e5e7eb;border-radius:18px;background:white;box-shadow:0 8px 22px rgba(134,38,51,.05);color:#374151;font-size:14px;font-weight:800;line-height:1.55;}.validation-item-main{display:flex;align-items:center;gap:10px;}.validation-item input[type="checkbox"]{width:auto;margin:0;accent-color:#862633;}.validation-item-meta{display:grid;grid-template-columns:1fr 150px;gap:10px;margin-top:12px;}.validation-textarea,.validation-note-input,.validation-date-input,.validation-input{width:100%;border:1px solid #e5e7eb;border-radius:12px;background:white;color:#374151;font:inherit;font-size:13px;box-sizing:border-box;}.validation-textarea,.validation-note-input{min-height:76px;padding:10px;resize:vertical;line-height:1.6;}.validation-date-input,.validation-input{height:40px;padding:0 10px;}.validation-helper,.validation-section-desc{margin-top:8px;color:#6b7280;font-size:13px;line-height:1.6;}.validation-completion-message{margin-top:18px;padding:18px;border:1px solid #d8b4bc;border-radius:18px;background:#fbf4f5;color:#862633;font-size:15px;font-weight:900;line-height:1.6;text-align:center;box-shadow:0 10px 24px rgba(134,38,51,.08);}.validation-completion-message.hidden{display:none;}.validation-history-list{display:grid;gap:10px;margin-top:12px;}.validation-history-item{padding:12px 14px;border:1px solid #e5e7eb;border-radius:14px;background:white;color:#374151;font-size:13px;line-height:1.55;}.validation-history-time{display:block;margin-bottom:4px;color:#862633;font-weight:900;}.validation-history-empty{padding:12px 14px;border:1px dashed #d1d5db;border-radius:14px;color:#6b7280;background:white;font-size:13px;}.validation-log-form{display:grid;grid-template-columns:160px 150px 1fr;gap:10px;margin-top:14px;}.validation-log-form .validation-textarea{grid-column:1 / -1;}.validation-log-add-btn{grid-column:1 / -1;height:42px;border:0;border-radius:12px;background:#862633;color:white;font-weight:900;cursor:pointer;}.validation-log-list{display:grid;gap:12px;margin-top:14px;}.validation-log-item{padding:14px;border:1px solid #e5e7eb;border-radius:16px;background:white;color:#374151;font-size:13px;line-height:1.65;}.validation-log-item-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px;color:#862633;font-weight:900;}.validation-log-item-meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}.validation-log-item-actions{display:flex;gap:6px;align-items:center;}.validation-log-edit-btn,.validation-log-delete-btn{border:1px solid #e5e7eb;border-radius:999px;background:#fff;color:#862633;font-size:12px;font-weight:900;padding:5px 10px;cursor:pointer;}.validation-log-edit-btn:hover,.validation-log-delete-btn:hover{background:#fbf4f5;}.validation-log-cancel-edit-btn{grid-column:1 / -1;height:38px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;color:#374151;font-weight:900;cursor:pointer;}.validation-log-cancel-edit-btn.hidden{display:none;}.validation-log-item-title{display:block;margin-bottom:4px;color:#111827;font-weight:900;font-size:14px;}.validation-log-empty{padding:12px 14px;border:1px dashed #d1d5db;border-radius:14px;color:#6b7280;background:white;font-size:13px;}.validation-comparison-box{display:grid;gap:10px;margin-top:12px;}.validation-comparison-item{padding:12px 14px;border:1px solid #e5e7eb;border-radius:14px;background:white;color:#374151;font-size:13px;line-height:1.6;}.validation-comparison-item strong{display:block;margin-bottom:4px;color:#862633;}@media(max-width:900px){.validation-checklist{grid-template-columns:1fr;}.validation-item-meta,.validation-log-form{grid-template-columns:1fr;}}`;

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

    const VALIDATION_COMPLETE_MESSAGE =
      "모든 과제를 완료하셨습니다. 행운을 빕니다!";

    let validationCompletionAnnounced =
      false;

    let editingValidationLogId =
      null;

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
            const value =
              raw[key];

            base[key] =
              value === true ||
              value?.done === true ||
              value?.checked === true;
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

    function normalizeValidationNotes(raw) {
      const notes = {};

      validationItems.forEach(
        ([key]) => {
          const value =
            raw?.[key] ||
            {};

          notes[key] = {
            memo:
              typeof value.memo === "string"
                ? value.memo
                : "",

            date:
              typeof value.date === "string"
                ? value.date
                : ""
          };
        }
      );

      return notes;
    }

    function normalizeValidationHistory(raw) {
      return Array.isArray(raw)
        ? raw
            .filter(
              (entry) =>
                entry &&
                typeof entry.message === "string"
            )
            .map(
              (entry) => ({
                message:
                  entry.message,

                createdAt:
                  entry.createdAt ||
                  new Date().toISOString()
              })
            )
            .slice(-30)
        : [];
    }

    const validationLogTypeLabels = {
      customer_interview:
        "고객 인터뷰",

      survey:
        "설문조사",

      competitor_research:
        "경쟁 조사",

      idea_revision:
        "아이디어 수정",

      mvp_test:
        "MVP 테스트",

      payment_test:
        "결제 검증",

      other:
        "기타"
    };

    function createValidationLogId() {
      return `log_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;
    }

    function normalizeValidationLogs(raw) {
      return Array.isArray(raw)
        ? raw
            .filter(
              (entry) =>
                entry &&
                (typeof entry.title === "string" ||
                  typeof entry.content === "string")
            )
            .map(
              (entry) => ({
                id:
                  entry.id ||
                  createValidationLogId(),

                type:
                  validationLogTypeLabels[entry.type]
                    ? entry.type
                    : "other",

                title:
                  typeof entry.title === "string"
                    ? entry.title.trim()
                    : "",

                date:
                  typeof entry.date === "string"
                    ? entry.date
                    : "",

                content:
                  typeof entry.content === "string"
                    ? entry.content.trim()
                    : "",

                createdAt:
                  entry.createdAt ||
                  new Date().toISOString()
              })
            )
            .filter(
              (entry) =>
                entry.title ||
                entry.content
            )
            .slice(-50)
        : [];
    }

    function getValidationLogs() {
      state.validationLogs =
        normalizeValidationLogs(
          state.validationLogs
        );

      return state.validationLogs;
    }

    function getValidationNotes() {
      state.validationNotes =
        normalizeValidationNotes(
          state.validationNotes
        );

      return state.validationNotes;
    }

    function getValidationHistory() {
      state.validationHistory =
        normalizeValidationHistory(
          state.validationHistory
        );

      return state.validationHistory;
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
          getValidationChecklist(),

        validationNotes:
          getValidationNotes(),

        projectMemo:
          typeof state.projectMemo === "string"
            ? state.projectMemo
            : "",

        validationHistory:
          getValidationHistory(),

        validationLogs:
          getValidationLogs()
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
        validationNotes,
        projectMemo,
        validationHistory,
        validationLogs,
        ...cleanSelectedIdea
      } = selectedIdea;

      return cleanSelectedIdea;
    }

    function extractValidationChecklist(selectedIdea) {
      return normalizeValidationChecklist(
        selectedIdea?.validationChecklist
      );
    }

    function extractValidationNotes(selectedIdea) {
      return normalizeValidationNotes(
        selectedIdea?.validationNotes
      );
    }

    function extractProjectMemo(selectedIdea) {
      return typeof selectedIdea?.projectMemo === "string"
        ? selectedIdea.projectMemo
        : "";
    }

    function extractValidationHistory(selectedIdea) {
      return normalizeValidationHistory(
        selectedIdea?.validationHistory
      );
    }

    function extractValidationLogs(selectedIdea) {
      return normalizeValidationLogs(
        selectedIdea?.validationLogs
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

    function ensureValidationCompletionMessage() {
      if (
        get("validationCompletionMessage")
      ) {
        return get("validationCompletionMessage");
      }

      const panel =
        get("validationTabPanel");

      if (
        !panel
      ) {
        return null;
      }

      const message =
        createElement(
          "div",
          "validation-completion-message hidden",
          VALIDATION_COMPLETE_MESSAGE
        );

      message.id =
        "validationCompletionMessage";

      panel.appendChild(
        message
      );

      return message;
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

    function renderValidationProgress(options = {}) {
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

      const isComplete =
        completed === validationItems.length;

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
          : isComplete
            ? "✓ 완료"
            : `${completed}/${validationItems.length}`;

      const completionMessage =
        ensureValidationCompletionMessage();

      if (
        completionMessage
      ) {
        completionMessage.textContent =
          VALIDATION_COMPLETE_MESSAGE;

        completionMessage.classList.toggle(
          "hidden",
          !isComplete
        );

        completionMessage.setAttribute(
          "role",
          "status"
        );

        completionMessage.setAttribute(
          "aria-live",
          "polite"
        );

        if (
          isComplete &&
          options.announce === true &&
          !validationCompletionAnnounced
        ) {
          validationCompletionAnnounced =
            true;

          window.setTimeout(
            () => {
              alert(
                VALIDATION_COMPLETE_MESSAGE
              );

              completionMessage.scrollIntoView({
                behavior:
                  "smooth",
                block:
                  "center"
              });
            },
            0
          );
        }

        if (
          !isComplete
        ) {
          validationCompletionAnnounced =
            false;
        }
      }
    }

    function formatValidationDateTime(value) {
      const date =
        value
          ? new Date(value)
          : new Date();

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "기록 시각 확인 불가";
      }

      return new Intl.DateTimeFormat(
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
      ).format(date);
    }

    function appendValidationHistory(message) {
      const history =
        getValidationHistory();

      const last =
        history[history.length - 1];

      if (
        last?.message === message
      ) {
        return;
      }

      history.push({
        message,
        createdAt:
          new Date().toISOString()
      });

      state.validationHistory =
        history.slice(-30);
    }

    function renderValidationHistory() {
      const list =
        get("validationHistoryList");

      if (
        !list
      ) {
        return;
      }

      clear(list);

      const history =
        getValidationHistory();

      if (
        history.length === 0
      ) {
        list.appendChild(
          createElement(
            "div",
            "validation-history-empty",
            "아직 기록된 자동 변경 이력이 없습니다. 체크리스트, 프로젝트 메모, 검증 기록을 수정하면 자동으로 기록됩니다."
          )
        );

        return;
      }

      history
        .slice()
        .reverse()
        .forEach(
          (entry) => {
            const item =
              createElement(
                "div",
                "validation-history-item"
              );

            item.appendChild(
              createElement(
                "span",
                "validation-history-time",
                formatValidationDateTime(
                  entry.createdAt
                )
              )
            );

            item.appendChild(
              createElement(
                "span",
                "",
                entry.message
              )
            );

            list.appendChild(item);
          }
        );
    }

    function renderValidationLogs() {
      const list =
        get("validationLogList");

      if (
        !list
      ) {
        return;
      }

      clear(list);

      const logs =
        getValidationLogs();

      if (
        logs.length === 0
      ) {
        list.appendChild(
          createElement(
            "div",
            "validation-log-empty",
            "아직 추가된 검증 기록이 없습니다. 인터뷰, 설문조사, 경쟁 조사 결과를 기록 단위로 추가해보세요."
          )
        );

        return;
      }

      logs
        .slice()
        .reverse()
        .forEach(
          (entry) => {
            const item =
              createElement(
                "div",
                "validation-log-item"
              );

            const head =
              createElement(
                "div",
                "validation-log-item-head"
              );

            const meta =
              createElement(
                "div",
                "validation-log-item-meta"
              );

            meta.appendChild(
              createElement(
                "span",
                "",
                validationLogTypeLabels[entry.type] ||
                "기타"
              )
            );

            meta.appendChild(
              createElement(
                "span",
                "",
                entry.date ||
                formatValidationDateTime(entry.createdAt)
              )
            );

            const actions =
              createElement(
                "div",
                "validation-log-item-actions"
              );

            const editButton =
              createElement(
                "button",
                "validation-log-edit-btn",
                "수정"
              );

            editButton.type =
              "button";

            editButton.addEventListener(
              "click",
              () => {
                handleEditValidationLog(
                  entry.id
                );
              }
            );

            const deleteButton =
              createElement(
                "button",
                "validation-log-delete-btn",
                "삭제"
              );

            deleteButton.type =
              "button";

            deleteButton.addEventListener(
              "click",
              async () => {
                await handleDeleteValidationLog(
                  entry.id
                );
              }
            );

            actions.appendChild(editButton);
            actions.appendChild(deleteButton);

            head.appendChild(meta);
            head.appendChild(actions);
            item.appendChild(head);

            item.appendChild(
              createElement(
                "strong",
                "validation-log-item-title",
                entry.title ||
                "제목 없는 기록"
              )
            );

            item.appendChild(
              createElement(
                "div",
                "",
                entry.content ||
                "내용 없음"
              )
            );

            list.appendChild(item);
          }
        );
    }

    function setValidationLogEditMode(logId) {
      const addButton =
        get("addValidationLogBtn");

      const cancelButton =
        get("cancelValidationLogEditBtn");

      editingValidationLogId =
        logId;

      if (
        addButton
      ) {
        addButton.textContent =
          logId
            ? "수정 저장"
            : "기록 추가";
      }

      if (
        cancelButton
      ) {
        cancelButton.classList.toggle(
          "hidden",
          !logId
        );
      }
    }

    function clearValidationLogForm() {
      const dateInput =
        get("validationLogDate");

      const titleInput =
        get("validationLogTitle");

      const contentInput =
        get("validationLogContent");

      if (dateInput) {
        dateInput.value =
          "";
      }

      if (titleInput) {
        titleInput.value =
          "";
      }

      if (contentInput) {
        contentInput.value =
          "";
      }
    }

    function handleCancelValidationLogEdit() {
      setValidationLogEditMode(
        null
      );

      clearValidationLogForm();
    }

    function handleEditValidationLog(logId) {
      const logs =
        getValidationLogs();

      const target =
        logs.find(
          (entry) =>
            entry.id === logId
        );

      if (
        !target
      ) {
        return;
      }

      const typeInput =
        get("validationLogType");

      const dateInput =
        get("validationLogDate");

      const titleInput =
        get("validationLogTitle");

      const contentInput =
        get("validationLogContent");

      if (typeInput) {
        typeInput.value =
          target.type ||
          "other";
      }

      if (dateInput) {
        dateInput.value =
          target.date ||
          "";
      }

      if (titleInput) {
        titleInput.value =
          target.title ||
          "";
      }

      if (contentInput) {
        contentInput.value =
          target.content ||
          "";
      }

      setValidationLogEditMode(
        logId
      );

      get("validationLogType")?.scrollIntoView({
        behavior:
          "smooth",
        block:
          "center"
      });
    }

    async function handleDeleteValidationLog(logId) {
      const logs =
        getValidationLogs();

      const target =
        logs.find(
          (entry) =>
            entry.id === logId
        );

      if (
        !target
      ) {
        return;
      }

      const shouldDelete =
        window.confirm(
          `검증 기록 "${target.title || "제목 없는 기록"}"을 삭제할까요?`
        );

      if (
        !shouldDelete
      ) {
        return;
      }

      state.validationLogs =
        logs.filter(
          (entry) =>
            entry.id !== logId
        );

      appendValidationHistory(
        `검증 기록 "${target.title || "제목 없는 기록"}"을 삭제했습니다.`
      );

      renderValidationLogs();
      renderValidationHistory();
      renderValidationComparison();

      try {
        await saveValidationIfNeeded();
      } catch (error) {
        alert(
          `검증 기록 삭제 저장에 실패했습니다: ${error.message}`
        );
      }
    }

    async function handleAddValidationLog() {
      const typeInput =
        get("validationLogType");

      const dateInput =
        get("validationLogDate");

      const titleInput =
        get("validationLogTitle");

      const contentInput =
        get("validationLogContent");

      if (
        !typeInput ||
        !dateInput ||
        !titleInput ||
        !contentInput
      ) {
        return;
      }

      const title =
        titleInput.value.trim();

      const content =
        contentInput.value.trim();

      if (
        !title &&
        !content
      ) {
        alert(
          "검증 기록의 제목 또는 내용을 입력하세요."
        );

        return;
      }

      const logs =
        getValidationLogs();

      if (
        editingValidationLogId
      ) {
        const targetIndex =
          logs.findIndex(
            (entry) =>
              entry.id === editingValidationLogId
          );

        if (
          targetIndex === -1
        ) {
          setValidationLogEditMode(
            null
          );

          alert(
            "수정할 검증 기록을 찾지 못했습니다."
          );

          return;
        }

        logs[targetIndex] = {
          ...logs[targetIndex],

          type:
            typeInput.value,

          title,

          date:
            dateInput.value,

          content,

          updatedAt:
            new Date().toISOString()
        };

        state.validationLogs =
          logs.slice(-50);

        appendValidationHistory(
          `검증 기록 "${title || "제목 없는 기록"}"을 수정했습니다.`
        );

        setValidationLogEditMode(
          null
        );
      } else {
        logs.push({
          id:
            createValidationLogId(),

          type:
            typeInput.value,

          title,

          date:
            dateInput.value,

          content,

          createdAt:
            new Date().toISOString()
        });

        state.validationLogs =
          logs.slice(-50);

        appendValidationHistory(
          `${validationLogTypeLabels[typeInput.value] || "검증"} 기록을 추가했습니다.`
        );
      }

      clearValidationLogForm();

      renderValidationLogs();
      renderValidationHistory();
      renderValidationComparison();

      try {
        await saveValidationIfNeeded();
      } catch (error) {
        alert(
          `검증 기록 저장에 실패했습니다: ${error.message}`
        );
      }
    }

    function renderProjectMemo() {
      const input =
        get("projectMemoInput");

      if (
        !input
      ) {
        return;
      }

      input.value =
        typeof state.projectMemo === "string"
          ? state.projectMemo
          : "";
    }

    async function handleProjectMemoSave() {
      const input =
        get("projectMemoInput");

      if (
        !input
      ) {
        return;
      }

      const nextMemo =
        input.value.trim();

      if (
        nextMemo ===
        (state.projectMemo || "")
      ) {
        return;
      }

      state.projectMemo =
        nextMemo;

      appendValidationHistory(
        nextMemo
          ? "프로젝트 메모를 수정했습니다."
          : "프로젝트 메모를 비웠습니다."
      );

      renderValidationHistory();

      try {
        await saveValidationIfNeeded();
      } catch (error) {
        alert(
          `프로젝트 메모 저장에 실패했습니다: ${error.message}`
        );
      }
    }

    function renderValidationComparison() {
      const box =
        get("validationComparisonBox");

      if (
        !box
      ) {
        return;
      }

      clear(box);

      const items = [
        [
          "선택 아이템",
          state.selectedIdea?.name ||
          "아직 선택된 아이템이 없습니다."
        ],
        [
          "기본 분석",
          state.analysis
            ? `완료 · 종합 평가: ${state.analysis.summary || "요약 없음"}`
            : "아직 기본 분석이 없습니다."
        ],
        [
          "경제 전망",
          state.forecast
            ? `완료 · 분석 기준: ${formatValidationDateTime(state.forecast.fetchedAt)}`
            : "아직 최신 경제 전망이 없습니다."
        ],
        [
          "시장 검증",
          `${completedValidationCount(getValidationChecklist())}/${validationItems.length}개 항목 완료`
        ]
      ];

      items.forEach(
        ([title, body]) => {
          const item =
            createElement(
              "div",
              "validation-comparison-item"
            );

          item.appendChild(
            createElement(
              "strong",
              "",
              title
            )
          );

          item.appendChild(
            createElement(
              "span",
              "",
              body
            )
          );

          box.appendChild(item);
        }
      );
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
          const item =
            createElement(
              "div",
              "validation-item"
            );

          const main =
            createElement(
              "label",
              "validation-item-main"
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

              appendValidationHistory(
                `${labelText} 항목을 ${checkbox.checked ? "완료" : "미완료"}로 변경했습니다.`
              );

              renderValidationProgress({
                announce:
                  true
              });

              renderValidationHistory();
              renderValidationComparison();

              try {
                await saveValidationIfNeeded();
              } catch (error) {
                alert(
                  `시장 검증 체크리스트 저장에 실패했습니다: ${error.message}`
                );
              }
            }
          );

          main.appendChild(checkbox);

          main.appendChild(
            createElement(
              "span",
              "",
              labelText
            )
          );

          item.appendChild(main);
          list.appendChild(item);
        }
      );

      renderValidationProgress();
      renderProjectMemo();
      renderValidationLogs();
      renderValidationHistory();
      renderValidationComparison();
    }

    function clearValidationUI() {
      state.validationChecklist =
        createEmptyValidationChecklist();

      state.validationNotes =
        normalizeValidationNotes();

      state.projectMemo =
        "";

      state.validationHistory =
        [];

      state.validationLogs =
        [];

      state.savedValidationSignature =
        null;

      validationCompletionAnnounced =
        false;

      if (
        get("validationChecklist")
      ) {
        clear(
          get("validationChecklist")
        );
      }

      renderValidationProgress();
      renderValidationLogs();
    }

    async function saveValidationIfNeeded() {
      if (
        !state.currentProjectId ||
        !state.selectedIdea
      ) {
        return;
      }

      const currentSignature =
        signature({
          checklist:
            getValidationChecklist(),

          notes:
            getValidationNotes(),

          memo:
            state.projectMemo || "",

          history:
            getValidationHistory(),

          logs:
            getValidationLogs()
        });

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

      /*
       * DB의 projects.status는 기존 check constraint가 허용하는
       * draft/recommended/selected/analyzed/forecasted 값만 저장한다.
       *
       * 시장 검증 단계(validating, mvp_validated)는 selected_idea 안의
       * validationChecklist를 기준으로 화면에서만 계산한다.
       * 이렇게 해야 Supabase의 projects_status_check 오류를 피할 수 있다.
       */
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
                  originalDeriveStatus(),

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

          const rawSelectedIdea =
            state.selectedIdea;

          state.validationChecklist =
            extractValidationChecklist(
              rawSelectedIdea
            );

          state.validationNotes =
            extractValidationNotes(
              rawSelectedIdea
            );

          state.projectMemo =
            extractProjectMemo(
              rawSelectedIdea
            );

          state.validationHistory =
            extractValidationHistory(
              rawSelectedIdea
            );

          state.validationLogs =
            extractValidationLogs(
              rawSelectedIdea
            );

          state.selectedIdea =
            stripValidationFromSelectedIdea(
              rawSelectedIdea
            );

          state.savedValidationSignature =
            signature({
              checklist:
                getValidationChecklist(),

              notes:
                getValidationNotes(),

              memo:
                state.projectMemo || "",

              history:
                getValidationHistory(),

              logs:
                getValidationLogs()
            });

          renderValidationChecklist();
        };
    }

    ensureValidationWorkspaceUi();
    ensureValidationStyles();
    patchValidationProjectFlow();

    if (
      get("projectMemoInput")
    ) {
      get("projectMemoInput").addEventListener(
        "change",
        handleProjectMemoSave
      );
    }

    if (
      get("addValidationLogBtn")
    ) {
      get("addValidationLogBtn").addEventListener(
        "click",
        handleAddValidationLog
      );
    }

    if (
      get("cancelValidationLogEditBtn")
    ) {
      get("cancelValidationLogEditBtn").addEventListener(
        "click",
        handleCancelValidationLogEdit
      );
    }



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
