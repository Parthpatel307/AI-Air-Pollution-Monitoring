import {
  MapPin,
  Radio,
  Navigation,
  Flame,
} from "lucide-react";

function PollutionMap({ zones = [], hotspots = [] }) {
  const zonePositions = [
    { left: "28%", top: "38%" },
    { left: "54%", top: "28%" },
    { left: "68%", top: "60%" },
  ];

  const hotspotPositions = [
    { left: "42%", top: "58%" },
    { left: "76%", top: "42%" },
  ];

  return (
    <section className="card geo-map-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">
            LIVE GEO MONITORING
          </span>

          <h2>Pollution Map</h2>
        </div>

        <div className="geo-map-status">
          <span className="status-dot" />
          LIVE
        </div>
      </div>

      <div className="geo-map-surface">
        <div className="geo-grid" />

        <div className="geo-map-topbar">
          <div>
            <Navigation size={14} />
            Ahmedabad Region
          </div>

          <span>
            3 monitored zones
          </span>
        </div>

        {zones.map((zone, index) => {
          const position =
            zonePositions[index] ||
            zonePositions[zonePositions.length - 1];

          return (
            <button
              type="button"
              key={zone.zone_id}
              className="geo-zone-marker"
              style={position}
              title={`${zone.name} AQI ${zone.current_aqi}`}
            >
              <span className="geo-zone-pulse" />

              <div className="geo-zone-icon">
                <MapPin size={16} />
              </div>

              <div className="geo-zone-label">
                <strong>{zone.current_aqi}</strong>
                <span>{zone.name}</span>
              </div>
            </button>
          );
        })}

        {hotspots.map((hotspot, index) => {
          const position =
            hotspotPositions[index] ||
            hotspotPositions[0];

          return (
            <button
              type="button"
              key={hotspot.hotspot_id}
              className="geo-hotspot-marker"
              style={position}
              title={`Hotspot AQI ${hotspot.aqi}`}
            >
              <span className="geo-hotspot-ring" />

              <Flame size={15} />

              <strong>
                {hotspot.aqi}
              </strong>
            </button>
          );
        })}

        <div className="geo-map-legend">
          <div>
            <span className="legend-dot good" />
            Normal
          </div>

          <div>
            <span className="legend-dot moderate" />
            Moderate
          </div>

          <div>
            <span className="legend-dot high" />
            High
          </div>

          <div>
            <Radio size={12} />
            Live Network
          </div>
        </div>
      </div>

      <div className="geo-map-summary">
        <div>
          <span>Monitored Zones</span>
          <strong>{zones.length}</strong>
        </div>

        <div>
          <span>Active Hotspots</span>
          <strong>{hotspots.length}</strong>
        </div>

        <div>
          <span>Highest AQI</span>
          <strong>
            {Math.max(
              ...zones.map((zone) => zone.current_aqi || 0),
              ...hotspots.map((hotspot) => hotspot.aqi || 0),
              0
            )}
          </strong>
        </div>

        <div>
          <span>Network Status</span>
          <strong className="network-online">
            Online
          </strong>
        </div>
      </div>
    </section>
  );
}

export default PollutionMap;