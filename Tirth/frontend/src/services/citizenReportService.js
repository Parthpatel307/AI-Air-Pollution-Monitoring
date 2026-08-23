import { apiRequest } from "./api";

export function createCitizenReport({
  title,
  description,
  zoneId,
  latitude,
  longitude,
  category,
}) {
  return apiRequest("/citizen-reports", {
    method: "POST",
    body: JSON.stringify({
      title,
      description,
      zone_id: zoneId,
      latitude,
      longitude,
      category,
    }),
  });
}

export function getCitizenReports(zoneId) {
  const query = zoneId
    ? `?zone_id=${encodeURIComponent(zoneId)}`
    : "";

  return apiRequest(`/citizen-reports${query}`);
}