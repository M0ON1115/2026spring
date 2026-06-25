/* KU STARTUP PLANNER - refactored front-end */



    /* =====================================================
       11. Basic Analysis
    ===================================================== */

    function renderAnalysis() {
      const scoreGrid =
        get("scoreGrid");

      const analysisGrid =
        get("analysisGrid");

      clear(scoreGrid);
      clear(analysisGrid);

      Object.entries(
        state.analysis.scores
      ).forEach(
        ([label, value]) => {
          const item =
            createElement(
              "article",
              "score-item"
            );

          const head =
            createElement(
              "div",
              "score-head"
            );

          head.appendChild(
            createElement(
              "span",
              "",
              label
            )
          );

          head.appendChild(
            createElement(
              "span",
              "score-value",
              `${value}점`
            )
          );

          const track =
            createElement(
              "div",
              "score-track"
            );

          const fill =
            createElement(
              "div",
              "score-fill"
            );

          fill.style.width =
            `${value}%`;

          track.appendChild(fill);
          item.appendChild(head);
          item.appendChild(track);

          scoreGrid.appendChild(item);
        }
      );

      get("analysisSummary").textContent =
        state.analysis.summary;

      get("analysisSummary").classList.remove(
        "hidden"
      );

      Object.entries(
        analysisLabels
      ).forEach(
        ([key, label]) => {
          const card =
            createElement(
              "article",
              "analysis-card"
            );

          card.appendChild(
            createElement(
              "h3",
              "",
              label
            )
          );

          card.appendChild(
            createElement(
              "p",
              "",
              state.analysis.sections[key]
            )
          );

          analysisGrid.appendChild(card);
        }
      );

      get("analysisTabBadge").textContent =
        "✓ 완료";

      get("forecastTabBtn").disabled =
        false;
    }

    async function analyzeIdea(index) {
      const idea =
        state.ideas[index];

      state.selectedIdea =
        idea;

      state.analysis =
        null;

      state.forecast =
        null;

      state.validationChecklist =
        createEmptyValidationChecklist();

      state.planGenerated =
        false;

      clearForecastUI();
      clearValidationUI();

      get("selectedIdeaText").textContent =
        `선택한 아이템: ${idea.name}`;

      get("workspaceSection").classList.remove(
        "hidden"
      );

      get("planSection").classList.add(
        "hidden"
      );

      get("analysisTabBadge").textContent =
        "분석 중";

      get("forecastTabBadge").textContent =
        "분석 전";

      get("forecastTabBtn").disabled =
        true;

      renderValidationChecklist();

      showTab("analysis");

      showStatus(
        "analysisStatusCard",
        "analysisStatusText",
        "선택한 아이템을 심층 분석하는 중입니다..."
      );

      try {
        state.analysis =
          normalizeAnalysis(
            await callApi(
              "/api/analyze",
              {
                profile:
                  state.profile,

                idea
              }
            )
          );

        renderAnalysis();

        showStatus(
          "analysisStatusCard",
          "analysisStatusText",
          "아이템 심층 분석 완료!",
          true
        );

        await saveAnalysisIfNeeded();
      } catch (error) {
        hideStatus(
          "analysisStatusCard"
        );

        alert(
          `아이템 심층 분석에 실패했습니다: ${error.message}`
        );
      }
    }



    /* =====================================================
       12. Plan
    ===================================================== */

    function appendPlanSection(
      title,
      content
    ) {
      get("planBox").appendChild(
        createElement(
          "h3",
          "",
          title
        )
      );

      get("planBox").appendChild(
        createElement(
          "p",
          "",
          content
        )
      );
    }

    function generatePlan() {
      if (
        !state.analysis
      ) {
        alert(
          "먼저 기본 분석을 완료해주세요."
        );

        return;
      }

      clear(
        get("planBox")
      );

      showStatus(
        "planStatusCard",
        "planStatusText",
        "창업 계획 초안을 정리하는 중입니다..."
      );

      appendPlanSection(
        "1. 사업 개요",
        `${state.selectedIdea.name}\n${state.selectedIdea.summary}`
      );

      appendPlanSection(
        "2. 창업자 조건",
        [
          `제1전공: ${state.profile.primaryMajorText}`,
          `제2전공: ${state.profile.secondaryMajorText}`,
          `자격증: ${state.profile.certificates.join(", ")}`,
          `초기 자본: ${state.profile.budgetText}`,
          `투입 시간: ${state.profile.timeText}`
        ].join("\n")
      );

      appendPlanSection(
        "3. 핵심 고객과 문제",
        `${state.selectedIdea.customer}\n${state.selectedIdea.problem}`
      );

      appendPlanSection(
        "4. 시장성 분석",
        state.analysis.sections.market
      );

      appendPlanSection(
        "5. 경쟁 분석",
        state.analysis.sections.competition
      );

      appendPlanSection(
        "6. 수익 모델",
        state.analysis.sections.revenue
      );

      appendPlanSection(
        "7. MVP 계획",
        state.analysis.sections.mvp
      );

      appendPlanSection(
        "8. 리스크 대응",
        state.analysis.sections.risk
      );

      appendPlanSection(
        "9. 종합 결론",
        state.analysis.summary
      );

      state.planGenerated =
        true;

      get("planSection").classList.remove(
        "hidden"
      );

      showStatus(
        "planStatusCard",
        "planStatusText",
        "창업 계획 초안 생성 완료!",
        true
      );
    }
