function RiskClusters({
  zones = [],
  clusters = [],
}) {
  const sourceData =
    zones.length > 0
      ? zones
      : clusters;


  // Remove duplicate cities.
  // Example:
  // Chandigarh may exist for Punjab,
  // Haryana and Chandigarh UT.
  const uniqueCities = Array.from(
    sourceData.reduce(
      (map, zone) => {
        if (
          !zone ||
          zone.aqi === null ||
          zone.aqi === undefined
        ) {
          return map;
        }

        const name =
          zone.name ||
          zone.zone_name ||
          zone.cluster_id ||
          zone.zone_id ||
          "Unknown";

        const key =
          name
            .trim()
            .toLowerCase();

        const existing =
          map.get(key);

        if (
          !existing ||
          Number(zone.aqi ?? 0) >
            Number(existing.aqi ?? 0)
        ) {
          map.set(
            key,
            {
              ...zone,
              displayName: name,
            }
          );
        }

        return map;
      },
      new Map()
    ).values()
  );


  const topZones =
    uniqueCities
      .sort(
        (a, b) =>
          Number(b.aqi ?? 0) -
          Number(a.aqi ?? 0)
      )
      .slice(0, 5);


  function getRisk(zone) {
    return (
      zone.category ||
      zone.risk_level ||
      zone.risk ||
      "UNKNOWN"
    );
  }


  if (topZones.length === 0) {
    return (
      <section className="card">
        <h2>
          Risk Clusters
        </h2>

        <p
          style={{
            marginTop: "18px",
            color: "#8ba8a1",
          }}
        >
          No live risk data available.
        </p>
      </section>
    );
  }


  return (
    <section
      className="card"
      style={{
        height: "fit-content",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div>
          <span
            style={{
              color: "#54e6df",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.5px",
            }}
          >
            LIVE RISK RANKING
          </span>

          <h2
            style={{
              marginTop: "5px",
            }}
          >
            Risk Clusters
          </h2>
        </div>

        <span
          style={{
            padding: "6px 10px",
            borderRadius: "20px",
            background:
              "rgba(45,212,191,0.08)",
            border:
              "1px solid rgba(45,212,191,0.18)",
            color: "#6ee7d8",
            fontSize: "11px",
          }}
        >
          Top 5
        </span>
      </div>


      <div
        style={{
          display: "grid",
          gap: "10px",
        }}
      >
        {topZones.map(
          (zone, index) => {
            const aqi =
              Number(zone.aqi) || 0;

            const risk =
              getRisk(zone);

            return (
              <div
                key={`${zone.displayName}-${index}`}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "38px 1fr auto",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background:
                    "rgba(255,255,255,0.025)",
                  border:
                    "1px solid rgba(255,255,255,0.055)",
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    display: "grid",
                    placeItems: "center",
                    background:
                      "rgba(45,212,191,.1)",
                    color: "#5eead4",
                    fontWeight: 800,
                  }}
                >
                  {index + 1}
                </div>


                <div>
                  <strong
                    style={{
                      display: "block",
                      color: "#d9ebe7",
                      fontSize: "15px",
                    }}
                  >
                    {zone.displayName}
                  </strong>

                  <span
                    style={{
                      color: "#7f9f98",
                      fontSize: "12px",
                    }}
                  >
                    {risk.replaceAll(
                      "_",
                      " "
                    )}
                  </span>
                </div>


                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: "20px",
                      color: "#ffffff",
                    }}
                  >
                    {Math.round(aqi)}
                  </strong>

                  <span
                    style={{
                      fontSize: "10px",
                      color: "#7f9f98",
                    }}
                  >
                    AQI
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>


      <p
        style={{
          marginTop: "15px",
          marginBottom: 0,
          color: "#66867f",
          fontSize: "11px",
        }}
      >
        Showing highest live AQI
        locations across the monitoring
        network.
      </p>
    </section>
  );
}


export default RiskClusters;