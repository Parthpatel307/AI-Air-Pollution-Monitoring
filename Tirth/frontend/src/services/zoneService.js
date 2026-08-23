import { useState } from "react";

import { apiRequest } from "./api";

export function getZones() {
  return apiRequest("/zones");
}

export function getZoneById(zoneId) {
  return apiRequest(
    `/zones/${encodeURIComponent(zoneId)}`
  );
}

export function compareZones(zoneIds = []) {
  const params = new URLSearchParams();

  if (zoneIds.length > 0) {
    params.set("zone_ids", zoneIds.join(","));
  }

  const query = params.toString();

  return apiRequest(
    `/zones/compare${query ? `?${query}` : ""}`
  );
}

function EvidenceAnalysis() {
  const [evidenceId, setEvidenceId] = useState("");
  const [result, setResult] = useState(null);

  function handleAnalyze(event) {
    event.preventDefault();

    if (!evidenceId.trim()) {
      alert("Please enter an Evidence ID.");
      return;
    }

    // Temporary frontend-only result.
    // Later this will come from POST /api/v1/ai/evidence/analyze
    setResult({
      classification: "VISIBLE_SMOKE",
      confidence: 0.91,
      detected_objects: ["smoke", "road", "vehicle"],
      explanation: "Visible smoke is detected in the submitted evidence.",
    });
  }

  return (
    <div>
      <h1>Evidence AI Analysis</h1>

      <form onSubmit={handleAnalyze}>
        <label>
          Evidence ID
          <input
            type="text"
            value={evidenceId}
            onChange={(event) => setEvidenceId(event.target.value)}
            placeholder="evidence_001"
          />
        </label>

        <button type="submit">Analyze Evidence</button>
      </form>

      {result && (
        <section>
          <h2>Analysis Result</h2>

          <p>
            <strong>Classification:</strong> {result.classification}
          </p>

          <p>
            <strong>Confidence:</strong>{" "}
            {(result.confidence * 100).toFixed(0)}%
          </p>

          <h3>Detected Objects</h3>

          <ul>
            {result.detected_objects.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p>{result.explanation}</p>

          <small>
            AI analysis is an assessment and must not be treated as definitive
            proof.
          </small>
        </section>
      )}
    </div>
  );
}

export default EvidenceAnalysis;