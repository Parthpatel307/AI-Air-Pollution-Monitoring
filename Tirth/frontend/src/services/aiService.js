import { apiRequest } from "./api";


function cleanAIText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .replace(/\bzone_\d+\b/gi, "the selected zone")
    .replace(/^[\s,:;.\-)\]]+/, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}


function isUsefulAIText(value) {
  const text = cleanAIText(value);

  if (text.length < 45) {
    return false;
  }

  const lower = text.toLowerCase();

  const badFragments = [
    "structure required",
    "required structure",
    "output structure",
    "response structure",
    "no ).",
    "locations, forecasts, or",
  ];

  if (
    badFragments.some(
      (fragment) =>
        lower.includes(fragment)
    )
  ) {
    return false;
  }

  const words =
    text.match(/[a-zA-Z]{2,}/g) || [];

  return words.length >= 8;
}


function setTextFields(
  response,
  fields,
  fallback
) {
  if (
    !response ||
    typeof response !== "object"
  ) {
    return response;
  }

  const target =
    response?.data &&
    typeof response.data === "object"
      ? response.data
      : response;

  let validText = "";

  for (const field of fields) {
    if (
      isUsefulAIText(
        target[field]
      )
    ) {
      validText =
        cleanAIText(
          target[field]
        );

      break;
    }
  }

  const finalText =
    validText || fallback;

  for (const field of fields) {
    target[field] = finalText;
  }

  return response;
}


function getForecastFallback(
  forecast = []
) {
  const values =
    Array.isArray(forecast)
      ? forecast
          .map(
            (item) =>
              Number(
                item?.predicted_aqi
              )
          )
          .filter(
            Number.isFinite
          )
      : [];

  if (values.length === 0) {
    return (
      "Live forecast data is available for the selected zone. " +
      "Review the upcoming AQI trend together with current pollutant " +
      "and weather readings for environmental risk assessment."
    );
  }

  const first =
    values[0];

  const last =
    values[
      values.length - 1
    ];

  const low =
    Math.min(...values);

  const high =
    Math.max(...values);

  const difference =
    last - first;

  let trend =
    "remain relatively stable";

  if (difference >= 10) {
    trend =
      "increase during the forecast period";
  } else if (
    difference <= -10
  ) {
    trend =
      "decrease during the forecast period";
  }

  return (
    `The live AQI forecast is expected to ${trend}. ` +
    `The forecast starts near ${Math.round(first)} and ` +
    `ranges from approximately ${Math.round(low)} to ` +
    `${Math.round(high)} over the next 24 hours.`
  );
}


export async function analyzeAI({
  zoneId,
  question,
}) {
  const response =
    await apiRequest(
      "/ai/analyze",
      {
        method: "POST",

        body: JSON.stringify({
          zone_id: zoneId,
          question,
        }),
      }
    );

  return setTextFields(
    response,

    [
      "analysis",
      "explanation",
      "summary",
      "answer",
      "response",
      "text",
    ],

    (
      "Current environmental conditions should be assessed using the " +
      "live AQI, particulate matter, weather and forecast readings shown " +
      "for the selected zone. Higher pollutant concentrations and weaker " +
      "atmospheric dispersion can increase air-quality risk."
    )
  );
}


export async function sendAIChat({
  message,
  zoneId,
}) {
  const response =
    await apiRequest(
      "/ai/chat",
      {
        method: "POST",

        body: JSON.stringify({
          message,
          zone_id: zoneId,
        }),
      }
    );

  return setTextFields(
    response,

    [
      "reply",
      "response",
      "answer",
      "message",
      "analysis",
      "text",
    ],

    (
      "AQI can increase when pollutant concentrations rise or weather " +
      "conditions reduce atmospheric dispersion. Check the live PM2.5, " +
      "PM10, wind and forecast readings for the selected zone to identify " +
      "the strongest current factor."
    )
  );
}


export async function explainForecast({
  zoneId,
  forecast,
}) {
  const response =
    await apiRequest(
      "/ai/forecast/explain",
      {
        method: "POST",

        body: JSON.stringify({
          zone_id: zoneId,
          forecast,
        }),
      }
    );

  return setTextFields(
    response,

    [
      "explanation",
      "summary",
      "analysis",
      "answer",
      "text",
    ],

    getForecastFallback(
      forecast
    )
  );
}


export function detectPollutionSource({
  zoneId,
  pollutants,
  weather,
}) {
  return apiRequest(
    "/ai/source-detection",
    {
      method: "POST",

      body: JSON.stringify({
        zone_id: zoneId,
        pollutants,
        weather,
      }),
    }
  );
}


export function analyzeEvidence(
  evidenceId
) {
  return apiRequest(
    "/ai/evidence/analyze",
    {
      method: "POST",

      body: JSON.stringify({
        evidence_id:
          evidenceId,
      }),
    }
  );
}
