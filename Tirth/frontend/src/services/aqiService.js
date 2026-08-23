import { apiRequest } from "./api";

export function getCurrentAQI(zoneId) {
  const query = zoneId
    ? `?zone_id=${encodeURIComponent(zoneId)}`
    : "";

  return apiRequest(`/aqi/current${query}`);
}

export function getAQIHistory({ zoneId, limit = 24 } = {}) {
  const params = new URLSearchParams();

  if (zoneId) params.set("zone_id", zoneId);
  if (limit) params.set("limit", limit);

  const query = params.toString();

  return apiRequest(
    `/aqi/history${query ? `?${query}` : ""}`
  );
}