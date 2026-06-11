import {
  startBackgroundResearch
} from "../../lib/forecast-background.js";

/* =========================================================
   KU STARTUP PLANNER
   Start Background Forecast Research
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
      profile,
      idea,
      analysis
    } =
      parseRequestBody(
        req
      );

    if (
      !profile ||
      !idea ||
      !analysis
    ) {
      return res
        .status(
          400
        )
        .json({
          error:
            "profile, idea, analysis 데이터가 모두 필요합니다."
        });
    }

    const response =
      await startBackgroundResearch(
        profile,
        idea,
        analysis
      );

    return res
      .status(
        202
      )
      .json({
        responseId:
          response.id,

        status:
          response.status,

        startedAt:
          new Date()
            .toISOString()
      });
  } catch (
    error
  ) {
    console.error(
      "forecast start error:",
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
          "경제 전망 분석 작업을 시작하지 못했습니다."
      });
  }
}