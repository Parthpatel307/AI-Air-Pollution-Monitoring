import { apiRequest } from "./api";

export function getAlerts({ zoneId, active = true } = {}) {
  const params = new URLSearchParams();

  if (zoneId) params.set("zone_id", zoneId);
  params.set("active", String(active));

  return apiRequest(`/alerts?${params.toString()}`);
}   