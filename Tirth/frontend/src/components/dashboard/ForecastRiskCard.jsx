function formatStatusLabel(
  value = "UNKNOWN"
) {
  return String(value)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}


function ForecastRiskCard({
  predictedAQI = 0,
  riskLevel = "UNKNOWN",
  timestamp,
}) {
  const formattedRisk =
    formatStatusLabel(
      riskLevel
    );


  return (
    <section className="card forecast-card">
      <div
        className="card-header"
        style={{
          alignItems:
            "flex-start",
        }}
      >
        <div>
          <span className="card-kicker">
            LIVE FORECAST
          </span>

          <h2>
            Forecast Risk
          </h2>
        </div>


        <span
          className="risk-badge"
          title={
            formattedRisk
          }
          style={{
            maxWidth: "170px",
            padding:
              "7px 10px",
            textAlign:
              "center",
            whiteSpace:
              "normal",
            overflowWrap:
              "break-word",
            wordBreak:
              "normal",
            lineHeight:
              1.2,
            fontSize:
              formattedRisk.length >
              20
                ? "9px"
                : "10px",
          }}
        >
          {formattedRisk}
        </span>
      </div>


      <div className="forecast-value">
        <span>
          Predicted AQI
        </span>

        <strong>
          {predictedAQI}
        </strong>
      </div>


      <div className="confidence">
        <div className="confidence-row">
          <span>
            Forecast Source
          </span>

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