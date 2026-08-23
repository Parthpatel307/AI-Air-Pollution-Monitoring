import { apiRequest } from "./api";

export function getZones() {
  return apiRequest("/zones");
}

export function getZoneById(zoneId) {
  return apiRequest(
    `/zones/${encodeURIComponent(zoneId)}`
  );
}