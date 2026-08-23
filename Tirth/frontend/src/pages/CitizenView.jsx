import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  LocateFixed,
  MapPin,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

import { createCitizenReport } from "../services/citizenReportService";
import { uploadEvidence } from "../services/evidenceService";

function CitizenView() {
  const [pollutionType, setPollutionType] = useState("SMOKE");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [file, setFile] = useState(null);

  const [reportLoading, setReportLoading] = useState(false);
  const [evidenceLoading, setEvidenceLoading] = useState(false);

  const [reportError, setReportError] = useState("");
  const [evidenceError, setEvidenceError] = useState("");

  const [reportId, setReportId] = useState("");
  const [evidenceId, setEvidenceId] = useState("");

  const zoneId = "zone_001";

  const alerts = [
    {
      id: "alert_001",
      title: "High PM2.5 Concentration",
      severity: "HIGH",
      message:
        "Sensitive groups should reduce prolonged outdoor activity.",
      time: "10 min ago",
    },
    {
      id: "alert_002",
      title: "Evening Pollution Risk",
      severity: "MODERATE",
      message:
        "AQI may remain elevated during peak traffic hours.",
      time: "35 min ago",
    },
  ];

  const previewUrl = useMemo(() => {
    if (!file || !file.type.startsWith("image/")) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      () => {
        alert("Unable to access your location.");
      }
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !description.trim() ||
      !latitude ||
      !longitude
    ) {
      setReportError(
        "Description, latitude and longitude are required."
      );
      return;
    }

    setReportLoading(true);
    setReportError("");
    setReportId("");
    setEvidenceId("");

    try {
      const result = await createCitizenReport({
        title: `${pollutionType} pollution report`,
        description: description.trim(),
        zoneId,
        latitude: Number(latitude),
        longitude: Number(longitude),
        category: pollutionType,
      });

      const data = result?.data || result;

      setReportId(data.report_id || "");

    } catch (error) {
      console.error("Citizen report failed:", error);

      setReportError(
        error?.message ||
          "Unable to submit citizen report."
      );
    } finally {
      setReportLoading(false);
    }
  }

  async function handleEvidenceUpload() {
    if (!file) {
      setEvidenceError("Please select a file.");
      return;
    }

    if (!reportId) {
      setEvidenceError(
        "Submit the environmental report first."
      );
      return;
    }

    setEvidenceLoading(true);
    setEvidenceError("");
    setEvidenceId("");

    try {
      const result = await uploadEvidence({
        incidentId: reportId,
        evidenceType: file.type.startsWith("image/")
          ? "IMAGE"
          : file.type.startsWith("video/")
          ? "VIDEO"
          : "DOCUMENT",
        title: `${pollutionType} evidence`,
        description:
          "Citizen submitted evidence for pollution report.",
        file,
      });

      const data = result?.data || result;

      setEvidenceId(
        data?.evidence_id || ""
      );

    } catch (error) {
      console.error("Evidence upload failed:", error);

      setEvidenceError(
        error?.message ||
          "Unable to upload evidence."
      );
    } finally {
      setEvidenceLoading(false);
    }
  }

  return (
    <div>
      <div className="dashboard-header citizen-v3-header">
        <div>
          <p className="eyebrow">
            COMMUNITY ENVIRONMENT NETWORK
          </p>

          <h1>
            Citizen
            <span className="dashboard-title-accent">
              {" "}Intelligence
            </span>
          </h1>

          <p>
            Monitor local air-quality alerts and help build a trusted
            environmental evidence network.
          </p>
        </div>

        <div className="citizen-trust">
          <ShieldCheck size={17} />
          COMMUNITY VERIFIED CHANNEL
        </div>
      </div>

      <div className="citizen-overview-grid">
        <section className="card citizen-alert-panel">
          <div className="card-header">
            <div>
              <span className="card-kicker">
                LIVE PUBLIC SAFETY
              </span>

              <h2>Local Alerts</h2>
            </div>

            <span className="alert-count">
              {alerts.length} ACTIVE
            </span>
          </div>

          <div className="citizen-alert-list">
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className={`citizen-alert-item severity-${alert.severity.toLowerCase()}`}
              >
                <div className="citizen-alert-icon">
                  <AlertTriangle size={17} />
                </div>

                <div>
                  <div className="citizen-alert-title">
                    <strong>
                      {alert.title}
                    </strong>

                    <span>
                      {alert.severity}
                    </span>
                  </div>

                  <p>
                    {alert.message}
                  </p>

                  <small>
                    {alert.time}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card citizen-zone-status">
          <div className="card-header">
            <div>
              <span className="card-kicker">
                CURRENT ZONE
              </span>

              <h2>Ahmedabad</h2>
            </div>

            <MapPin size={19} />
          </div>

          <div className="citizen-zone-aqi">
            <span>AQI</span>
            <strong>142</strong>
            <small>UNHEALTHY</small>
          </div>

          <div className="citizen-zone-meta">
            <div>
              <span>PM2.5</span>
              <strong>78.4</strong>
            </div>

            <div>
              <span>Risk</span>
              <strong>High</strong>
            </div>

            <div>
              <span>Trend</span>
              <strong>↑ 8%</strong>
            </div>
          </div>
        </section>
      </div>

      <div className="citizen-workspace">
        <section className="card citizen-report-card">
          <div className="card-header">
            <div>
              <span className="card-kicker">
                FIELD REPORT
              </span>

              <h2>
                Report Pollution Incident
              </h2>
            </div>

            <span className="report-status">
              PUBLIC REPORT
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="citizen-form-grid">
              <label>
                Pollution Type

                <select
                  value={pollutionType}
                  onChange={(event) =>
                    setPollutionType(
                      event.target.value
                    )
                  }
                >
                  <option value="SMOKE">
                    Smoke
                  </option>

                  <option value="DUST">
                    Dust
                  </option>

                  <option value="VEHICLE">
                    Vehicle Emissions
                  </option>

                  <option value="INDUSTRIAL">
                    Industrial Pollution
                  </option>

                  <option value="BURNING">
                    Open Burning
                  </option>

                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </label>

              <div className="location-action-box">
                <span>Location</span>

                <button
                  type="button"
                  className="citizen-secondary-button"
                  onClick={useCurrentLocation}
                >
                  <LocateFixed size={15} />
                  Use Current Location
                </button>
              </div>

              <label>
                Latitude

                <input
                  value={latitude}
                  onChange={(event) =>
                    setLatitude(
                      event.target.value
                    )
                  }
                  placeholder="23.022500"
                />
              </label>

              <label>
                Longitude

                <input
                  value={longitude}
                  onChange={(event) =>
                    setLongitude(
                      event.target.value
                    )
                  }
                  placeholder="72.571400"
                />
              </label>
            </div>

            <label>
              What did you observe?

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Describe smoke, dust, traffic emissions, burning or any unusual pollution activity..."
              />
            </label>

            <button
              type="submit"
              className="citizen-submit-button"
              disabled={reportLoading}
            >
              {reportLoading
                ? "Submitting..."
                : "Submit Environmental Report"}

              <span>→</span>
            </button>

            {reportError && (
              <div className="citizen-success">
                <div>
                  <strong>
                    Report failed
                  </strong>

                  <span>
                    {reportError}
                  </span>
                </div>
              </div>
            )}

            {reportId && (
              <div className="citizen-success">
                <CheckCircle2 size={17} />

                <div>
                  <strong>
                    Report submitted
                  </strong>

                  <span>
                    Report ID: {reportId}
                  </span>
                </div>
              </div>
            )}
          </form>
        </section>

        <section className="card citizen-evidence-card">
          <div className="card-header">
            <div>
              <span className="card-kicker">
                FIELD EVIDENCE
              </span>

              <h2>
                Add Evidence
              </h2>
            </div>

            <Camera size={19} />
          </div>

          <label className="citizen-upload-zone">
            <input
              type="file"
              accept="image/*,video/*,.pdf"
              onChange={(event) =>
                setFile(
                  event.target.files?.[0] ||
                    null
                )
              }
            />

            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Evidence preview"
                className="citizen-evidence-preview"
              />
            ) : (
              <div className="citizen-upload-placeholder">
                <div className="citizen-upload-icon">
                  <UploadCloud size={24} />
                </div>

                <strong>
                  {file
                    ? file.name
                    : "Drop or select evidence"}
                </strong>

                <span>
                  Image, video or PDF • evidence remains private by default
                </span>
              </div>
            )}
          </label>

          {file && (
            <div className="citizen-file-info">
              <div>
                <span>
                  Selected evidence
                </span>

                <strong>
                  {file.name}
                </strong>
              </div>

              <small>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </small>
            </div>
          )}

          <button
            type="button"
            className="citizen-submit-button"
            onClick={handleEvidenceUpload}
            disabled={
              !file ||
              !reportId ||
              evidenceLoading
            }
            style={{
              marginTop: "16px",
            }}
          >
            {evidenceLoading
              ? "Uploading Evidence..."
              : "Upload Evidence"}

            <span>→</span>
          </button>

          {evidenceError && (
            <div
              style={{
                marginTop: "12px",
              }}
            >
              {evidenceError}
            </div>
          )}

          {evidenceId && (
            <div className="citizen-success">
              <CheckCircle2 size={17} />

              <div>
                <strong>
                  Evidence uploaded
                </strong>

                <span>
                  Evidence ID: {evidenceId}
                </span>
              </div>
            </div>
          )}

          <div className="citizen-evidence-note">
            Evidence should only contain information relevant to the pollution
            incident.
          </div>
        </section>
      </div>
    </div>
  );
}

export default CitizenView;