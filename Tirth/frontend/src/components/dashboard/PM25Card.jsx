import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

function PM25Card({ pm25 = 0, pm10 = 0 }) {
  const pm25Trend = [
    { value: 62 },
    { value: 68 },
    { value: 71 },
    { value: 74 },
    { value: pm25 },
  ];

  const pm10Trend = [
    { value: 101 },
    { value: 108 },
    { value: 114 },
    { value: 118 },
    { value: pm10 },
  ];

  return (
    <section className="card metric-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">
            PARTICULATE MATTER
          </span>

          <h2>Pollution Levels</h2>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-box">
          <span>PM2.5</span>

          <strong>
            {pm25}
          </strong>

          <small>µg/m³</small>

          <div className="mini-chart">
            <ResponsiveContainer width="100%" height={55}>
              <LineChart data={pm25Trend}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#39e6b1"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="metric-box">
          <span>PM10</span>

          <strong>
            {pm10}
          </strong>

          <small>µg/m³</small>

          <div className="mini-chart">
            <ResponsiveContainer width="100%" height={55}>
              <LineChart data={pm10Trend}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#62dce8"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PM25Card;