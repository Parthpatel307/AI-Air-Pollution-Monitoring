import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  MapPin,
  ShieldAlert,
  Siren,
  Target,
} from "lucide-react";

function AuthorityMode() {
  const incidents = [
    {
      incident_id: "INC-001",
      title: "Industrial Smoke Event",
      severity: "HIGH",
      zone_id: "zone_001",
      zone_name: "Ahmedabad",
      status: "OPEN",
      created_at: "2026-08-21T10:30:00Z",
      source: "INDUSTRIAL_ACTIVITY",
      confidence: 0.86,
      summary:
        "Elevated particulate matter and visible smoke reported near an industrial corridor.",
    },
    {
      incident_id: "INC-002",
      title: "Traffic Pollution Spike",
      severity: "MODERATE",
      zone_id: "zone_002",
      zone_name: "Gandhinagar",
      status: "UNDER REVIEW",
      created_at: "2026-08-21T09:40:00Z",
      source: "VEHICLE_TRAFFIC",
      confidence: 0.78,
      summary:
        "NO2 and PM2.5 levels increased during peak traffic hours.",
    },
    {
      incident_id: "INC-003",
      title: "Open Burning Report",
      severity: "HIGH",
      zone_id: "zone_003",
      zone_name: "Vadodara",
      status: "OPEN",
      created_at: "2026-08-21T08:55:00Z",
      source: "OPEN_BURNING",
      confidence: 0.91,
      summary:
        "Citizen evidence indicates probable open-burning activity near a residential area.",
    },
  ];

  const [selectedId, setSelectedId] = useState(incidents[0].incident_id);
  const [action, setAction] = useState("INSPECTION_REQUESTED");
  const [notes, setNotes] = useState("");
  const [actionSaved, setActionSaved] = useState(false);

  const selectedIncident = useMemo(
    () =>
      incidents.find(
        (incident) => incident.incident_id === selectedId
      ) || incidents[0],
    [selectedId]
  );

  function handleActionSubmit(event) {
    event.preventDefault();

    setActionSaved(true);

    console.log({
      incident_id: selectedIncident.incident_id,
      action,
      notes,
    });
  }

  return (
    <div>
      <div className="dashboard-header authority-v3-header">
        <div>
          <p className="eyebrow">ENVIRONMENTAL RESPONSE OPERATIONS</p>

          <h1>
            Incident
            <span className="dashboard-title-accent"> Command</span>
          </h1>

          <p>
            Review high-risk pollution events, inspect AI-supported evidence
            and coordinate environmental response.
          </p>
        </div>

        <div className="authority-header-status">
          <ShieldAlert size={17} />
          AUTHORITY MODE
        </div>
      </div>

      <div className="authority-metrics">
        <section className="card authority-metric-card">
          <div>
            <span>Open Incidents</span>
            <strong>3</strong>
          </div>

          <AlertTriangle size={22} />
        </section>

        <section className="card authority-metric-card">
          <div>
            <span>High Priority</span>
            <strong>2</strong>
          </div>

          <Siren size={22} />
        </section>

        <section className="card authority-metric-card">
          <div>
            <span>Under Review</span>
            <strong>1</strong>
          </div>

          <Clock3 size={22} />
        </section>

        <section className="card authority-metric-card">
          <div>
            <span>Coverage</span>
            <strong>3 Zones</strong>
          </div>

          <Target size={22} />
        </section>
      </div>

      <div className="authority-command-grid">
        <section className="card authority-queue-card">
          <div className="card-header">
            <div>
              <span className="card-kicker">INCIDENT QUEUE</span>
              <h2>Active Incidents</h2>
            </div>

            <span className="incident-count">
              {incidents.length} ACTIVE
            </span>
          </div>

          <div className="authority-incident-list">
            {incidents.map((incident) => (
              <button
                type="button"
                key={incident.incident_id}
                className={
                  selectedId === incident.incident_id
                    ? "authority-incident-row selected"
                    : "authority-incident-row"
                }
                onClick={() =>
                  setSelectedId(incident.incident_id)
                }
              >
                <div className="authority-incident-top">
                  <span>{incident.incident_id}</span>

                  <span
                    className={`severity-pill severity-${incident.severity.toLowerCase()}`}
                  >
                    {incident.severity}
                  </span>
                </div>

                <strong>{incident.title}</strong>

                <div className="authority-incident-meta">
                  <span>
                    <MapPin size={12} />
                    {incident.zone_name}
                  </span>

                  <span>{incident.status}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="authority-intelligence-column">
          <section className="card authority-intelligence-card">
            <div className="card-header">
              <div>
                <span className="card-kicker">INCIDENT INTELLIGENCE</span>
                <h2>{selectedIncident.title}</h2>
              </div>

              <span
                className={`severity-pill severity-${selectedIncident.severity.toLowerCase()}`}
              >
                {selectedIncident.severity}
              </span>
            </div>

            <div className="authority-incident-id">
              {selectedIncident.incident_id}
            </div>

            <p className="authority-summary">
              {selectedIncident.summary}
            </p>

            <div className="authority-detail-grid">
              <div>
                <span>Zone</span>
                <strong>{selectedIncident.zone_name}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{selectedIncident.status}</strong>
              </div>

              <div>
                <span>Probable Source</span>
                <strong>
                  {selectedIncident.source.replaceAll("_", " ")}
                </strong>
              </div>

              <div>
                <span>AI Confidence</span>
                <strong>
                  {(selectedIncident.confidence * 100).toFixed(0)}%
                </strong>
              </div>
            </div>

            <div className="authority-confidence">
              <div>
                <span>Source Confidence</span>
                <strong>
                  {(selectedIncident.confidence * 100).toFixed(0)}%
                </strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-value"
                  style={{
                    width: `${selectedIncident.confidence * 100}%`,
                  }}
                />
              </div>
            </div>
          </section>

          <section className="card authority-timeline-card">
            <div className="card-header">
              <div>
                <span className="card-kicker">EVENT TIMELINE</span>
                <h2>Operational Timeline</h2>
              </div>
            </div>

            <div className="authority-timeline">
              <div className="authority-timeline-item">
                <span className="timeline-dot" />

                <div>
                  <strong>Incident detected</strong>
                  <span>10:30</span>
                  <p>
                    Environmental readings exceeded configured thresholds.
                  </p>
                </div>
              </div>

              <div className="authority-timeline-item">
                <span className="timeline-dot" />

                <div>
                  <strong>AI source analysis completed</strong>
                  <span>10:33</span>
                  <p>
                    Probable source classification generated for authority
                    review.
                  </p>
                </div>
              </div>

              <div className="authority-timeline-item">
                <span className="timeline-dot pending" />

                <div>
                  <strong>Authority response pending</strong>
                  <span>NOW</span>
                  <p>
                    Select an operational action to continue the response
                    workflow.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="card authority-action-v3">
            <div className="card-header">
              <div>
                <span className="card-kicker">RESPONSE WORKFLOW</span>
                <h2>Record Authority Action</h2>
              </div>

              <span className="secure-pill">
                CONTROLLED
              </span>
            </div>

            <form onSubmit={handleActionSubmit}>
              <label>
                Response Action

                <select
                  value={action}
                  onChange={(event) =>
                    setAction(event.target.value)
                  }
                >
                  <option value="INSPECTION_REQUESTED">
                    Inspection Requested
                  </option>

                  <option value="WARNING_ISSUED">
                    Warning Issued
                  </option>

                  <option value="ESCALATED">
                    Escalated
                  </option>

                  <option value="MONITORING">
                    Continue Monitoring
                  </option>

                  <option value="RESOLVED">
                    Mark Resolved
                  </option>
                </select>
              </label>

              <label>
                Authority Notes

                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Add inspection details, response instructions or operational notes..."
                />
              </label>

              <button type="submit">
                Record Response Action →
              </button>

              {actionSaved && (
                <div className="authority-action-success">
                  Action recorded locally. Backend integration will persist
                  this response.
                </div>
              )}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AuthorityMode;