import { useState } from "react";
import {
  ScanSearch,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

import { analyzeEvidence } from "../services/aiService";

function EvidenceAnalysis() {
  const [evidenceId, setEvidenceId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(event) {
    event.preventDefault();

    const cleanEvidenceId = evidenceId.trim();

    if (!cleanEvidenceId || loading) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await analyzeEvidence(cleanEvidenceId);

      const data = response?.data || response;

      setResult({
        classification:
          data?.classification || "UNKNOWN",
        confidence:
          Number(data?.confidence ?? 0),
        detected_objects:
          Array.isArray(data?.detected_objects)
            ? data.detected_objects
            : [],
        explanation:
          data?.explanation ||
          "AI analysis completed.",
      });
    } catch (err) {
      console.error(
        "Evidence analysis failed:",
        err
      );

      setError(
        err?.message ||
          "Evidence analysis failed."
      );
    } finally {
      setLoading(false);
    }
  }

  const confidencePercent = result
    ? Math.round(
        Math.max(
          0,
          Math.min(
            1,
            result.confidence
          )
        ) * 100
      )
    : 0;

  return (
    <div>
      <div className="dashboard-header evidence-v3-header">
        <div>
          <p className="eyebrow">
            MULTIMODAL ENVIRONMENT INTELLIGENCE
          </p>

          <h1>
            Evidence
            <span className="dashboard-title-accent">
              {" "}
              AI Analysis
            </span>
          </h1>

          <p>
            Review submitted environmental evidence
            using AI-assisted visual detection and
            confidence scoring.
          </p>
        </div>

        <div className="evidence-security-badge">
          <ShieldCheck size={17} />
          AUTHORITY REVIEW
        </div>
      </div>

      <div className="evidence-v3-grid">
        <section className="card evidence-input-card">
          <div className="card-header">
            <div>
              <span className="card-kicker">
                ANALYSIS INPUT
              </span>

              <h2>
                Evidence Inspection
              </h2>
            </div>

            <ScanSearch size={19} />
          </div>

          <form onSubmit={handleAnalyze}>
            <label>
              Evidence ID

              <input
                value={evidenceId}
                onChange={(event) =>
                  setEvidenceId(
                    event.target.value
                  )
                }
                placeholder="evidence_001"
                disabled={loading}
              />
            </label>

            <button
              type="submit"
              disabled={
                loading ||
                !evidenceId.trim()
              }
            >
              {loading
                ? "Analyzing..."
                : "Run AI Inspection →"}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: "12px",
              }}
            >
              {error}
            </div>
          )}

          <div className="evidence-capabilities">
            <span>
              ANALYSIS CAPABILITIES
            </span>

            <div>
              <div>
                <ImageIcon size={15} />
                Smoke detection
              </div>

              <div>
                <Target size={15} />
                Object detection
              </div>

              <div>
                <Sparkles size={15} />
                AI explanation
              </div>
            </div>
          </div>
        </section>

        <section className="card evidence-visual-card">
          <div className="card-header">
            <div>
              <span className="card-kicker">
                VISUAL INSPECTION
              </span>

              <h2>
                Evidence Feed
              </h2>
            </div>

            <span className="model-pill">
              {loading
                ? "ANALYZING"
                : "VISION AI"}
            </span>
          </div>

          <div className="evidence-visual-surface">
            <div className="evidence-grid-overlay" />

            {!result ? (
              <div className="evidence-empty-preview">
                <ImageIcon size={28} />

                <strong>
                  {loading
                    ? "Analyzing evidence..."
                    : "No evidence analyzed yet"}
                </strong>

                <span>
                  {loading
                    ? "Vision AI is processing the submitted evidence."
                    : "Enter an evidence ID to start inspection."}
                </span>
              </div>
            ) : (
              <>
                {result.detected_objects.map(
                  (item, index) => (
                    <div
                      className={
                        index === 0
                          ? "vision-target smoke-target"
                          : "vision-target vehicle-target"
                      }
                      key={item}
                    >
                      <span>
                        {String(
                          item
                        ).toUpperCase()}
                      </span>

                      <strong>
                        {confidencePercent}%
                      </strong>
                    </div>
                  )
                )}

                <div className="vision-scan-line" />
              </>
            )}
          </div>
        </section>

        <section className="card evidence-result-v3">
          <div className="card-header">
            <div>
              <span className="card-kicker">
                AI ASSESSMENT
              </span>

              <h2>
                Inspection Result
              </h2>
            </div>

            {result && (
              <span className="secure-pill">
                ANALYSIS COMPLETE
              </span>
            )}
          </div>

          {!result ? (
            <div className="evidence-result-empty">
              {loading
                ? "AI inspection is running..."
                : "Run an inspection to view AI analysis."}
            </div>
          ) : (
            <>
              <div className="evidence-result-summary">
                <div>
                  <span>
                    Classification
                  </span>

                  <strong>
                    {String(
                      result.classification
                    ).replaceAll(
                      "_",
                      " "
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Confidence
                  </span>

                  <strong>
                    {confidencePercent}%
                  </strong>
                </div>
              </div>

              <div className="authority-confidence">
                <div>
                  <span>
                    AI Confidence
                  </span>

                  <strong>
                    {confidencePercent}%
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-value"
                    style={{
                      width: `${confidencePercent}%`,
                    }}
                  />
                </div>
              </div>

              <div className="evidence-object-row">
                {result.detected_objects.length >
                0 ? (
                  result.detected_objects.map(
                    (item) => (
                      <span key={item}>
                        {String(
                          item
                        ).toUpperCase()}
                      </span>
                    )
                  )
                ) : (
                  <span>
                    NO OBJECTS REPORTED
                  </span>
                )}
              </div>

              <div className="evidence-ai-explanation">
                <span>
                  AI EXPLANATION
                </span>

                <p>
                  {result.explanation}
                </p>
              </div>

              <div className="analysis-warning">
                AI-assisted evidence analysis is
                advisory and must not be treated as
                definitive proof.
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default EvidenceAnalysis;