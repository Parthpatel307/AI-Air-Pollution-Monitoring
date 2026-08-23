function WeatherContext({
  temperature = 0,
  humidity = 0,
  windSpeed = 0,
}) {
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <span className="card-kicker">ATMOSPHERIC CONTEXT</span>
          <h2>Weather Conditions</h2>
        </div>
      </div>

      <div className="weather-grid">
        <div>
          <span>Temperature</span>
          <strong>{temperature}°C</strong>
        </div>

        <div>
          <span>Humidity</span>
          <strong>{humidity}%</strong>
        </div>

        <div>
          <span>Wind</span>
          <strong>{windSpeed} km/h</strong>
        </div>
      </div>
    </section>
  );
}

export default WeatherContext;