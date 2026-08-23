function IncidentList({ incidents = [], onSelect, selectedId }) {
  return (
    <section className="card authority-list-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">INCIDENT QUEUE</span>
          <h2>Active Incidents</h2>
        </div>

        <span className="incident-count">
          {incidents.length} OPEN
        </span>
      </div>

      {incidents.length === 0 ? (
        <div className="empty-state">
          No active incidents.
        </div>
      ) : (
        <div className="incident-list">
          {incidents.map((incident) => (
            <button
              type="button"
              key={incident.incident_id}
              onClick={() => onSelect?.(incident)}
              className={
                selectedId === incident.incident_id
                  ? "incident-row selected"
                  : "incident-row"
              }
            >
              <div className="incident-row-top">
                <span className="incident-id">
                  {incident.incident_id}
                </span>

                <span
                  className={`severity-pill severity-${incident.severity?.toLowerCase()}`}
                >
                  {incident.severity}
                </span>
              </div>

              <strong>{incident.title}</strong>

              <div className="incident-meta">
                <span>{incident.zone_id}</span>
                <span>{incident.status}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default IncidentList;