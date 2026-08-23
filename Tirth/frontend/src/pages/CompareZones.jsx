import { useMemo, useState } from "react";
import {
  BarChart3,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CompareZones() {
  const zones = [
    {
      zone_id: "zone_001",
      name: "Ahmedabad",
      aqi: 142,
      pm25: 78.4,
      pm10: 121.2,
      risk_level: "HIGH",
      trend: 8,
    },
    {
      zone_id: "zone_002",
      name: "Gandhinagar",
      aqi: 96,
      pm25: 49.1,
      pm10: 82.3,
      risk_level: "MODERATE",
      trend: -3,
    },
    {
      zone_id: "zone_003",
      name: "Vadodara",
      aqi: 118,
      pm25: 62.7,
      pm10: 101.6,
      risk_level: "MODERATE",
      trend: 2,
    },
  ];

  const [selectedMetric, setSelectedMetric] = useState("aqi");

  const chartData = useMemo(
    () =>
      zones.map((zone) => ({
        name: zone.name,
        value:
          selectedMetric === "aqi"
            ? zone.aqi
            : selectedMetric === "pm25"
            ? zone.pm25
            : zone.pm10,
      })),
    [selectedMetric]
  );

  return (
    <div>
      <div className="dashboard-header compare-v3-header">
        <div>
          <p className="eyebrow">REGIONAL ENVIRONMENT ANALYTICS</p>

          <h1>
            Compare
            <span className="dashboard-title-accent"> Zones</span>
          </h1>

          <p>
            Compare air quality, particulate matter and pollution risk across
            monitored zones.
          </p>
        </div>

        <div className="compare-filter">
          <span>METRIC</span>

          <select
            value={selectedMetric}
            onChange={(event) => setSelectedMetric(event.target.value)}
          >
            <option value="aqi">AQI</option>
            <option value="pm25">PM2.5</option>
            <option value="pm10">PM10</option>
          </select>
        </div>
      </div>

      <div className="compare-zone-cards">
        {zones.map((zone) => {
          const TrendIcon =
            zone.trend >= 0 ? TrendingUp : TrendingDown;

          return (
            <section className="card compare-zone-card" key={zone.zone_id}>
              <div className="compare-zone-card-top">
                <div>
                  <span className="card-kicker">{zone.zone_id}</span>
                  <h2>{zone.name}</h2>
                </div>

                <span
                  className={`severity-pill severity-${zone.risk_level.toLowerCase()}`}
                >
                  {zone.risk_level}
                </span>
              </div>

              <div className="compare-zone-main">
                <span>AQI</span>
                <strong>{zone.aqi}</strong>
              </div>

              <div className="compare-zone-meta">
                <div>
                  <span>PM2.5</span>
                  <strong>{zone.pm25}</strong>
                </div>

                <div>
                  <span>PM10</span>
                  <strong>{zone.pm10}</strong>
                </div>

                <div>
                  <span>Trend</span>

                  <strong
                    className={
                      zone.trend >= 0
                        ? "trend-up"
                        : "trend-down"
                    }
                  >
                    <TrendIcon size={14} />
                    {Math.abs(zone.trend)}%
                  </strong>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="card compare-chart-card">
        <div className="card-header">
          <div>
            <span className="card-kicker">VISUAL COMPARISON</span>
            <h2>
              {selectedMetric === "aqi"
                ? "AQI"
                : selectedMetric === "pm25"
                ? "PM2.5"
                : "PM10"}{" "}
              by Zone
            </h2>
          </div>

          <BarChart3 size={19} />
        </div>

        <div className="compare-chart-wrap">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#849d96",
                  fontSize: 11,
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#849d96",
                  fontSize: 11,
                }}
              />

              <Tooltip
                contentStyle={{
                  background: "#0d1c1a",
                  border: "1px solid rgba(212,241,232,0.08)",
                  borderRadius: "12px",
                  color: "#ecf5f1",
                }}
              />

              <Bar
                dataKey="value"
                fill="#62dce8"
                radius={[8, 8, 2, 2]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card compare-ranking-card">
        <div className="card-header">
          <div>
            <span className="card-kicker">RISK RANKING</span>
            <h2>Zone Ranking</h2>
          </div>

          <MapPin size={19} />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Zone</th>
                <th>AQI</th>
                <th>PM2.5</th>
                <th>PM10</th>
                <th>Risk</th>
              </tr>
            </thead>

            <tbody>
              {[...zones]
                .sort((a, b) => b.aqi - a.aqi)
                .map((zone, index) => (
                  <tr key={zone.zone_id}>
                    <td>#{index + 1}</td>
                    <td>{zone.name}</td>
                    <td>{zone.aqi}</td>
                    <td>{zone.pm25}</td>
                    <td>{zone.pm10}</td>
                    <td>{zone.risk_level}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default CompareZones;