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

import { useZones } from "../hooks/useZones";

function CompareZones() {
  const {
    zones,
    loading,
    error,
  } = useZones();

  const [selectedMetric, setSelectedMetric] =
    useState("aqi");

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
    [zones, selectedMetric]
  );

  if (loading) {
    return (
      <div>
        <p>Loading zones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>
          Unable to load zones: {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header compare-v3-header">
        <div>
          <p className="eyebrow">
            REGIONAL ENVIRONMENT ANALYTICS
          </p>

          <h1>
            Compare
            <span className="dashboard-title-accent">
              {" "}Zones
            </span>
          </h1>

          <p>
            Compare air quality, particulate matter
            and pollution risk across monitored zones.
          </p>
        </div>

        <div className="compare-filter">
          <span>METRIC</span>

          <select
            value={selectedMetric}
            onChange={(event) =>
              setSelectedMetric(event.target.value)
            }
          >
            <option value="aqi">AQI</option>
            <option value="pm25">PM2.5</option>
            <option value="pm10">PM10</option>
          </select>
        </div>
      </div>

      {zones.length === 0 && (
        <div className="card">
          No monitored zones found.
        </div>
      )}

      <div className="compare-zone-cards">
        {zones.map((zone) => {
          const trend = zone.trend ?? 0;

          const TrendIcon =
            trend >= 0
              ? TrendingUp
              : TrendingDown;

          const riskLevel =
            zone.risk_level || "UNKNOWN";

          return (
            <section
              className="card compare-zone-card"
              key={zone.zone_id}
            >
              <div className="compare-zone-card-top">
                <div>
                  <span className="card-kicker">
                    {zone.zone_id}
                  </span>

                  <h2>
                    {zone.name ||
                      zone.zone_name ||
                      zone.zone_id}
                  </h2>
                </div>

                <span
                  className={`severity-pill severity-${riskLevel.toLowerCase()}`}
                >
                  {riskLevel}
                </span>
              </div>

              <div className="compare-zone-main">
                <span>AQI</span>

                <strong>
                  {zone.aqi ?? 0}
                </strong>
              </div>

              <div className="compare-zone-meta">
                <div>
                  <span>PM2.5</span>

                  <strong>
                    {zone.pm25 ?? 0}
                  </strong>
                </div>

                <div>
                  <span>PM10</span>

                  <strong>
                    {zone.pm10 ?? 0}
                  </strong>
                </div>

                <div>
                  <span>Trend</span>

                  <strong
                    className={
                      trend >= 0
                        ? "trend-up"
                        : "trend-down"
                    }
                  >
                    <TrendIcon size={14} />

                    {Math.abs(trend)}%
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
            <span className="card-kicker">
              VISUAL COMPARISON
            </span>

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
          <ResponsiveContainer
            width="100%"
            height={320}
          >
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
                  border:
                    "1px solid rgba(212,241,232,0.08)",
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
            <span className="card-kicker">
              RISK RANKING
            </span>

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
                .sort(
                  (a, b) =>
                    (b.aqi ?? 0) -
                    (a.aqi ?? 0)
                )
                .map((zone, index) => (
                  <tr key={zone.zone_id}>
                    <td>#{index + 1}</td>

                    <td>
                      {zone.name ||
                        zone.zone_name ||
                        zone.zone_id}
                    </td>

                    <td>{zone.aqi ?? 0}</td>
                    <td>{zone.pm25 ?? 0}</td>
                    <td>{zone.pm10 ?? 0}</td>

                    <td>
                      {zone.risk_level ||
                        "UNKNOWN"}
                    </td>
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