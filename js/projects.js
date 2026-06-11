/* KU STARTUP PLANNER - refactored front-end */



    /* =====================================================
       14. Database Save
    ===================================================== */

    function signature(value) {
      return JSON.stringify(value);
    }

    function deriveStatus() {
      if (
        state.forecast
      ) {
        return "forecasted";
      }

      if (
        state.analysis
      ) {
        return "analyzed";
      }

      if (
        state.selectedIdea
      ) {
        return "selected";
      }

      return "recommended";
    }

    async function syncProjectMetadata() {
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
              state.selectedIdea ||
              null
          })
          .eq(
            "id",
            state.currentProjectId
          );

      if (error) {
        throw error;
      }
    }

    async function saveAnalysisIfNeeded() {
      if (
        !state.currentProjectId ||
        !state.analysis
      ) {
        return;
      }

      const currentSignature =
        signature(
          state.analysis
        );

      if (
        state.savedAnalysisSignature ===
        currentSignature
      ) {
        return;
      }

      const {
        error
      } =
        await supabaseClient
          .from("analyses")
          .insert({
            project_id:
              state.currentProjectId,

            scores:
              state.analysis.scores,

            sections:
              state.analysis.sections,

            summary:
              state.analysis.summary
          });

      if (error) {
        throw error;
      }

      state.savedAnalysisSignature =
        currentSignature;

      await syncProjectMetadata();
    }

    async function saveForecastIfNeeded() {
      if (
        !state.currentProjectId ||
        !state.forecast
      ) {
        return;
      }

      const currentSignature =
        signature(
          state.forecast
        );

      if (
        state.savedForecastSignature ===
        currentSignature
      ) {
        return;
      }

      const {
        error
      } =
        await supabaseClient
          .from("forecasts")
          .insert({
            project_id:
              state.currentProjectId,

            economic_factors:
              state.forecast.economicFactors,

            outlook:
              state.forecast.outlook,

            scenarios:
              state.forecast.scenarios,

            actions:
              state.forecast.actions,

            trend_summary:
              state.forecast.trendSummary,

            sources:
              state.forecast.sources,

            data_snapshot:
              state.forecast.dataSnapshot,

            fetched_at:
              state.forecast.fetchedAt,

            model_used:
              typeof state.forecast.modelUsed === "string"
                ? state.forecast.modelUsed
                : JSON.stringify(
                    state.forecast.modelUsed
                  )
          });

      if (error) {
        throw error;
      }

      state.savedForecastSignature =
        currentSignature;

      await syncProjectMetadata();
    }

    async function saveProject() {
      const user =
        await getUser();

      if (
        !user
      ) {
        get("authModal").classList.remove(
          "hidden"
        );

        alert(
          "프로젝트를 저장하려면 로그인해야 합니다."
        );

        return;
      }

      if (
        !state.profile ||
        state.ideas.length === 0
      ) {
        alert(
          "먼저 창업 아이템 추천을 받아주세요."
        );

        return;
      }

      get("saveProjectBtn").disabled =
        true;

      get("saveProjectBtn").textContent =
        "프로젝트를 저장하는 중입니다...";

      try {
        if (
          !state.currentProjectId
        ) {
          const {
            data:
              project,

            error:
              projectError
          } =
            await supabaseClient
              .from("projects")
              .insert({
                user_id:
                  user.id,

                title:
                  state.selectedIdea?.name ||
                  `${state.profile.interests.split(",")[0]} 창업 프로젝트`,

                status:
                  deriveStatus(),

                profile:
                  state.profile,

                selected_idea:
                  state.selectedIdea ||
                  null
              })
              .select()
              .single();

          if (projectError) {
            throw projectError;
          }

          state.currentProjectId =
            project.id;

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
                  state.ideas
              });

          if (
            recommendationError
          ) {
            throw recommendationError;
          }
        }

        await saveAnalysisIfNeeded();
        await saveForecastIfNeeded();
        await syncProjectMetadata();

        get("saveProjectBtn").textContent =
          "프로젝트 저장 완료 ✓";

        alert(
          "프로젝트를 저장했습니다."
        );
      } catch (error) {
        get("saveProjectBtn").disabled =
          false;

        get("saveProjectBtn").textContent =
          "프로젝트로 저장하기";

        alert(
          `프로젝트 저장에 실패했습니다: ${error.message}`
        );
      }
    }



    /* =====================================================
       15. Project Dashboard
    ===================================================== */

    function statusLabel(status) {
      const labels = {
        recommended:
          "추천 검토 중",

        selected:
          "아이템 선택 완료",

        analyzed:
          "기본 분석 완료",

        forecasted:
          "경제 전망 완료"
      };

      return (
        labels[status] ||
        "진행 중"
      );
    }

    function progress(status) {
      const values = {
        recommended:
          25,

        selected:
          40,

        analyzed:
          60,

        forecasted:
          75
      };

      return (
        values[status] ||
        10
      );
    }

    function nextAction(status) {
      const actions = {
        recommended:
          "추천 아이템 중 하나를 선택해 기본 분석을 진행하세요.",

        selected:
          "선택한 아이템의 기본 분석을 완료하세요.",

        analyzed:
          "최신 경제 동향 탭에서 외부 환경을 분석하세요.",

        forecasted:
          "시장 검증 체크리스트를 작성하세요."
      };

      return (
        actions[status] ||
        "다음 단계를 확인하세요."
      );
    }

    function formatDate(value) {
      if (
        !value
      ) {
        return "기록 없음";
      }

      return new Intl.DateTimeFormat(
        "ko-KR",
        {
          year:
            "numeric",

          month:
            "2-digit",

          day:
            "2-digit"
        }
      ).format(
        new Date(value)
      );
    }

    function averageScore(scores) {
      const values =
        Object.values(
          scores || {}
        );

      if (
        values.length === 0
      ) {
        return null;
      }

      return Math.round(
        values.reduce(
          (sum, value) =>
            sum + Number(value),
          0
        ) /
        values.length
      );
    }

    async function latestRows(
      table,
      projectIds
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
          .select("*")
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

      data.forEach(
        (row) => {
          if (
            !map[row.project_id]
          ) {
            map[row.project_id] =
              row;
          }
        }
      );

      return map;
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
              ascending:
                false
            }
          );

      if (error) {
        throw error;
      }

      const ids =
        projects.map(
          (project) =>
            project.id
        );

      const [
        analyses,
        forecasts
      ] =
        await Promise.all([
          latestRows(
            "analyses",
            ids
          ),

          latestRows(
            "forecasts",
            ids
          )
        ]);

      return projects.map(
        (project) => {
          const repairedStatus =
            forecasts[project.id]
              ? "forecasted"
              : analyses[project.id]
                ? "analyzed"
                : project.selected_idea
                  ? "selected"
                  : "recommended";

          return {
            ...project,

            status:
              repairedStatus,

            latestAnalysis:
              analyses[project.id] ||
              null,

            latestForecast:
              forecasts[project.id] ||
              null
          };
        }
      );
    }

    function renderProjectList(projects) {
      const list =
        get("projectList");

      clear(list);

      if (
        projects.length === 0
      ) {
        list.appendChild(
          createElement(
            "div",
            "project-empty",
            "아직 저장한 프로젝트가 없습니다."
          )
        );

        return;
      }

      projects.forEach(
        (project) => {
          const card =
            createElement(
              "article",
              "project-card"
            );

          const top =
            createElement(
              "div",
              "project-card-top"
            );

          const main =
            createElement("div");

          main.appendChild(
            createElement(
              "h3",
              "",
              project.title
            )
          );

          main.appendChild(
            createElement(
              "p",
              "project-selected",
              `선택 아이템: ${
                project.selected_idea?.name ||
                "아직 선택하지 않음"
              }`
            )
          );

          const meta =
            createElement(
              "div",
              "project-meta"
            );

          meta.appendChild(
            createElement(
              "span",
              "project-status",
              statusLabel(
                project.status
              )
            )
          );

          const score =
            averageScore(
              project.latestAnalysis?.scores
            );

          meta.appendChild(
            createElement(
              "span",
              "project-score",
              score === null
                ? "종합 점수: 분석 전"
                : `종합 점수: ${score}점`
            )
          );

          main.appendChild(meta);

          const buttons =
            createElement(
              "div",
              "project-meta"
            );

          const openButton =
            createElement(
              "button",
              "project-small-btn",
              "이어하기"
            );

          openButton.addEventListener(
            "click",
            () => {
              loadProject(
                project.id
              );
            }
          );

          const deleteButton =
            createElement(
              "button",
              "project-small-btn project-delete-btn",
              "삭제"
            );

          deleteButton.addEventListener(
            "click",
            () => {
              deleteProject(
                project.id
              );
            }
          );

          buttons.appendChild(
            openButton
          );

          buttons.appendChild(
            deleteButton
          );

          top.appendChild(main);
          top.appendChild(buttons);

          card.appendChild(top);

          const progressWrap =
            createElement(
              "div",
              "project-progress-wrap"
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

          progressHead.appendChild(
            createElement(
              "span",
              "",
              `${progress(
                project.status
              )}%`
            )
          );

          const track =
            createElement(
              "div",
              "project-progress-track"
            );

          const fill =
            createElement(
              "div",
              "project-progress-fill"
            );

          fill.style.width =
            `${progress(
              project.status
            )}%`;

          track.appendChild(fill);
          progressWrap.appendChild(
            progressHead
          );
          progressWrap.appendChild(track);

          card.appendChild(
            progressWrap
          );

          card.appendChild(
            createElement(
              "div",
              "project-next-action",
              `다음 추천 행동: ${nextAction(
                project.status
              )}`
            )
          );

          const dates =
            createElement(
              "div",
              "project-dates"
            );

          dates.appendChild(
            createElement(
              "span",
              "",
              `최근 수정: ${formatDate(
                project.updated_at
              )}`
            )
          );

          dates.appendChild(
            createElement(
              "span",
              "",
              `마지막 분석: ${formatDate(
                project.latestAnalysis?.created_at
              )}`
            )
          );

          dates.appendChild(
            createElement(
              "span",
              "",
              `마지막 경제 전망: ${formatDate(
                project.latestForecast?.fetched_at
              )}`
            )
          );

          card.appendChild(dates);

          list.appendChild(card);
        }
      );
    }

    async function showProjects() {
      const user =
        await getUser();

      if (
        !user
      ) {
        get("authModal").classList.remove(
          "hidden"
        );

        return;
      }

      get("projectsModal").classList.remove(
        "hidden"
      );

      clear(
        get("projectList")
      );

      get("projectList").appendChild(
        createElement(
          "div",
          "project-empty",
          "프로젝트 목록을 불러오는 중입니다..."
        )
      );

      try {
        renderProjectList(
          await fetchProjects()
        );
      } catch (error) {
        clear(
          get("projectList")
        );

        get("projectList").appendChild(
          createElement(
            "div",
            "project-empty",
            `프로젝트 조회 실패: ${error.message}`
          )
        );
      }
    }

    async function loadProject(projectId) {
      try {
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
                  ascending:
                    false
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
                  ascending:
                    false
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

        const recommendations =
          recommendationResponse.data?.[0];

        const analysis =
          analysisResponse.data?.[0];

        const forecast =
          forecastResponse.data?.[0];

        state.currentProjectId =
          project.id;

        state.profile =
          project.profile;

        state.ideas =
          normalizeIdeas(
            recommendations?.ideas ||
            []
          );

        state.selectedIdea =
          project.selected_idea ||
          null;

        state.analysis =
          analysis
            ? normalizeAnalysis(
                analysis
              )
            : null;

        state.forecast =
          forecast
            ? normalizeForecast(
                forecast
              )
            : null;

        state.savedAnalysisSignature =
          state.analysis
            ? signature(
                state.analysis
              )
            : null;

        state.savedForecastSignature =
          state.forecast
            ? signature(
                state.forecast
              )
            : null;

        applyProfileToForm(
          state.profile
        );

        renderIdeas();

        get("recommendationSection").classList.remove(
          "hidden"
        );

        get("saveProjectBtn").classList.remove(
          "hidden"
        );

        get("saveProjectBtn").textContent =
          "프로젝트 저장 완료 ✓";

        get("saveProjectBtn").disabled =
          true;

        if (
          state.selectedIdea &&
          state.analysis
        ) {
          get("selectedIdeaText").textContent =
            `선택한 아이템: ${state.selectedIdea.name}`;

          get("workspaceSection").classList.remove(
            "hidden"
          );

          renderAnalysis();
          generatePlan();

          if (
            state.forecast
          ) {
            renderForecast();
          } else {
            clearForecastUI();
          }

          showTab("analysis");
        }

        get("projectsModal").classList.add(
          "hidden"
        );
      } catch (error) {
        alert(
          `프로젝트 불러오기에 실패했습니다: ${error.message}`
        );
      }
    }

    function applyProfileToForm(profile) {
      get("primaryCollege").value =
        profile.primaryMajor?.college ||
        "";

      renderMajorOptions(
        "primaryCollege",
        "primaryMajor",
        false
      );

      get("primaryMajor").value =
        profile.primaryMajor?.major ||
        "";

      get("secondaryCollege").value =
        profile.secondaryMajor?.college ||
        "해당 없음";

      renderMajorOptions(
        "secondaryCollege",
        "secondaryMajor",
        true
      );

      get("secondaryMajor").value =
        profile.secondaryMajor?.major ||
        "해당 없음";

      document
        .querySelectorAll(
          "input[name='certificates']"
        )
        .forEach(
          (checkbox) => {
            checkbox.checked =
              profile.certificates?.includes(
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
          get(id).value =
            profile[id] ||
            "";
        }
      );
    }

    async function deleteProject(projectId) {
      if (
        !window.confirm(
          "프로젝트를 삭제하시겠습니까?"
        )
      ) {
        return;
      }

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
        alert(
          `프로젝트 삭제에 실패했습니다: ${error.message}`
        );

        return;
      }

      await showProjects();
    }
