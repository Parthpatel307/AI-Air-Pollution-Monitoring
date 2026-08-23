import { apiRequest } from "./api";

export function getHistory({ zoneId, from, to } = {}) {
  const params = new URLSearchParams();

  if (zoneId) params.set("zone_id", zoneId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const query = params.toString();

  return apiRequest(`/history${query ? `?${query}` : ""}`);
}