/* KU STARTUP PLANNER - refactored front-end */



    /* =====================================================
       3. 상태
    ===================================================== */

    const state = {
      profile:
        null,

      ideas:
        [],

      selectedIdea:
        null,

      analysis:
        null,

      forecast:
        null,

      validationChecklist:
        null,

      validationNotes:
        null,

      projectMemo:
        "",

      validationHistory:
        [],

      validationLogs:
        [],

      planGenerated:
        false,

      currentProjectId:
        null,

      savedAnalysisSignature:
        null,

      savedForecastSignature:
        null,

      savedValidationSignature:
        null
    };
