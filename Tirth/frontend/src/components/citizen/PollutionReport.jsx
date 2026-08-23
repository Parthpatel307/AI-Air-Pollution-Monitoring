import { useState } from "react";

function PollutionReport() {
  const [pollutionType, setPollutionType] = useState("SMOKE");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      () => {
        alert("Unable to access your location.");
      }
    );
  }

  function handleSubmit(event) {
    event.preventDefault();

    console.log({
      latitude: Number(latitude),
      longitude: Number(longitude),
      description,
      pollution_type: pollutionType,
    });
  }

  return (
    <section className="card report-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">CITIZEN INTELLIGENCE</span>
          <h2>Report Pollution</h2>
        </div>

        <span className="report-status">
          QUICK REPORT
        </span>
      </div>

      <p className="section-description">
        Report visible pollution incidents so authorities can review local
        conditions.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label>
            Pollution Type

            <select
              value={pollutionType}
              onChange={(event) =>
                setPollutionType(event.target.value)
              }
            >
              <option value="SMOKE">Smoke</option>
              <option value="DUST">Dust</option>
              <option value="VEHICLE">Vehicle Emissions</option>
              <option value="INDUSTRIAL">Industrial Pollution</option>
              <option value="BURNING">Open Burning</option>
              <option value="OTHER">Other</option>
            </select>
          </label>

          <div className="location-control">
            <span>Location</span>

            <button
              type="button"
              className="secondary-button"
              onClick={useCurrentLocation}
            >
              Use Current Location
            </button>
          </div>

          <label>
            Latitude

            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              placeholder="23.0225"
            />
          </label>

          <label>
            Longitude

            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              placeholder="72.5714"
            />
          </label>
        </div>

        <label>
          Description

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Describe what you observed..."
          />
        </label>

        <button type="submit">
          Submit Pollution Report →
        </button>
      </form>
    </section>
  );
}

export default PollutionReport;