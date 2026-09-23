import {
  useEffect,
} from "react";

import {
  useLocation,
} from "react-router-dom";

import AQICard from "../components/dashboard/AQICard";
import PM25Card from "../components/dashboard/PM25Card";
import HealthAdvisory from "../components/dashboard/HealthAdvisory";
import WeatherContext from "../components/dashboard/WeatherContext";
import ForecastRiskCard from "../components/dashboard/ForecastRiskCard";
import RiskTrajectory from "../components/dashboard/RiskTrajectory";
import PollutionMap from "../components/dashboard/PollutionMap";
import HotspotCard from "../components/dashboard/HotspotCard";
import RiskClusters from "../components/dashboard/RiskClusters";
import SourceAttribution from "../components/dashboard/SourceAttribution";
import ForecastExplanation from "../components/ai/ForecastExplanation";
import AIDiagnosis from "../components/dashboard/AIDiagnosis";
import AIAnalysis from "../components/ai/AIAnalysis";
import AIChat from "../components/ai/AIChat";
import SatelliteIntelligence from "../components/satellite/SatelliteIntelligence";

import {
  useAQI,
} from "../hooks/useAQI";

import {
  useForecast,
} from "../hooks/useForecast";

import {
  useHotspots,
} from "../hooks/useHotspots";

import {
  useZones,
} from "../hooks/useZones";

import {
  useAppContext,
} from "../context/AppContext";


const SECTION_STYLE = {
  marginTop:
    "30px",

  padding:
    "20px",

  borderRadius:
    "22px",

  border:
    "1px solid rgba(94,234,212,.10)",

  background:
    "linear-gradient(180deg, rgba(45,212,191,.025), rgba(4,18,15,.14))",

  scrollMarginTop:
    "105px",
};


const SECTION_HEADER_STYLE = {
  display:
    "flex",

  justifyContent:
    "space-between",

  alignItems:
    "flex-end",

  gap:
    "16px",

  marginBottom:
    "20px",

  paddingBottom:
    "16px",

  borderBottom:
    "1px solid rgba(94,234,212,.09)",
};


function SectionHeader({
  kicker,
  title,
  description,
  number,
}) {
  return (
    <div
      style={
        SECTION_HEADER_STYLE
      }
    >

      <div>
        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              "9px",

            marginBottom:
              "6px",
          }}
        >

          <span
            style={{
              color:
                "#5eead4",

              fontSize:
                "10px",

              fontWeight:
                800,

              letterSpacing:
                "1.4px",

              textTransform:
                "uppercase",
            }}
          >
            {kicker}
          </span>

        </div>


        <h2
          style={{
            margin:
              0,

            fontSize:
              "21px",
          }}
        >
          {title}
        </h2>


        <p
          style={{
            margin:
              "6px 0 0",

            color:
              "#78958e",

            fontSize:
              "13px",

            lineHeight:
              1.5,
          }}
        >
          {description}
        </p>
      </div>


      <div
        style={{
          minWidth:
            "38px",

          height:
            "38px",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          borderRadius:
            "10px",

          border:
            "1px solid rgba(45,212,191,.15)",

          background:
            "rgba(45,212,191,.055)",

          color:
            "#5eead4",

          fontSize:
            "12px",

          fontWeight:
            800,
        }}
      >
        {number}
      </div>

    </div>
  );
}


function getDiagnosis(
  aqiData
) {
  if (!aqiData) {
    return {
      summary:
        "Waiting for current air-quality data.",

      factors:
        [],
    };
  }


  const factors = [];


  if (
    Number(
      aqiData.pm25
    ) >= 35
  ) {
    factors.push(
      "Elevated PM2.5 concentration"
    );
  }


  if (
    Number(
      aqiData.pm10
    ) >= 50
  ) {
    factors.push(
      "Elevated PM10 concentration"
    );
  }


  if (
    Number(
      aqiData.no2
    ) >= 40
  ) {
    factors.push(
      "Elevated NO2 concentration"
    );
  }


  if (
    Number(
      aqiData.wind_speed
    ) > 0 &&
    Number(
      aqiData.wind_speed
    ) < 5
  ) {
    factors.push(
      "Low wind dispersion"
    );
  }


  if (
    factors.length === 0
  ) {
    factors.push(
      "No major pollutant spike detected in current data"
    );
  }


  return {
    summary:
      `Current AQI is ${aqiData.aqi} (${aqiData.category}). ` +
      "Assessment is based on the latest available live air-quality " +
      "and weather measurements.",

    factors,
  };
}


