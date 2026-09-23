import {
  apiRequest,
} from "./api";


export function getSatellitePollution(
  zoneId,
  days = 5
) {
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
    "days",
    String(days)
  );

  return apiRequest(
    `/satellite/pollution?${params.toString()}`
  );
}


export function getSatelliteNO2Map(
  zoneId,
  days = 5
) {
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
    "days",
    String(days)
  );

  return apiRequest(
    `/satellite/no2-map?${params.toString()}`
  );
}