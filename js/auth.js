/* KU STARTUP PLANNER - refactored front-end */



    /* =====================================================
       6. Auth
    ===================================================== */

    function updateAuthUI(session) {
      const user =
        session?.user || null;

      const loggedIn =
        Boolean(user);

      get("loginBtn").classList.toggle(
        "hidden",
        loggedIn
      );

      get("logoutBtn").classList.toggle(
        "hidden",
        !loggedIn
      );

      get("myProjectsBtn").classList.toggle(
        "hidden",
        !loggedIn
      );

      get("userChip").classList.toggle(
        "hidden",
        !loggedIn
      );

      get("userChip").textContent =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        user?.email ||
        "";
    }

    async function initializeAuth() {
      const {
        data: {
          session
        }
      } =
        await supabaseClient.auth.getSession();

      updateAuthUI(session);

      supabaseClient.auth.onAuthStateChange(
        (_event, nextSession) => {
          updateAuthUI(nextSession);
        }
      );
    }

    async function loginWithGoogle() {
      const {
        error
      } =
        await supabaseClient.auth.signInWithOAuth({
          provider:
            "google",

          options: {
            redirectTo:
              window.location.origin
          }
        });

      if (error) {
        alert(
          `Google 로그인에 실패했습니다: ${error.message}`
        );
      }
    }

    async function logout() {
      const {
        error
      } =
        await supabaseClient.auth.signOut();

      if (error) {
        alert(
          `로그아웃에 실패했습니다: ${error.message}`
        );
      }
    }

    async function getUser() {
      const {
        data: {
          user
        }
      } =
        await supabaseClient.auth.getUser();

      return user || null;
    }
