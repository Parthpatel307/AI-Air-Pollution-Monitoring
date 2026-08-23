import { apiRequest } from "./api";

export function analyzeAI({ zoneId, question }) {
  return apiRequest("/ai/analyze", {
    method: "POST",
    body: JSON.stringify({
      zone_id: zoneId,
      question,
    }),
  });
}

export function sendAIChat({ message, zoneId }) {
  return apiRequest("/ai/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      zone_id: zoneId,
    }),
  });
}

export function explainForecast({ zoneId, forecast }) {
  return apiRequest("/ai/forecast/explain", {
    method: "POST",
    body: JSON.stringify({
      zone_id: zoneId,
      forecast,
    }),
  });
}

export function detectPollutionSource({
  zoneId,
  pollutants,
  weather,
}) {
  return apiRequest("/ai/source-detection", {
    method: "POST",
    body: JSON.stringify({
      zone_id: zoneId,
      pollutants,
      weather,
    }),
  });
}

export function analyzeEvidence(evidenceId) {
  return apiRequest("/ai/evidence/analyze", {
    method: "POST",
    body: JSON.stringify({
      evidence_id: evidenceId,
    }),
  });
}