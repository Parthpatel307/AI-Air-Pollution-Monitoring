import { apiRequest } from "./api";

export function uploadEvidence({
  incidentId,
  evidenceType,
  title,
  description,
  file,
}) {
  const formData = new FormData();

  formData.append("incident_id", incidentId);
  formData.append("evidence_type", evidenceType);
  formData.append("title", title);
  formData.append("description", description);
  formData.append("file", file);

  return apiRequest("/evidence", {
    method: "POST",
    body: formData,
  });
}