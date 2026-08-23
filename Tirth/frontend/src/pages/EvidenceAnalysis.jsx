import { useState } from "react";
import {
  ScanSearch,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

function EvidenceAnalysis() {
  const [evidenceId, setEvidenceId] = useState("");
  const [result, setResult] = useState(null);

  function handleAnalyze(event) {
    event.preventDefault();

    if (!evidenceId.trim()) {
      alert("Please enter an Evidence ID.");
      return;
    }

    setResult({
      classification: "VISIBLE_SMOKE",
      confidence: 0.91,
      detected_objects: ["smoke", "road", "vehicle"],
      explanation:
        "Visible smoke is detected near a roadway with probable vehicle activity. This result should be reviewed by an authorized operator.",
    });
  }

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
              {" "}AI Analysis
            </span>
          </h1>

          <p>
            Review submitted environmental evidence using AI-assisted visual
            detection and confidence scoring.
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

              <h2>Evidence Inspection</h2>
            </div>

            <ScanSearch size={19} />
          </div>

          <form onSubmit={handleAnalyze}>
            <label>
              Evidence ID

              <input
                value={evidenceId}
                onChange={(event) =>
                  setEvidenceId(event.target.value)
                }
                placeholder="evidence_001"
              />
            </label>

            <button type="submit">
              Run AI Inspection →
            </button>
          </form>

          <div className="evidence-capabilities">
            <span>ANALYSIS CAPABILITIES</span>

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

              <h2>Evidence Feed</h2>
            </div>

            <span className="model-pill">
              VISION AI
            </span>
          </div>

          <div className="evidence-visual-surface">
            <div className="evidence-grid-overlay" />

            {!result ? (
              <div className="evidence-empty-preview">
                <ImageIcon size={28} />

                <strong>
                  No evidence analyzed yet
                </strong>

                <span>
                  Enter an evidence ID to start inspection.
                </span>
              </div>
            ) : (
              <>
                <div className="vision-target smoke-target">
                  <span>SMOKE</span>
                  <strong>91%</strong>
                </div>

                <div className="vision-target vehicle-target">
                  <span>VEHICLE</span>
                  <strong>84%</strong>
                </div>

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

              <h2>Inspection Result</h2>
            </div>

            {result && (
              <span className="secure-pill">
                ANALYSIS COMPLETE
              </span>
            )}
          </div>

          {!result ? (
            <div className="evidence-result-empty">
              Run an inspection to view AI analysis.
            </div>
          ) : (
            <>
              <div className="evidence-result-summary">
                <div>
                  <span>Classification</span>

                  <strong>
                    {result.classification.replaceAll("_", " ")}
                  </strong>
                </div>

                <div>
                  <span>Confidence</span>

                  <strong>
                    {(result.confidence * 100).toFixed(0)}%
                  </strong>
                </div>
              </div>

              <div className="authority-confidence">
                <div>
                  <span>AI Confidence</span>

                  <strong>
                    {(result.confidence * 100).toFixed(0)}%
                  </strong>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-value"
                    style={{
                      width: `${result.confidence * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="evidence-object-row">
                {result.detected_objects.map((item) => (
                  <span key={item}>
                    {item.toUpperCase()}
                  </span>
                ))}
              </div>

              <div className="evidence-ai-explanation">
                <span>AI EXPLANATION</span>

                <p>
                  {result.explanation}
                </p>
              </div>

              <div className="analysis-warning">
                AI-assisted evidence analysis is advisory and must not be
                treated as definitive proof.
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default EvidenceAnalysis;