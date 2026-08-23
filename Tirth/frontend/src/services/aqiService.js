import { apiRequest } from "./api";

export function getCurrentAQI(zoneId) {
  const query = zoneId
    ? `?zone_id=${encodeURIComponent(zoneId)}`
    : "";

  return apiRequest(`/aqi/current${query}`);
}

export function getAQIHistory({ zoneId, from, to, interval } = {}) {
  const params = new URLSearchParams();

  if (zoneId) params.set("zone_id", zoneId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (interval) params.set("interval", interval);

  const query = params.toString();

  return apiRequest(`/aqi/history${query ? `?${query}` : ""}`);
}