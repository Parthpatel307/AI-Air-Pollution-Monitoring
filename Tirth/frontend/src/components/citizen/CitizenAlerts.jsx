function CitizenAlerts({ alerts = [] }) {
  return (
    <section className="card citizen-alerts-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">PUBLIC SAFETY</span>
          <h2>Active Air Quality Alerts</h2>
        </div>

        <span className="alert-count">
          {alerts.length} ACTIVE
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-status-dot" />
          No active alerts in your selected zone.
        </div>
      ) : (
        <div className="alert-list">
          {alerts.map((alert) => (
            <article
              key={alert.alert_id}
              className={`alert-item alert-${alert.severity?.toLowerCase()}`}
            >
              <div className="alert-indicator" />

              <div className="alert-content">
                <div className="alert-top">
                  <h3>{alert.title}</h3>
                  <span>{alert.severity}</span>
                </div>

                <p>{alert.message}</p>

                <small>
                  {alert.created_at
                    ? new Date(alert.created_at).toLocaleString()
                    : "Live alert"}
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default CitizenAlerts;