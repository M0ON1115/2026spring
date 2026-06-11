/* KU STARTUP PLANNER - refactored front-end */



    /* =====================================================
       10. Render Ideas
    ===================================================== */

    function renderIdeas() {
      const container =
        get("ideaCards");

      clear(container);

      state.ideas.forEach(
        (idea, index) => {
          const card =
            createElement(
              "article",
              "idea-card"
            );

          card.appendChild(
            createElement(
              "h3",
              "",
              `${index + 1}. ${idea.name}`
            )
          );

          [
            [
              "한 줄 설명",
              idea.summary
            ],

            [
              "목표 고객",
              idea.customer
            ],

            [
              "해결 문제",
              idea.problem
            ],

            [
              "수익 모델",
              idea.revenue
            ],

            [
              "추천 이유",
              idea.reason
            ]
          ].forEach(
            ([label, value]) => {
              const paragraph =
                createElement("p");

              paragraph.appendChild(
                createElement(
                  "strong",
                  "",
                  `${label}\n`
                )
              );

              paragraph.appendChild(
                document.createTextNode(
                  value
                )
              );

              card.appendChild(
                paragraph
              );
            }
          );

          const list =
            createElement(
              "ul",
              "reason-list"
            );

          idea.reasons.forEach(
            (reason) => {
              list.appendChild(
                createElement(
                  "li",
                  "",
                  reason
                )
              );
            }
          );

          card.appendChild(list);

          const tags =
            createElement(
              "div",
              "tag-row"
            );

          [
            `추천 적합도: ${idea.fitScore}점`,
            `난이도: ${idea.difficulty}`,
            `초기 비용: ${idea.cost}`
          ].forEach(
            (text) => {
              tags.appendChild(
                createElement(
                  "span",
                  "tag",
                  text
                )
              );
            }
          );

          card.appendChild(tags);

          const button =
            createElement(
              "button",
              "primary-btn",
              "이 아이템 분석하기"
            );

          button.type =
            "button";

          button.addEventListener(
            "click",
            () => {
              analyzeIdea(index);
            }
          );

          card.appendChild(button);

          container.appendChild(card);
        }
      );
    }



    /* =====================================================
       16. Recommendation
    ===================================================== */

    async function recommend() {
      const profile =
        getProfile();

      if (
        !validateProfile(
          profile
        )
      ) {
        return;
      }

      state.profile =
        profile;

      state.ideas =
        [];

      state.selectedIdea =
        null;

      state.analysis =
        null;

      state.forecast =
        null;

      state.planGenerated =
        false;

      state.currentProjectId =
        null;

      state.savedAnalysisSignature =
        null;

      state.savedForecastSignature =
        null;

      get("workspaceSection").classList.add(
        "hidden"
      );

      showStatus(
        "recommendStatusCard",
        "recommendStatusText",
        "입력 조건을 바탕으로 창업 아이템을 생성하는 중입니다..."
      );

      get("recommendBtn").disabled =
        true;

      try {
        const result =
          await callApi(
            "/api/recommend",
            {
              profile
            }
          );

        state.ideas =
          normalizeIdeas(
            result.ideas
          );

        if (
          state.ideas.length === 0
        ) {
          throw new Error(
            "추천 아이템을 받지 못했습니다."
          );
        }

        renderIdeas();

        get("recommendationSection").classList.remove(
          "hidden"
        );

        get("saveProjectBtn").classList.remove(
          "hidden"
        );

        get("saveProjectBtn").disabled =
          false;

        get("saveProjectBtn").textContent =
          "프로젝트로 저장하기";

        showStatus(
          "recommendStatusCard",
          "recommendStatusText",
          "추천 아이템 생성 완료!",
          true
        );
      } catch (error) {
        hideStatus(
          "recommendStatusCard"
        );

        alert(
          `추천 생성에 실패했습니다: ${error.message}`
        );
      } finally {
        get("recommendBtn").disabled =
          false;
      }
    }
