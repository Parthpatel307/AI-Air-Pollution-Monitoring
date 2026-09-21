function formatStatusLabel(value = "UNKNOWN") {
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


function AQICard({
  aqi = 0,
  category = "UNKNOWN",
  timestamp,
}) {
  const formattedCategory =
    formatStatusLabel(category);

  const categoryFontSize =
    formattedCategory.length > 25
      ? "10px"
      : formattedCategory.length > 16
      ? "11px"
      : "12px";


  return (
    <section className="card aqi-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">
            LIVE AQI
          </span>

          <h2>
            Air Quality Index
          </h2>
        </div>

        <span className="live-dot">
          <span />
          LIVE
        </span>
      </div>


      <div className="aqi-ring">
        <div className="aqi-ring-inner">
          <strong>
            {aqi}
          </strong>

          <span
            title={
              formattedCategory
            }
            style={{
              display: "block",
              width: "100%",
              maxWidth: "150px",
              margin: "4px auto 0",
              padding: "0 8px",
              boxSizing: "border-box",
              textAlign: "center",
              whiteSpace: "normal",
              overflowWrap: "break-word",
              wordBreak: "normal",
              lineHeight: 1.2,
              fontSize:
                categoryFontSize,
            }}
          >
            {formattedCategory}
          </span>
        </div>
      </div>


      {timestamp && (
        <small className="muted">
          Updated:{" "}
          {new Date(
            timestamp
          ).toLocaleString()}
        </small>
      )}
    </section>
  );
}


export default AQICard;