/* KU STARTUP PLANNER - refactored front-end */



    /* =====================================================
       4. DOM Helper
    ===================================================== */

    const get =
      (id) =>
        document.getElementById(id);

    function createElement(
      tag,
      className = "",
      text = ""
    ) {
      const element =
        document.createElement(tag);

      if (className) {
        element.className =
          className;
      }

      if (
        typeof text ===
        "string"
      ) {
        element.textContent =
          text;
      }

      return element;
    }

    function clear(element) {
      element.replaceChildren();
    }



    /* =====================================================
       5. Status Helper
    ===================================================== */

    function showStatus(
      cardId,
      textId,
      message,
      complete = false
    ) {
      const card =
        get(cardId);

      get(textId).textContent =
        message;

      card.classList.remove("hidden");
      card.classList.toggle("complete", complete);
    }

    function hideStatus(cardId) {
      const card =
        get(cardId);

      card.classList.add("hidden");
      card.classList.remove("complete");
    }



    /* =====================================================
       8. API
    ===================================================== */

    async function callApi(
      endpoint,
      payload
    ) {
      const response =
        await fetch(
          endpoint,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(payload)
          }
        );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        throw new Error(
          data.error ||
          "백엔드 요청에 실패했습니다."
        );
      }

      return data;
    }

    function clampScore(value) {
      const score =
        Number(value);

      return Number.isFinite(score)
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(score)
            )
          )
        : 75;
    }

    function normalizeIdeas(rawIdeas) {
      if (
        !Array.isArray(rawIdeas)
      ) {
        return [];
      }

      return rawIdeas.slice(0, 5).map(
        (idea, index) => ({
          name:
            idea.name ||
            `창업 아이템 ${index + 1}`,

          summary:
            idea.summary ||
            "설명 없음",

          customer:
            idea.customer ||
            "목표 고객 미정",

          problem:
            idea.problem ||
            "해결 문제 미정",

          revenue:
            idea.revenue ||
            "수익 모델 미정",

          reason:
            idea.reason ||
            "추천 이유 미정",

          reasons:
            Array.isArray(
              idea.reasons
            )
              ? idea.reasons
              : [
                  idea.reason ||
                  "추천 이유 미정"
                ],

          fitScore:
            clampScore(
              idea.fitScore
            ),

          difficulty:
            idea.difficulty ||
            "보통",

          cost:
            idea.cost ||
            "미정"
        })
      );
    }

    function normalizeAnalysis(raw) {
      const scores = {
        "사용자 적합성":
          75,

        "실행 가능성":
          75,

        "시장성":
          75,

        "수익성":
          75,

        "차별성":
          75,

        "확장성":
          75,

        "리스크 안정성":
          75,

        ...(raw?.scores || {})
      };

      Object.keys(scores).forEach(
        (key) => {
          scores[key] =
            clampScore(
              scores[key]
            );
        }
      );

      return {
        scores,

        sections: {
          market:
            "시장 전망이 제공되지 않았습니다.",

          customer:
            "고객 분석이 제공되지 않았습니다.",

          competition:
            "경쟁 분석이 제공되지 않았습니다.",

          revenue:
            "수익 모델 분석이 제공되지 않았습니다.",

          mvp:
            "초기 실행 계획이 제공되지 않았습니다.",

          risk:
            "리스크 분석이 제공되지 않았습니다.",

          growth:
            "발전 가능성이 제공되지 않았습니다.",

          ...(raw?.sections || {})
        },

        summary:
          raw?.summary ||
          "종합 평가가 제공되지 않았습니다."
      };
    }

    function normalizeForecast(raw) {
      return {
        trendSummary:
          raw?.trendSummary ??
          raw?.trend_summary ??
          "최근 동향 요약이 제공되지 않았습니다.",

        economicFactors:
          raw?.economicFactors ??
          raw?.economic_factors ??
          [],

        outlook:
          raw?.outlook || {},

        scenarios:
          raw?.scenarios || {},

        actions:
          raw?.actions || [],

        sources:
          raw?.sources || [],

        dataSnapshot:
          raw?.dataSnapshot ??
          raw?.data_snapshot ??
          {},

        fetchedAt:
          raw?.fetchedAt ??
          raw?.fetched_at ??
          raw?.created_at ??
          new Date().toISOString(),

        modelUsed:
          raw?.modelUsed ??
          raw?.model_used ??
          ""
      };
    }



    /* =====================================================
       9. Tabs
    ===================================================== */

    function showTab(tab) {
      const analysisSelected =
        tab === "analysis";

      get("analysisTabPanel").classList.toggle(
        "hidden",
        !analysisSelected
      );

      get("forecastTabPanel").classList.toggle(
        "hidden",
        analysisSelected
      );

      get("analysisTabBtn").classList.toggle(
        "active",
        analysisSelected
      );

      get("forecastTabBtn").classList.toggle(
        "active",
        !analysisSelected
      );
    }
