import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function RiskTrajectory({ forecast = [] }) {
  const data = forecast.map((item) => ({
    time: item.timestamp,
    aqi: item.predicted_aqi,
    confidence: Math.round(item.confidence * 100),
    risk: item.risk_level,
  }));

  return (
    <section className="card trajectory-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">PREDICTIVE MODEL</span>
          <h2>24H AQI Forecast</h2>
        </div>

        <span className="model-pill">
          AI FORECAST
        </span>
      </div>

      <div className="forecast-chart-wrap">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id="aqiArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#62dce8"
                  stopOpacity={0.45}
                />

                <stop
                  offset="95%"
                  stopColor="#62dce8"
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
              tick={{
                fill: "#849d96",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: "#849d96",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
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
              stroke="#62dce8"
              strokeWidth={3}
              fill="url(#aqiArea)"
              activeDot={{
                r: 6,
                fill: "#39e6b1",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="forecast-legend-row">
        <span>
          Peak AQI:
          <strong>
            {" "}
            {Math.max(...data.map((item) => item.aqi))}
          </strong>
        </span>

        <span>
          Avg Confidence:
          <strong>
            {" "}
            {Math.round(
              data.reduce(
                (sum, item) => sum + item.confidence,
                0
              ) / data.length
            )}
            %
          </strong>
        </span>
      </div>
    </section>
  );
}

export default RiskTrajectory;