function ForecastRiskCard({
  predictedAQI = 0,
  riskLevel = "UNKNOWN",
  timestamp,
}) {
  return (
    <section className="card forecast-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">
            LIVE FORECAST
          </span>

          <h2>Forecast Risk</h2>
        </div>

        <span className="risk-badge">
          {riskLevel}
        </span>
      </div>

      <div className="forecast-value">
        <span>Predicted AQI</span>

        <strong>
          {predictedAQI}
        </strong>
      </div>

      <div className="confidence">
        <div className="confidence-row">
          <span>Forecast Source</span>

          <strong>
            Open-Meteo
          </strong>
        </div>
      </div>

      {timestamp && (
        <small className="muted">
          Forecast:{" "}
          {new Date(
            timestamp
          ).toLocaleString()}
        </small>
      )}
    </section>
  );
}

export default ForecastRiskCard;