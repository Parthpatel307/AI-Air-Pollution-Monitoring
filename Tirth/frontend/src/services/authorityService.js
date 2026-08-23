import { apiRequest } from "./api";

export function getIncidents() {
  return apiRequest("/incidents");
}

export function getIncidentById(incidentId) {
  return apiRequest(
    `/incidents/${encodeURIComponent(incidentId)}`
  );
}

export function createIncidentAction({
  incidentId,
  action,
  notes,
}) {
  return apiRequest(
    `/incidents/${encodeURIComponent(incidentId)}/action`,
    {
      method: "POST",
      body: JSON.stringify({
        action,
        notes,
      }),
    }
  );
}