import {
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  TrendingDown,
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

import {
  useAQIHistory,
} from "../hooks/useAQIHistory";

import {
  useAppContext,
} from "../context/AppContext";


function History() {
  const {
    selectedZone,
  } = useAppContext();


  const [
    range,
    setRange,
  ] = useState(
    "TODAY"
  );


  const hours =
    range === "TODAY"
      ? 24
      : range === "7D"
      ? 168
      : 720;


  const {
    data,
    loading,
    error,
  } = useAQIHistory(
    selectedZone,
    hours
  );


  const readings =
    useMemo(() => {
      const rawReadings =
        Array.isArray(
          data?.readings
        )
          ? data.readings
          : [];


      return rawReadings
        .filter(
          (reading) =>
            reading &&
            reading.timestamp
        )
        .map(
          (
            reading,
            index
          ) => {
            const date =
              new Date(
                reading.timestamp
              );


            const validDate =
              !Number.isNaN(
                date.getTime()
              );


            let displayTime =
              reading.timestamp;


            if (validDate) {
              if (
                range ===
                "TODAY"
              ) {
                displayTime =
                  date.toLocaleTimeString(
                    [],
                    {
                      hour:
                        "2-digit",

                      minute:
                        "2-digit",
                    }
                  );
              } else {
                displayTime =
                  date.toLocaleString(
                    [],
                    {
                      month:
                        "short",

                      day:
                        "2-digit",

                      hour:
                        "2-digit",

                      minute:
                        "2-digit",
                    }
                  );
              }
            }


            return {
              id:
                `${reading.timestamp}-${index}`,

              timestamp:
                reading.timestamp,

              time:
                displayTime,

              aqi:
                Number(
                  reading.aqi ??
                    0
                ),

              pm25:
                Number(
                  reading.pm25 ??
                    0
                ),

              pm10:
                Number(
                  reading.pm10 ??
                    0
                ),

              category:
                reading.category ||
                "UNKNOWN",
            };
          }
        );
    }, [
      data,
      range,
    ]);


  const averageAQI =
    useMemo(() => {
      if (
        readings.length ===
        0
      ) {
        return 0;
      }

      const total =
        readings.reduce(
          (
            sum,
            reading
          ) =>
            sum +
            reading.aqi,
          0
        );

      return Math.round(
        total /
          readings.length
      );
    }, [
      readings,
    ]);


  const peakAQI =
    useMemo(() => {
      if (
        readings.length ===
        0
      ) {
        return 0;
      }

      return Math.max(
        ...readings.map(
          (reading) =>
            reading.aqi
        )
      );
    }, [
      readings,
    ]);


  const pm25Peak =
    useMemo(() => {
      if (
        readings.length ===
        0
      ) {
        return 0;
      }

      return Math.max(
        ...readings.map(
          (reading) =>
            reading.pm25
        )
      );
    }, [
      readings,
    ]);


  const trend =
    useMemo(() => {
      if (
        readings.length <
        2
      ) {
        return 0;
      }


      const first =
        readings[0].aqi;

      const latest =
        readings[
          readings.length -
            1
        ].aqi;


      return Math.round(
        (
          (
            latest -
            first
          ) /
          Math.max(
            first,
            1
          )
        ) *
          100
      );
    }, [
      readings,
    ]);


  /*
   * Chart simplification:
   *
   * Today -> all hourly points.
   * 7 days -> roughly every 3 hours.
   * 30 days -> roughly every 12 hours.
   *
   * Full data still appears in
   * Historical Readings table.
   */
  const chartReadings =
    useMemo(() => {
      if (
        range === "TODAY"
      ) {
        return readings;
      }


      const step =
        range === "7D"
          ? 3
          : 12;


      return readings.filter(
        (
          _reading,
          index
        ) =>
          index % step ===
            0 ||
          index ===
            readings.length -
              1
      );
    }, [
      readings,
      range,
    ]);


  const TrendIcon =
    trend >= 0
      ? TrendingUp
      : TrendingDown;


  const rangeLabel =
    range === "TODAY"
      ? "TODAY"
      : range === "7D"
      ? "7 DAYS"
      : "30 DAYS";


  if (loading) {
    return (
      <div className="history-page-state">
        <p>
          Loading AQI history...
        </p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="history-page-state">
        <p>
          History unavailable:
          {" "}
          {error}
        </p>
      </div>
    );
  }


  return (
    <div>
      <div className="dashboard-header history-v3-header">
        <div>
          <p className="eyebrow">
            HISTORICAL ENVIRONMENT
            DATA
          </p>

          <h1>
            AQI
            <span className="dashboard-title-accent">
              {" "}
              History
            </span>
          </h1>

          <p>
            Analyze pollution trends
            over time and identify
            periods of elevated
            environmental risk.
          </p>
        </div>


        <div className="history-range-control">
          <CalendarDays
            size={15}
          />

          <select
            value={range}
            onChange={(
              event
            ) =>
              setRange(
                event.target.value
              )
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


      <div id="history-overview" className="history-summary-grid" style={{ scrollMarginTop: "110px" }}>
        <section className="card history-summary-card">
          <span>
            Average AQI
          </span>

          <strong>
            {averageAQI}
          </strong>

          <small>
            Selected period
          </small>
        </section>


        <section className="card history-summary-card">
          <span>
            Peak AQI
          </span>

          <strong>
            {peakAQI}
          </strong>

          <small>
            Highest recorded
          </small>
        </section>


        <section className="card history-summary-card">
          <span>
            PM2.5 Peak
          </span>

          <strong>
            {pm25Peak.toFixed(
              1
            )}
          </strong>

          <small>
            Âµg/mÂ³
          </small>
        </section>


        <section className="card history-summary-card">
          <span>
            Trend
          </span>

          <strong
            className={
              trend >= 0
                ? "history-trend trend-up"
                : "history-trend trend-down"
            }
          >
            <TrendIcon
              size={20}
            />

            {trend >= 0
              ? "+"
              : ""}

            {trend}%
          </strong>

          <small>
            First vs latest
            reading
          </small>
        </section>
      </div>


      <section id="history-aqi-trend" className="card history-area-card" style={{ scrollMarginTop: "110px" }}>
        <div className="card-header">
          <div>
            <span className="card-kicker">
              TIME SERIES
            </span>

            <h2>
              AQI Trend
            </h2>
          </div>


          <span className="model-pill">
            {rangeLabel}
          </span>
        </div>


        {readings.length ===
        0 ? (
          <div
            style={{
              minHeight:
                "360px",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              color:
                "#849d96",
            }}
          >
            No historical
            readings available.
          </div>
        ) : (
          <div className="history-area-wrap">
            <ResponsiveContainer
              width="100%"
              height={360}
            >
              <AreaChart
                data={
                  chartReadings
                }
              >
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
                      stopOpacity={
                        0.38
                      }
                    />

                    <stop
                      offset="95%"
                      stopColor="#39e6b1"
                      stopOpacity={
                        0
                      }
                    />
                  </linearGradient>
                </defs>


                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  vertical={
                    false
                  }
                />


                <XAxis
                  dataKey="time"
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  minTickGap={
                    28
                  }
                  tick={{
                    fill:
                      "#849d96",

                    fontSize:
                      11,
                  }}
                />


                <YAxis
                  axisLine={
                    false
                  }
                  tickLine={
                    false
                  }
                  domain={[
                    0,
                    "auto",
                  ]}
                  tick={{
                    fill:
                      "#849d96",

                    fontSize:
                      11,
                  }}
                />


                <Tooltip
                  contentStyle={{
                    background:
                      "#0d1c1a",

                    border:
                      "1px solid rgba(212,241,232,0.08)",

                    borderRadius:
                      "12px",

                    color:
                      "#ecf5f1",
                  }}
                  labelStyle={{
                    color:
                      "#62dce8",
                  }}
                />


                <Area
                  type="monotone"
                  dataKey="aqi"
                  stroke="#39e6b1"
                  strokeWidth={
                    3
                  }
                  fill="url(#historyArea)"
                  dot={
                    range ===
                    "TODAY"
                      ? {
                          r: 3,
                          fill:
                            "#39e6b1",
                          strokeWidth:
                            0,
                        }
                      : false
                  }
                  activeDot={{
                    r: 6,
                    fill:
                      "#62dce8",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>


      <section id="history-readings" className="card history-table-card" style={{ scrollMarginTop: "110px" }}>
        <div className="card-header">
          <div>
            <span className="card-kicker">
              MEASUREMENTS
            </span>

            <h2>
              Historical Readings
            </h2>
          </div>

          <span className="model-pill">
            {readings.length}
            {" "}
            READINGS
          </span>
        </div>


        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>
                  Time
                </th>

                <th>
                  AQI
                </th>

                <th>
                  PM2.5
                </th>

                <th>
                  PM10
                </th>

                <th>
                  Category
                </th>
              </tr>
            </thead>


            <tbody>
              {[...readings]
                .reverse()
                .map(
                  (
                    reading
                  ) => (
                    <tr
                      key={
                        reading.id
                      }
                    >
                      <td>
                        {
                          reading.time
                        }
                      </td>

                      <td>
                        {
                          reading.aqi
                        }
                      </td>

                      <td>
                        {
                          reading.pm25
                        }
                      </td>

                      <td>
                        {
                          reading.pm10
                        }
                      </td>

                      <td>
                        {
                          reading.category
                        }
                      </td>
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
