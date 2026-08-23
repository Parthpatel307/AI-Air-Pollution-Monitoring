function ForecastRiskCard({
  predictedAQI = 0,
  riskLevel = "UNKNOWN",
  confidence = 0,
  timestamp,
}) {
  return (
    <section className="card forecast-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">AI FORECAST</span>
          <h2>Forecast Risk</h2>
        </div>

        <span className="risk-badge">{riskLevel}</span>
      </div>

      <div className="forecast-value">
        <span>Predicted AQI</span>
        <strong>{predictedAQI}</strong>
      </div>

      <div className="confidence">
        <div className="confidence-row">
          <span>Model Confidence</span>
          <strong>{(confidence * 100).toFixed(0)}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-value"
            style={{ width: `${confidence * 100}%` }}
          />
        </div>
      </div>

      {timestamp && (
        <small className="muted">
          Forecast: {new Date(timestamp).toLocaleString()}
        </small>
      )}
    </section>
  );
}

export default ForecastRiskCard;