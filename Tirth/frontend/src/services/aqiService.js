import { apiRequest } from "./api";


/*
 * ---------------------------------------------------------
 * Existing Firestore current AQI
 * ---------------------------------------------------------
 */

export function getCurrentAQI(zoneId) {
  const query = zoneId
    ? `?zone_id=${encodeURIComponent(zoneId)}`
    : "";

  return apiRequest(
    `/aqi/current${query}`
  );
}


/*
 * ---------------------------------------------------------
 * Live AQI - single selected zone
 * ---------------------------------------------------------
 */

export function getLiveAQI(zoneId) {
  if (!zoneId) {
    throw new Error(
      "zoneId is required."
    );
  }

  const params =
    new URLSearchParams();

  params.set(
    "zone_id",
    zoneId
  );

  return apiRequest(
    `/aqi/live?${params.toString()}`
  );
}


/*
 * ---------------------------------------------------------
 * Live AQI - all monitored zones
 * Used by useZones.js / Compare Zones
 * ---------------------------------------------------------
 */

export function getLiveAQINetwork() {
  return apiRequest(
    "/aqi/live-network"
  );
}


/*
 * ---------------------------------------------------------
 * Old Firestore history
 * Kept so existing code does not break.
 * ---------------------------------------------------------
 */

export function getAQIHistory({
  zoneId,
  from,
  to,
  interval,
  limit,
} = {}) {
  const params =
    new URLSearchParams();

  if (zoneId) {
    params.set(
      "zone_id",
      zoneId
    );
  }

  if (from) {
    params.set(
      "from",
      from
    );
  }

  if (to) {
    params.set(
      "to",
      to
    );
  }

  if (interval) {
    params.set(
      "interval",
      interval
    );
  }

  if (limit) {
    params.set(
      "limit",
      String(limit)
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


/*
 * ---------------------------------------------------------
 * New Open-Meteo live historical AQI
 *
 * 24 hours  = Today
 * 168 hours = Last 7 Days
 * 720 hours = Last 30 Days
 * ---------------------------------------------------------
 */

export function getLiveAQIHistory({
  zoneId,
  hours = 24,
} = {}) {
  if (!zoneId) {
    throw new Error(
      "zoneId is required."
    );
  }

  const params =
    new URLSearchParams();

  params.set(
    "zone_id",
    zoneId
  );

  params.set(
    "hours",
    String(hours)
  );

  return apiRequest(
    `/aqi/history-live?${params.toString()}`
  );
}