import { apiRequest } from "./api";

export function createPollutionReport({
  latitude,
  longitude,
  description,
  pollutionType,
}) {
  return apiRequest("/reports", {
    method: "POST",
    body: JSON.stringify({
      latitude,
      longitude,
      description,
      pollution_type: pollutionType,
    }),
  });
}

export function getReports() {
  return apiRequest("/reports");
}

export function getReportById(reportId) {
  return apiRequest(`/reports/${encodeURIComponent(reportId)}`);
}