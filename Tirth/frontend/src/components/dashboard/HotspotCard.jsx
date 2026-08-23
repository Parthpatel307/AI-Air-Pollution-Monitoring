function HotspotCard({
  hotspotId,
  latitude,
  longitude,
  severity = "UNKNOWN",
  aqi = 0,
  pollutants = [],
}) {
  return (
    <section>
      <h2>Pollution Hotspot</h2>

      <p>ID: {hotspotId}</p>
      <p>AQI: {aqi}</p>
      <p>Severity: {severity}</p>

      <p>
        Location: {latitude}, {longitude}
      </p>

      <div>
        <strong>Pollutants:</strong>

        {pollutants.length > 0 ? (
          <ul>
            {pollutants.map((pollutant) => (
              <li key={pollutant}>{pollutant}</li>
            ))}
          </ul>
        ) : (
          <p>No pollutants reported.</p>
        )}
      </div>
    </section>
  );
}

export default HotspotCard;