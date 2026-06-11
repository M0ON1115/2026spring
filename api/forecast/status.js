import {
  retrieveBackgroundResearch,
  finalizeForecast
} from "../../lib/forecast-background.js";

/* =========================================================
   KU STARTUP PLANNER
   Poll Background Forecast Research
========================================================= */

function parseRequestBody(
  req
) {
  if (
    req.body &&
    typeof req.body ===
      "object"
  ) {
    return req.body;
  }

  if (
    typeof req.body ===
      "string"
  ) {
    try {
      return JSON
        .parse(
          req.body
        );
    } catch {
      return {};
    }
  }

  return {};
}

export default async function handler(
  req,
  res
) {
  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  if (
    req.method !==
    "POST"
  ) {
    return res
      .status(
        405
      )
      .json({
        error:
          "POST 요청만 허용됩니다."
      });
  }

  try {
    const {
      responseId
    } =
      parseRequestBody(
        req
      );

    if (
      !responseId ||
      typeof responseId !==
        "string"
    ) {
      return res
        .status(
          400
        )
        .json({
          error:
            "responseId가 필요합니다."
        });
    }

    const researchResponse =
      await retrieveBackgroundResearch(
        responseId
      );

    if (
      researchResponse.status ===
        "queued" ||
      researchResponse.status ===
        "in_progress"
    ) {
      return res
        .status(
          200
        )
        .json({
          status:
            researchResponse.status
        });
    }

    if (
      researchResponse.status ===
        "incomplete"
    ) {
      return res
        .status(
          500
        )
        .json({
          status:
            researchResponse.status,

          error:
            `웹 리서치 응답이 중간에 종료되었습니다. 사유: ${
              researchResponse
                ?.incomplete_details
                ?.reason ||
              "알 수 없음"
            }`
        });
    }

    if (
      researchResponse.status !==
      "completed"
    ) {
      return res
        .status(
          500
        )
        .json({
          status:
            researchResponse.status,

          error:
            `웹 리서치 작업이 정상 완료되지 않았습니다. 현재 상태: ${
              researchResponse.status
            }`
        });
    }

    const forecast =
      await finalizeForecast(
        researchResponse
      );

    return res
      .status(
        200
      )
      .json({
        status:
          "completed",

        forecast
      });
  } catch (
    error
  ) {
    console.error(
      "forecast status error:",
      error
    );

    return res
      .status(
        500
      )
      .json({
        error:
          error
            ?.message ||
          "경제 전망 분석 상태를 확인하지 못했습니다."
      });
  }
}