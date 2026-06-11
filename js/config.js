/* KU STARTUP PLANNER - refactored front-end */

    /* =====================================================
       1. Supabase 설정
       기존의 실제 값을 다시 넣으세요.
    ===================================================== */

    const SUPABASE_URL =
      "https://nsbjwvptegtbrqrczgwh.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
      "sb_publishable_tlBEKCUQojxeQiQUCohewg_Z4BMnAKJ";

    const supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );
