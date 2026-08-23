import { useMemo, useState } from "react";
import {
  CalendarDays,
  TrendingUp,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAQIHistory } from "../hooks/useAQIHistory";
import { useAppContext } from "../context/AppContext";

function History() {
  const { selectedZone } = useAppContext();
  const [range, setRange] = useState("TODAY");

  const limit =
    range === "TODAY"
      ? 24
      : range === "7D"
      ? 168
      : 168;

  const {
    data,
    loading,
    error,
  } = useAQIHistory(selectedZone, limit);

  const readings = useMemo(() => {
    const rawReadings = data?.readings || [];

    return [...rawReadings]
      .reverse()
      .map((reading) => ({
        time: new Date(
          reading.timestamp
        ).toLocaleString([], {
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        aqi: reading.aqi ?? 0,
        pm25: reading.pm25 ?? 0,
        pm10: reading.pm10 ?? 0,
      }));
  }, [data]);

  const averageAQI =
    readings.length > 0
      ? Math.round(
          readings.reduce(
            (sum, item) => sum + item.aqi,
            0
          ) / readings.length
        )
      : 0;

  const peakAQI =
    readings.length > 0
      ? Math.max(
          ...readings.map((item) => item.aqi)
        )
      : 0;

  const pm25Peak =
    readings.length > 0
      ? Math.max(
          ...readings.map((item) => item.pm25)
        )
      : 0;

  const trend =
    readings.length >= 2
      ? Math.round(
          ((readings[readings.length - 1].aqi -
            readings[0].aqi) /
            Math.max(readings[0].aqi, 1)) *
            100
        )
      : 0;

  if (loading) {
    return (
      <div>
        <p>Loading AQI history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>
          History unavailable: {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header history-v3-header">
        <div>
          <p className="eyebrow">
            HISTORICAL ENVIRONMENT DATA
          </p>

          <h1>
            AQI
            <span className="dashboard-title-accent">
              {" "}History
            </span>
          </h1>

          <p>
            Analyze pollution trends over time and
            identify periods of elevated
            environmental risk.
          </p>
        </div>

        <div className="history-range-control">
          <CalendarDays size={15} />

          <select
            value={range}
            onChange={(event) =>
              setRange(event.target.value)
            }
          >
            <option value="TODAY">
              Today
            </option>

            <option value="7D">
              Last 7 Days
            </option>

            <option value="30D">
              Last 30 Days
            </option>
          </select>
        </div>
      </div>

      <div className="history-summary-grid">
        <section className="card history-summary-card">
          <span>Average AQI</span>
          <strong>{averageAQI}</strong>
          <small>Selected period</small>
        </section>

        <section className="card history-summary-card">
          <span>Peak AQI</span>
          <strong>{peakAQI}</strong>
          <small>Highest recorded</small>
        </section>

        <section className="card history-summary-card">
          <span>PM2.5 Peak</span>

          <strong>
            {pm25Peak}
          </strong>

          <small>µg/m³</small>
        </section>

        <section className="card history-summary-card">
          <span>Trend</span>

          <strong className="history-trend">
            <TrendingUp size={20} />
            {trend >= 0 ? "+" : ""}
            {trend}%
          </strong>

          <small>
            First vs latest reading
          </small>
        </section>
      </div>

      <section className="card history-area-card">
        <div className="card-header">
          <div>
            <span className="card-kicker">
              TIME SERIES
            </span>

            <h2>AQI Trend</h2>
          </div>

          <span className="model-pill">
            {range}
          </span>
        </div>

        <div className="history-area-wrap">
          <ResponsiveContainer
            width="100%"
            height={360}
          >
            <AreaChart data={readings}>
              <defs>
                <linearGradient
                  id="historyArea"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="#39e6b1"
                    stopOpacity={0.38}
                  />

                  <stop
                    offset="95%"
                    stopColor="#39e6b1"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />

              <XAxis
                dataKey="time"
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

              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#39e6b1"
                strokeWidth={3}
                fill="url(#historyArea)"
                activeDot={{
                  r: 6,
                  fill: "#62dce8",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card history-table-card">
        <div className="card-header">
          <div>
            <span className="card-kicker">
              MEASUREMENTS
            </span>

            <h2>
              Historical Readings
            </h2>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>AQI</th>
                <th>PM2.5</th>
                <th>PM10</th>
              </tr>
            </thead>

            <tbody>
              {readings.map(
                (reading, index) => (
                  <tr key={`${reading.time}-${index}`}>
                    <td>{reading.time}</td>
                    <td>{reading.aqi}</td>
                    <td>{reading.pm25}</td>
                    <td>{reading.pm10}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default History;