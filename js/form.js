/* KU STARTUP PLANNER - refactored front-end */



    /* =====================================================
       7. Input UI
    ===================================================== */

    function appendOption(
      select,
      value,
      label
    ) {
      const option =
        document.createElement("option");

      option.value =
        value;

      option.textContent =
        label;

      select.appendChild(option);
    }

    function renderCollegeOptions() {
      const primary =
        get("primaryCollege");

      const secondary =
        get("secondaryCollege");

      clear(primary);
      clear(secondary);

      appendOption(
        primary,
        "",
        "단과대학을 선택하세요"
      );

      appendOption(
        secondary,
        "해당 없음",
        "해당 없음"
      );

      Object.keys(majorDatabase).forEach(
        (college) => {
          appendOption(
            primary,
            college,
            college
          );

          appendOption(
            secondary,
            college,
            college
          );
        }
      );
    }

    function renderMajorOptions(
      collegeId,
      majorId,
      allowNone
    ) {
      const college =
        get(collegeId).value;

      const major =
        get(majorId);

      clear(major);

      if (
        !college ||
        college === "해당 없음"
      ) {
        appendOption(
          major,
          allowNone
            ? "해당 없음"
            : "",
          allowNone
            ? "해당 없음"
            : "먼저 단과대학을 선택하세요"
        );

        major.disabled =
          !allowNone;

        return;
      }

      appendOption(
        major,
        "",
        "학과·학부를 선택하세요"
      );

      majorDatabase[college].forEach(
        (name) => {
          appendOption(
            major,
            name,
            name
          );
        }
      );

      major.disabled =
        false;
    }

    function renderCertificates() {
      const container =
        get("certificateChecklist");

      clear(container);

      certificates.forEach(
        (certificate, index) => {
          const label =
            createElement(
              "label",
              "check-item"
            );

          const checkbox =
            document.createElement("input");

          checkbox.type =
            "checkbox";

          checkbox.name =
            "certificates";

          checkbox.value =
            certificate;

          if (
            index ===
            certificates.length - 1
          ) {
            checkbox.dataset.none =
              "true";
          }

          label.appendChild(checkbox);

          label.appendChild(
            document.createTextNode(
              certificate
            )
          );

          container.appendChild(label);
        }
      );
    }

    function handleCertificateChange(event) {
      const checkboxes =
        Array.from(
          document.querySelectorAll(
            "input[name='certificates']"
          )
        );

      const none =
        checkboxes.find(
          (checkbox) =>
            checkbox.dataset.none === "true"
        );

      if (
        event.target === none &&
        none.checked
      ) {
        checkboxes.forEach(
          (checkbox) => {
            if (
              checkbox !== none
            ) {
              checkbox.checked =
                false;
            }
          }
        );
      }

      if (
        event.target !== none &&
        event.target.checked
      ) {
        none.checked =
          false;
      }
    }

    function selectedCertificates() {
      return Array.from(
        document.querySelectorAll(
          "input[name='certificates']:checked"
        )
      ).map(
        (checkbox) =>
          checkbox.value
      );
    }

    function getProfile() {
      const primaryCollege =
        get("primaryCollege").value;

      const primaryMajor =
        get("primaryMajor").value;

      const secondaryCollege =
        get("secondaryCollege").value;

      const secondaryMajor =
        get("secondaryMajor").value;

      const budget =
        get("budget").value.trim();

      const time =
        get("time").value.trim();

      return {
        primaryMajor: {
          college:
            primaryCollege,

          major:
            primaryMajor
        },

        secondaryMajor: {
          college:
            secondaryCollege === "해당 없음"
              ? ""
              : secondaryCollege,

          major:
            secondaryMajor || "해당 없음"
        },

        primaryMajorText:
          `${primaryCollege} ${primaryMajor}`.trim(),

        secondaryMajorText:
          secondaryCollege === "해당 없음"
            ? "해당 없음"
            : `${secondaryCollege} ${secondaryMajor}`.trim(),

        certificates:
          selectedCertificates(),

        interests:
          get("interests").value.trim(),

        goal:
          get("goal").value,

        budget,

        time,

        budgetText:
          `${Number(budget || 0).toLocaleString()}만원`,

        budgetWonText:
          `${(
            Number(budget || 0) *
            10000
          ).toLocaleString()}원`,

        timeText:
          `주 ${time || 0}시간`,

        businessType:
          get("businessType").value,

        target:
          get("target").value.trim(),

        avoid:
          get("avoid").value.trim()
      };
    }

    function validateProfile(profile) {
      if (
        !profile.primaryMajor.major ||
        profile.certificates.length === 0 ||
        !profile.interests ||
        !profile.budget ||
        !profile.time ||
        !profile.target
      ) {
        alert(
          "제1전공, 자격증, 관심 분야, 초기 자본, 투입 시간, 관심 고객층을 입력해주세요."
        );

        return false;
      }

      return true;
    }

    function fillSample() {
      get("primaryCollege").value =
        "문과대학";

      renderMajorOptions(
        "primaryCollege",
        "primaryMajor",
        false
      );

      get("primaryMajor").value =
        "영어영문학과";

      get("secondaryCollege").value =
        "해당 없음";

      renderMajorOptions(
        "secondaryCollege",
        "secondaryMajor",
        true
      );

      document
        .querySelectorAll(
          "input[name='certificates']"
        )
        .forEach(
          (checkbox) => {
            checkbox.checked =
              [
                "컴퓨터활용능력",
                "TOEIC/TOEFL/OPIc 등 어학 자격"
              ].includes(
                checkbox.value
              );
          }
        );

      get("interests").value =
        "AI, 교육, 콘텐츠";

      get("goal").value =
        "포트폴리오 제작";

      get("budget").value =
        "10";

      get("time").value =
        "5";

      get("businessType").value =
        "온라인 서비스";

      get("target").value =
        "대학생";

      get("avoid").value =
        "재고 관리와 오프라인 매장 운영은 피하고 싶음";
    }
