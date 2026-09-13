import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BarChart3,
  Check,
  ChevronDown,
  Search,
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


const METRICS = [
  {
    value: "aqi",
    label: "AQI",
  },
  {
    value: "pm25",
    label: "PM2.5",
  },
  {
    value: "pm10",
    label: "PM10",
  },
];


function ZoneDropdown({
  value,
  zones,
  onChange,
  placeholder,
  disabledZoneId,
}) {
  const [open, setOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const dropdownRef =
    useRef(null);


  const selectedZone =
    zones.find(
      (zone) =>
        zone.zone_id === value
    );


  const filteredZones =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return zones;
      }

      return zones.filter(
        (zone) => {
          const zoneName =
            String(
              zone.name ||
                zone.zone_name ||
                ""
            ).toLowerCase();

          const zoneId =
            String(
              zone.zone_id ||
                ""
            ).toLowerCase();

          const state =
            String(
              zone.state ||
                ""
            ).toLowerCase();

          return (
            zoneName.includes(
              query
            ) ||
            zoneId.includes(
              query
            ) ||
            state.includes(
              query
            )
          );
        }
      );
    }, [
      zones,
      search,
    ]);


  useEffect(() => {
    function handleClickOutside(
      event
    ) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  function handleSelect(
    zoneId
  ) {
    if (
      zoneId ===
      disabledZoneId
    ) {
      return;
    }

    onChange(zoneId);

    setOpen(false);
    setSearch("");
  }


  return (
    <div
      className="compare-zone-selector"
      ref={dropdownRef}
    >
      <button
        type="button"
        className={
          open
            ? "compare-zone-selector-button active"
            : "compare-zone-selector-button"
        }
        onClick={() => {
          setOpen(
            (current) =>
              !current
          );

          if (open) {
            setSearch("");
          }
        }}
      >
        <div>
          <span className="compare-selector-small">
            SELECT ZONE
          </span>

          <strong>
            {selectedZone
              ? selectedZone.name ||
                selectedZone.zone_name ||
                selectedZone.zone_id
              : placeholder}
          </strong>
        </div>

        <ChevronDown
          size={19}
          className={
            open
              ? "compare-selector-chevron open"
              : "compare-selector-chevron"
          }
        />
      </button>


      {open && (
        <div className="compare-zone-dropdown-menu">
          <div className="compare-zone-search">
            <Search
              size={16}
            />

            <input
              type="text"
              value={search}
              placeholder="Search city or state..."
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              autoFocus
            />
          </div>


          <div className="compare-zone-option-list">
            {filteredZones.length >
            0 ? (
              filteredZones.map(
                (zone) => {
                  const zoneName =
                    zone.name ||
                    zone.zone_name ||
                    zone.zone_id;

                  const selected =
                    zone.zone_id ===
                    value;

                  const disabled =
                    zone.zone_id ===
                    disabledZoneId;

                  return (
                    <button
                      type="button"
                      key={
                        zone.zone_id
                      }
                      disabled={
                        disabled
                      }
                      className={[
                        "compare-zone-dropdown-option",
                        selected
                          ? "selected"
                          : "",
                        disabled
                          ? "disabled"
                          : "",
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          " "
                        )}
                      onClick={() =>
                        handleSelect(
                          zone.zone_id
                        )
                      }
                    >
                      <div>
                        <strong>
                          {zoneName}
                        </strong>

                        <span>
                          AQI{" "}
                          {zone.aqi ??
                            "N/A"}

                          {zone.state
                            ? ` • ${zone.state}`
                            : ""}
                        </span>
                      </div>

                      {selected && (
                        <Check
                          size={16}
                        />
                      )}
                    </button>
                  );
                }
              )
            ) : (
              <div className="compare-zone-no-result">
                No zone found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function CompareZones() {
  const {
    zones,
    loading,
    error,
  } = useZones();


  const [
    leftZoneId,
    setLeftZoneId,
  ] = useState("");

  const [
    rightZoneId,
    setRightZoneId,
  ] = useState("");

  const [
    selectedMetric,
    setSelectedMetric,
  ] = useState("aqi");

  const [
    metricOpen,
    setMetricOpen,
  ] = useState(false);

  const metricRef =
    useRef(null);


  useEffect(() => {
    if (
      zones.length > 0 &&
      !leftZoneId
    ) {
      setLeftZoneId(
        zones[0].zone_id
      );
    }

    if (
      zones.length > 1 &&
      !rightZoneId
    ) {
      setRightZoneId(
        zones[1].zone_id
      );
    }
  }, [
    zones,
    leftZoneId,
    rightZoneId,
  ]);


  useEffect(() => {
    function handleOutsideClick(
      event
    ) {
      if (
        metricRef.current &&
        !metricRef.current.contains(
          event.target
        )
      ) {
        setMetricOpen(
          false
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


  const leftZone =
    zones.find(
      (zone) =>
        zone.zone_id ===
        leftZoneId
    );

  const rightZone =
    zones.find(
      (zone) =>
        zone.zone_id ===
        rightZoneId
    );


  const selectedMetricLabel =
    METRICS.find(
      (metric) =>
        metric.value ===
        selectedMetric
    )?.label || "AQI";


  const chartData =
    useMemo(() => {
      if (
        !leftZone ||
        !rightZone
      ) {
        return [];
      }

      const getMetricValue =
        (zone) => {
          if (
            selectedMetric ===
            "aqi"
          ) {
            return (
              zone.aqi ?? 0
            );
          }

          if (
            selectedMetric ===
            "pm25"
          ) {
            return (
              zone.pm25 ?? 0
            );
          }

          return (
            zone.pm10 ?? 0
          );
        };

      return [
        {
          name:
            leftZone.name ||
            leftZone.zone_name ||
            leftZone.zone_id,

          value:
            getMetricValue(
              leftZone
            ),
        },

        {
          name:
            rightZone.name ||
            rightZone.zone_name ||
            rightZone.zone_id,

          value:
            getMetricValue(
              rightZone
            ),
        },
      ];
    }, [
      leftZone,
      rightZone,
      selectedMetric,
    ]);


  function metricDifference(
    key
  ) {
    const leftValue =
      Number(
        leftZone?.[key] ??
          0
      );

    const rightValue =
      Number(
        rightZone?.[key] ??
          0
      );

    return Math.abs(
      leftValue -
        rightValue
    ).toFixed(1);
  }


  function getBetterZone(
    key
  ) {
    const leftValue =
      Number(
        leftZone?.[key] ??
          0
      );

    const rightValue =
      Number(
        rightZone?.[key] ??
          0
      );

    if (
      leftValue ===
      rightValue
    ) {
      return "Equal";
    }

    const better =
      leftValue <
      rightValue
        ? leftZone
        : rightZone;

    return (
      better?.name ||
      better?.zone_name ||
      better?.zone_id
    );
  }


  if (loading) {
    return (
      <div className="compare-page-state">
        Loading zones...
      </div>
    );
  }


  if (error) {
    return (
      <div className="compare-page-state compare-page-error">
        Unable to load zones:
        {" "}
        {error}
      </div>
    );
  }


  return (
    <div className="compare-two-page">
      <div className="dashboard-header compare-v3-header">
        <div>
          <p className="eyebrow">
            REGIONAL ENVIRONMENT
            ANALYTICS
          </p>

          <h1>
            Compare
            <span className="dashboard-title-accent">
              {" "}
              Zones
            </span>
          </h1>

          <p>
            Select two monitored
            zones and compare their
            air quality side by side.
          </p>
        </div>


        <div
          className="compare-metric-control"
          ref={metricRef}
        >
          <span className="compare-metric-label">
            METRIC
          </span>

          <button
            type="button"
            className="compare-metric-button"
            onClick={() =>
              setMetricOpen(
                (current) =>
                  !current
              )
            }
          >
            <span>
              {selectedMetricLabel}
            </span>

            <ChevronDown
              size={18}
              className={
                metricOpen
                  ? "compare-metric-chevron open"
                  : "compare-metric-chevron"
              }
            />
          </button>


          {metricOpen && (
            <div className="compare-metric-menu">
              {METRICS.map(
                (metric) => (
                  <button
                    key={
                      metric.value
                    }
                    type="button"
                    className={
                      selectedMetric ===
                      metric.value
                        ? "compare-metric-option selected"
                        : "compare-metric-option"
                    }
                    onClick={() => {
                      setSelectedMetric(
                        metric.value
                      );

                      setMetricOpen(
                        false
                      );
                    }}
                  >
                    <span>
                      {
                        metric.label
                      }
                    </span>

                    {selectedMetric ===
                      metric.value && (
                      <Check
                        size={16}
                      />
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>


      <section className="compare-zone-picker-card">
        <ZoneDropdown
          value={leftZoneId}
          zones={zones}
          onChange={
            setLeftZoneId
          }
          disabledZoneId={
            rightZoneId
          }
          placeholder="Select first zone"
        />

        <div className="compare-vs-circle">
          VS
        </div>

        <ZoneDropdown
          value={rightZoneId}
          zones={zones}
          onChange={
            setRightZoneId
          }
          disabledZoneId={
            leftZoneId
          }
          placeholder="Select second zone"
        />
      </section>


      {leftZone &&
        rightZone && (
          <>
            <div className="compare-selected-grid">
              <ZoneComparisonCard
                zone={leftZone}
                side="ZONE A"
              />

              <ZoneComparisonCard
                zone={rightZone}
                side="ZONE B"
              />
            </div>


            <section className="card compare-direct-card">
              <div className="card-header">
                <div>
                  <span className="card-kicker">
                    DIRECT COMPARISON
                  </span>

                  <h2>
                    Environmental
                    Difference
                  </h2>
                </div>
              </div>


              <div className="compare-direct-grid">
                <ComparisonMetric
                  title="AQI"
                  left={
                    leftZone.aqi ??
                    0
                  }
                  right={
                    rightZone.aqi ??
                    0
                  }
                  difference={
                    metricDifference(
                      "aqi"
                    )
                  }
                  better={
                    getBetterZone(
                      "aqi"
                    )
                  }
                />

                <ComparisonMetric
                  title="PM2.5"
                  left={
                    leftZone.pm25 ??
                    0
                  }
                  right={
                    rightZone.pm25 ??
                    0
                  }
                  difference={
                    metricDifference(
                      "pm25"
                    )
                  }
                  better={
                    getBetterZone(
                      "pm25"
                    )
                  }
                />

                <ComparisonMetric
                  title="PM10"
                  left={
                    leftZone.pm10 ??
                    0
                  }
                  right={
                    rightZone.pm10 ??
                    0
                  }
                  difference={
                    metricDifference(
                      "pm10"
                    )
                  }
                  better={
                    getBetterZone(
                      "pm10"
                    )
                  }
                />
              </div>
            </section>


            <section className="card compare-chart-card">
              <div className="card-header">
                <div>
                  <span className="card-kicker">
                    VISUAL COMPARISON
                  </span>

                  <h2>
                    {
                      selectedMetricLabel
                    }
                    {" "}
                    Comparison
                  </h2>
                </div>

                <BarChart3
                  size={19}
                />
              </div>


              <div className="compare-chart-wrap">
                <ResponsiveContainer
                  width="100%"
                  height={330}
                >
                  <BarChart
                    data={
                      chartData
                    }
                  >
                    <CartesianGrid
                      stroke="rgba(255,255,255,0.05)"
                      vertical={
                        false
                      }
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={
                        false
                      }
                      tickLine={
                        false
                      }
                      tick={{
                        fill:
                          "#849d96",
                        fontSize:
                          12,
                      }}
                    />

                    <YAxis
                      axisLine={
                        false
                      }
                      tickLine={
                        false
                      }
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
                    />

                    <Bar
                      dataKey="value"
                      fill="#62dce8"
                      radius={[
                        8,
                        8,
                        2,
                        2,
                      ]}
                      maxBarSize={
                        160
                      }
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
    </div>
  );
}


function ZoneComparisonCard({
  zone,
  side,
}) {
  const trend =
    zone.trend ?? 0;

  const TrendIcon =
    trend >= 0
      ? TrendingUp
      : TrendingDown;

  const riskLevel =
    zone.risk_level ||
    "UNKNOWN";

  return (
    <section className="card compare-selected-card">
      <div className="compare-selected-card-head">
        <div>
          <span className="card-kicker">
            {side}
          </span>

          <h2>
            {zone.name ||
              zone.zone_name ||
              zone.zone_id}
          </h2>

          <span className="compare-selected-id">
            {zone.zone_id}
          </span>
        </div>

        <span
          className={`severity-pill severity-${riskLevel.toLowerCase()}`}
        >
          {riskLevel}
        </span>
      </div>


      <div className="compare-selected-aqi">
        <span>
          CURRENT AQI
        </span>

        <strong>
          {zone.aqi ?? 0}
        </strong>
      </div>


      <div className="compare-selected-stats">
        <div>
          <span>
            PM2.5
          </span>

          <strong>
            {zone.pm25 ?? 0}
          </strong>
        </div>

        <div>
          <span>
            PM10
          </span>

          <strong>
            {zone.pm10 ?? 0}
          </strong>
        </div>

        <div>
          <span>
            Trend
          </span>

          <strong
            className={
              trend >= 0
                ? "trend-up"
                : "trend-down"
            }
          >
            <TrendIcon
              size={15}
            />

            {Math.abs(
              trend
            )}
            %
          </strong>
        </div>
      </div>
    </section>
  );
}


function ComparisonMetric({
  title,
  left,
  right,
  difference,
  better,
}) {
  return (
    <div className="compare-direct-item">
      <span className="compare-direct-title">
        {title}
      </span>

      <div className="compare-direct-values">
        <strong>
          {left}
        </strong>

        <span>
          VS
        </span>

        <strong>
          {right}
        </strong>
      </div>

      <div className="compare-direct-result">
        Difference:
        {" "}
        <strong>
          {difference}
        </strong>
      </div>

      <div className="compare-direct-better">
        Lower level:
        {" "}
        <strong>
          {better}
        </strong>
      </div>
    </div>
  );
}


export default CompareZones;