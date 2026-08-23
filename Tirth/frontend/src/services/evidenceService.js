import { apiRequest } from "./api";

export function uploadEvidence(file) {
  const formData = new FormData();

  formData.append("file", file);

  return apiRequest("/evidence", {
    method: "POST",
    body: formData,
  });
}

export function getEvidenceById(evidenceId) {
  return apiRequest(
    `/evidence/${encodeURIComponent(evidenceId)}`
  );
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export async function uploadEvidence(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/evidence`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(
      result?.error?.message || "Evidence upload failed."
    );
  }

  return result.data;
}

export async function getEvidenceById(evidenceId) {
  const response = await fetch(
    `${API_BASE_URL}/evidence/${encodeURIComponent(evidenceId)}`
  );

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(
      result?.error?.message || "Unable to load evidence."
    );
  }

  return result.data;
}