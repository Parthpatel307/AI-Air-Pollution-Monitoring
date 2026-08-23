import { apiRequest } from "./api";

export function getForecast({ zoneId, hours = 24 } = {}) {
  const params = new URLSearchParams();

  if (zoneId) params.set("zone_id", zoneId);
  if (hours) params.set("hours", hours);

  const query = params.toString();

  return apiRequest(`/forecast${query ? `?${query}` : ""}`);
}