function Dashboard() {
  const location =
    useLocation();


  const {
    selectedZone,
    setSelectedZone,
  } = useAppContext();


  // -------------------------------------------------------
  // SELECTED ZONE
  // -------------------------------------------------------

  const {
    data: apiAQI,
    loading,
    error,
  } = useAQI(
    selectedZone
  );


  // -------------------------------------------------------
  // ALL LIVE ZONES
  // -------------------------------------------------------

  const {
    zones: allZones,
    loading: zonesLoading,
    error: zonesError,
  } = useZones();


  const liveZones = (
    allZones || []
  ).filter(
    (zone) =>
      zone.live &&
      zone.aqi !== null &&
      zone.aqi !== undefined
  );


  // -------------------------------------------------------
  // FORECAST
  // -------------------------------------------------------

  const {
    data: forecastData,
    loading: forecastLoading,
    error: forecastError,
  } = useForecast(
    selectedZone,
    24
  );


  // -------------------------------------------------------
  // HOTSPOTS
  // -------------------------------------------------------

  const {
    hotspots,
  } = useHotspots(
    selectedZone
  );


  const currentAQI =
    apiAQI ||
    null;


  const hasLiveData =
    Boolean(
      currentAQI
    );


  const forecast =
    forecastData?.forecast ||
    [];


  const latestForecast =
    forecast.length > 0
      ? forecast[0]
      : null;


  // -------------------------------------------------------
  // HASH / SUBMENU SCROLL
  // -------------------------------------------------------

  useEffect(() => {
    if (
      !location.hash ||
      !hasLiveData
    ) {
      return;
    }


    const sectionId =
      location.hash.replace(
        "#",
        ""
      );


    const timer =
      window.setTimeout(
        () => {
          const target =
            document.getElementById(
              sectionId
            );


          target?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "start",
          });
        },
        150
      );


    return () =>
      window.clearTimeout(
        timer
      );

  }, [
    location.hash,
    hasLiveData,
  ]);


  // -------------------------------------------------------
  // PRIMARY HOTSPOT
  // -------------------------------------------------------

  const primaryHotspot =
    liveZones.length > 0
      ? [...liveZones]
          .filter(
            (zone) =>
              zone.aqi !==
                null &&
              zone.aqi !==
                undefined
          )
          .sort(
            (
              a,
              b
            ) =>
              Number(
                b.aqi ?? 0
              ) -
              Number(
                a.aqi ?? 0
              )
          )[0] ??
        null
      : null;


  const liveTimestamp =
    currentAQI
      ?.air_quality_timestamp ??
    currentAQI
      ?.weather_timestamp ??
    currentAQI
      ?.timestamp ??
    null;


  const formattedTime =
    liveTimestamp
      ? new Date(
          liveTimestamp
        ).toLocaleTimeString(
          [],
          {
            hour:
              "2-digit",

            minute:
              "2-digit",
          }
        )
      : loading
      ? "SYNCING..."
      : "--";


  const diagnosis =
    getDiagnosis(
      currentAQI
    );


  return (
    <div>

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="dashboard-header dashboard-v2-header">

        <div>
          <p className="eyebrow">
            REAL-TIME ENVIRONMENT INTELLIGENCE
          </p>


          <h1>
            {currentAQI
              ?.zone_name ||
              "Air Quality"}

            <span className="dashboard-title-accent">
              {" "}
              Air Quality
            </span>
          </h1>


          <p>
            Live pollution monitoring,
            predictive AQI intelligence,
            hotspot detection and
            AI-assisted environmental
            analysis.
          </p>
        </div>


        <div className="dashboard-header-actions">

          <div
            className={
              hasLiveData
                ? "data-status live"
                : error
                ? "data-status demo"
                : "data-status live"
            }
          >
            <span className="status-dot" />

            {loading &&
            !hasLiveData
              ? "SYNCING"
              : hasLiveData
              ? "LIVE DATA"
              : error
              ? "LIVE DATA UNAVAILABLE"
              : "CONNECTING"}
          </div>


          <div className="dashboard-time">
            <span>
              LAST UPDATED
            </span>

            <strong>
              {formattedTime}
            </strong>
          </div>

        </div>
      </div>


      {!hasLiveData &&
        loading && (
          <div className="card">
            Loading current
            air-quality data...
          </div>
        )}


      {!hasLiveData &&
        error && (
          <div className="card">
            Live AQI unavailable:
            {" "}
            {error}
          </div>
        )}


      {hasLiveData && (
        <>

          {/* ================================================= */}
          {/* 01 LIVE MONITORING */}
          {/* ================================================= */}

          <section
            id="live-monitoring"
            style={
              SECTION_STYLE
            }
          >

            <SectionHeader
              number="01"
              kicker="LIVE ENVIRONMENT DATA"
              title="Live Monitoring"
              description={
                "Current AQI, particulate matter, weather conditions and geographical pollution monitoring."
              }
            />


            <div className="dashboard-stat-row">

              <AQICard
                aqi={
                  currentAQI.aqi
                }
                category={
                  currentAQI.category
                }
                timestamp={
                  liveTimestamp
                }
              />


              <PM25Card
                pm25={
                  currentAQI.pm25
                }
                pm10={
                  currentAQI.pm10
                }
              />


              <WeatherContext
                temperature={
                  currentAQI.temperature
                }
                humidity={
                  currentAQI.humidity
                }
                windSpeed={
                  currentAQI.wind_speed
                }
              />


              <ForecastRiskCard
                predictedAQI={
                  latestForecast
                    ?.predicted_aqi ??
                  0
                }
                riskLevel={
                  latestForecast
                    ?.risk_level ??
                  "UNKNOWN"
                }
                timestamp={
                  latestForecast
                    ?.timestamp ??
                  null
                }
              />

            </div>


            {zonesLoading && (
              <p>
                Loading live zone
                network...
              </p>
            )}


            {zonesError && (
              <p>
                Zone network unavailable:
                {" "}
                {zonesError}
              </p>
            )}


            <div
              style={{
                marginTop:
                  "18px",
              }}
            >
              <PollutionMap
                zones={
                  liveZones
                }
                hotspots={
                  hotspots
                }
                selectedZoneId={
                  selectedZone
                }
                onZoneSelect={
                  setSelectedZone
                }
              />
            </div>

          </section>


          {/* ================================================= */}
          {/* 02 FORECAST & RISK */}
          {/* ================================================= */}

          <section
            id="forecast-risk"
            style={
              SECTION_STYLE
            }
          >

            <SectionHeader
              number="02"
              kicker="PREDICTIVE ENVIRONMENT INTELLIGENCE"
              title="Forecast & Risk"
              description={
                "AQI trajectory, health risk, hotspot activity, source attribution and predictive explanation."
              }
            />


            {forecastLoading && (
              <p>
                Loading forecast...
              </p>
            )}


            {forecastError && (
              <p>
                Forecast unavailable:
                {" "}
                {forecastError}
              </p>
            )}


            <div className="dashboard-main-grid">

              <div className="dashboard-main-column">

                <RiskTrajectory
                  forecast={
                    forecast
                  }
                />


                <div className="dashboard-two-column">

                  {primaryHotspot ? (
                    <HotspotCard
                      hotspotId={
                        primaryHotspot
                          .name ||
                        primaryHotspot
                          .zone_id
                      }

                      latitude={
                        primaryHotspot
                          .latitude
                      }

                      longitude={
                        primaryHotspot
                          .longitude
                      }

                      severity={
                        primaryHotspot
                          .category ??
                        primaryHotspot
                          .risk_level ??
                        "UNKNOWN"
                      }

                      aqi={
                        primaryHotspot
                          .aqi
                      }

                      pollutants={[
                        `PM2.5: ${
                          primaryHotspot
                            .pm25 ??
                          "--"
                        }`,

                        `PM10: ${
                          primaryHotspot
                            .pm10 ??
                          "--"
                        }`,

                        `NO2: ${
                          primaryHotspot
                            .no2 ??
                          "--"
                        }`,

                        `SO2: ${
                          primaryHotspot
                            .so2 ??
                          "--"
                        }`,
                      ]}
                    />
                  ) : (
                    <div className="card">
                      No live hotspot data available.
                    </div>
                  )}


                  <RiskClusters
                    clusters={
                      liveZones.map(
                        (
                          zone
                        ) => ({
                          cluster_id:
                            zone.zone_id,

                          name:
                            zone.name,

                          state:
                            zone.state,

                          risk_level:
                            zone.category ??
                            zone.risk_level ??
                            "UNKNOWN",

                          aqi:
                            zone.aqi,
                        })
                      )
                    }
                  />

                </div>

              </div>


              <div className="dashboard-side-column">

                <HealthAdvisory
                  category={
                    currentAQI.category
                  }
                />


                <SourceAttribution
                  zoneId={
                    selectedZone
                  }
                  aqiData={
                    currentAQI
                  }
                />


                <AIDiagnosis
                  summary={
                    diagnosis.summary
                  }
                  factors={
                    diagnosis.factors
                  }
                />


                <ForecastExplanation
                  zoneId={
                    selectedZone
                  }
                  forecast={
                    forecast
                  }
                />

              </div>

            </div>

          </section>


          {/* ================================================= */}
          {/* 03 SATELLITE */}
          {/* ================================================= */}

          <section
            id="satellite-intelligence"
            style={
              SECTION_STYLE
            }
          >

            <SectionHeader
              number="03"
              kicker="REMOTE SENSING"
              title="Satellite Intelligence"
              description={
                "Sentinel-5P atmospheric NO₂ analysis powered by Google Earth Engine."
              }
            />


            <SatelliteIntelligence />

          </section>


          {/* ================================================= */}
          {/* 04 AI */}
          {/* ================================================= */}

          <section
            id="ai-intelligence"
            style={
              SECTION_STYLE
            }
          >

            <SectionHeader
              number="04"
              kicker="ENVIRONMENT COPILOT"
              title="AI Intelligence"
              description={
                "AI-assisted environmental analysis and conversational air-quality intelligence."
              }
            />


            <div className="dashboard-ai-grid">

              <AIAnalysis />

              <AIChat />

            </div>

          </section>

        </>
      )}

    </div>
  );
}


export default Dashboard;