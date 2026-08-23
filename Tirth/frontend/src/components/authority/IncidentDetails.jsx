function IncidentDetails({ incident }) {
  return (
    <section className="card authority-details-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">INCIDENT INTELLIGENCE</span>
          <h2>Incident Details</h2>
        </div>
      </div>

      {!incident ? (
        <div className="empty-state">
          Select an incident to inspect details.
        </div>
      ) : (
        <>
          <div className="incident-title-block">
            <div>
              <span>{incident.incident_id}</span>
              <h3>{incident.title}</h3>
            </div>

            <span
              className={`severity-pill severity-${incident.severity?.toLowerCase()}`}
            >
              {incident.severity}
            </span>
          </div>

          <div className="incident-detail-grid">
            <div>
              <span>Zone</span>
              <strong>{incident.zone_id}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{incident.status}</strong>
            </div>

            <div>
              <span>Created</span>
              <strong>
                {incident.created_at
                  ? new Date(incident.created_at).toLocaleString()
                  : "Unknown"}
              </strong>
            </div>

            <div>
              <span>Priority</span>
              <strong>{incident.severity}</strong>
            </div>
          </div>

          <div className="incident-summary">
            <span>Operational Summary</span>
            <p>
              Elevated pollution conditions require authority review and
              appropriate field action.
            </p>
          </div>
        </>
      )}
    </section>
  );
}

export default IncidentDetails;