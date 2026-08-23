import { apiRequest } from "./api";

export function getHotspots(zoneId) {
  const params = new URLSearchParams();

  if (zoneId) {
    params.set("zone_id", zoneId);
  }

  const query = params.toString();

  return apiRequest(`/hotspots${query ? `?${query}` : ""}`);
}

export function getRiskClusters() {
  return apiRequest("/risk-clusters");
}