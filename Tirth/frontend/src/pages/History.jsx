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

function History() {
  const [range, setRange] = useState("TODAY");

  const readings = [
    { time: "08:00", aqi: 108, pm25: 55.4, pm10: 91.2 },
    { time: "09:00", aqi: 118, pm25: 61.2, pm10: 98.4 },
    { time: "10:00", aqi: 126, pm25: 66.5, pm10: 105.2 },
    { time: "11:00", aqi: 138, pm25: 74.2, pm10: 118.5 },
    { time: "12:00", aqi: 142, pm25: 78.4, pm10: 121.2 },
    { time: "13:00", aqi: 148, pm25: 82.1, pm10: 129.4 },
    { time: "14:00", aqi: 153, pm25: 85.8, pm10: 134.1 },
    { time: "15:00", aqi: 147, pm25: 80.1, pm10: 128.4 },
  ];

  const averageAQI = useMemo(
    () =>
      Math.round(
        readings.reduce((sum, item) => sum + item.aqi, 0) /
          readings.length
      ),
    []
  );

  const peakAQI = Math.max(...readings.map((item) => item.aqi));

  return (
    <div>
      <div className="dashboard-header history-v3-header">
        <div>
          <p className="eyebrow">HISTORICAL ENVIRONMENT DATA</p>

          <h1>
            AQI
            <span className="dashboard-title-accent"> History</span>
          </h1>

          <p>
            Analyze pollution trends over time and identify periods of
            elevated environmental risk.
          </p>
        </div>

        <div className="history-range-control">
          <CalendarDays size={15} />

          <select
            value={range}
            onChange={(event) => setRange(event.target.value)}
          >
            <option value="TODAY">Today</option>
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
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
            {Math.max(...readings.map((item) => item.pm25))}
          </strong>
          <small>µg/m³</small>
        </section>

        <section className="card history-summary-card">
          <span>Trend</span>

          <strong className="history-trend">
            <TrendingUp size={20} />
            +12%
          </strong>

          <small>vs previous period</small>
        </section>
      </div>

      <section className="card history-area-card">
        <div className="card-header">
          <div>
            <span className="card-kicker">TIME SERIES</span>
            <h2>AQI Trend</h2>
          </div>

          <span className="model-pill">
            {range}
          </span>
        </div>

        <div className="history-area-wrap">
          <ResponsiveContainer width="100%" height={360}>
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
                  border: "1px solid rgba(212,241,232,0.08)",
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
            <span className="card-kicker">MEASUREMENTS</span>
            <h2>Historical Readings</h2>
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
              {readings.map((reading) => (
                <tr key={reading.time}>
                  <td>{reading.time}</td>
                  <td>{reading.aqi}</td>
                  <td>{reading.pm25}</td>
                  <td>{reading.pm10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default History;