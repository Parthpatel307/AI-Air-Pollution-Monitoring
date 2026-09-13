import { apiRequest } from "./api";


export function getCurrentAQI(zoneId) {
  if (!zoneId) {
    throw new Error(
      "zoneId is required for live AQI data."
    );
  }

  const query =
    `?zone_id=${encodeURIComponent(
      zoneId
    )}`;

  return apiRequest(
    `/aqi/live${query}`
  );
}


export function getLiveAQINetwork() {
  return apiRequest(
    "/aqi/live-network"
  );
}


export function getAQIHistory({
  zoneId,
  limit = 24,
} = {}) {
  const params =
    new URLSearchParams();

  if (zoneId) {
    params.set(
      "zone_id",
      zoneId
    );
  }

  if (limit) {
    params.set(
      "limit",
      limit
    );
  }

  const query =
    params.toString();

  return apiRequest(
    `/aqi/history${
      query
        ? `?${query}`
        : ""
    }`
  );
}