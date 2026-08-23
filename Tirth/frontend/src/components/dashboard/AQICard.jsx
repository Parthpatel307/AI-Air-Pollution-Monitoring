function AQICard({ aqi = 0, category = "UNKNOWN", timestamp }) {
  return (
    <section className="card aqi-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">LIVE AQI</span>
          <h2>Air Quality Index</h2>
        </div>

        <span className="live-dot">
          <span />
          LIVE
        </span>
      </div>

      <div className="aqi-ring">
        <div className="aqi-ring-inner">
          <strong>{aqi}</strong>
          <span>{category}</span>
        </div>
      </div>

      {timestamp && (
        <small className="muted">
          Updated: {new Date(timestamp).toLocaleString()}
        </small>
      )}
    </section>
  );
}

export default AQICard;