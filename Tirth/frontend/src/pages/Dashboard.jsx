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

import { useAQI } from "../hooks/useAQI";
import { useForecast } from "../hooks/useForecast";
import { useHotspots } from "../hooks/useHotspots";
import { useZones } from "../hooks/useZones";
import { useAppContext } from "../context/AppContext";


function getDiagnosis(aqiData) {
  if (!aqiData) {
    return {
      summary:
        "Waiting for current air-quality data.",
      factors: [],
    };
  }

  const factors = [];

  if (Number(aqiData.pm25) >= 35) {
    factors.push(
      "Elevated PM2.5 concentration"
    );
  }

  if (Number(aqiData.pm10) >= 50) {
    factors.push(
      "Elevated PM10 concentration"
    );
  }

  if (Number(aqiData.no2) >= 40) {
    factors.push(
      "Elevated NO2 concentration"
    );
  }

  if (
    Number(aqiData.wind_speed) > 0 &&
    Number(aqiData.wind_speed) < 5
  ) {
    factors.push(
      "Low wind dispersion"
    );
  }

  if (factors.length === 0) {
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
  const {
    selectedZone,
  } = useAppContext();

  // -------------------------------------------------------
  // Selected zone live data
  // -------------------------------------------------------

  const {
    data: apiAQI,
    loading,
    error,
  } = useAQI(
    selectedZone
  );

  // -------------------------------------------------------
  // ALL zones live data
  // Ahmedabad, Gandhinagar, Vadodara, etc.
  // -------------------------------------------------------

  const {
    zones: allZones,
    loading: zonesLoading,
    error: zonesError,
  } = useZones();

  // Only use zones that successfully received live data.
  const liveZones = (
    allZones || []
  ).filter(
    (zone) =>
      zone.live &&
      zone.aqi !== null &&
      zone.aqi !== undefined
  );

  // -------------------------------------------------------
  // Forecast
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
  // Hotspots
  // -------------------------------------------------------

  const {
    hotspots,
    loading: hotspotsLoading,
    error: hotspotsError,
  } = useHotspots(
    selectedZone
  );

  const currentAQI =
    apiAQI || null;

  const hasLiveData =
    Boolean(currentAQI);

  const forecast =
    forecastData?.forecast || [];

  const latestForecast =
    forecast.length > 0
      ? forecast[0]
      : null;

  const primaryHotspot =
    hotspots?.length > 0
      ? hotspots[0]
      : null;

  const liveTimestamp =
    currentAQI?.air_quality_timestamp ??
    currentAQI?.weather_timestamp ??
    currentAQI?.timestamp ??
    null;

  const formattedTime =
    liveTimestamp
      ? new Date(
          liveTimestamp
        ).toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
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
      <div className="dashboard-header dashboard-v2-header">
        <div>
          <p className="eyebrow">
            REAL-TIME ENVIRONMENT INTELLIGENCE
          </p>

          <h1>
            {currentAQI?.zone_name ||
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

          <div className="dashboard-main-grid">
            <div className="dashboard-main-column">
              <PollutionMap
                zones={
                  liveZones
                }
                hotspots={
                  hotspots
                }
              />

              <RiskTrajectory
                forecast={
                  forecast
                }
              />

              <div className="dashboard-two-column">
                {primaryHotspot ? (
                  <HotspotCard
                    hotspotId={
                      primaryHotspot.hotspot_id
                    }
                    latitude={
                      primaryHotspot.latitude
                    }
                    longitude={
                      primaryHotspot.longitude
                    }
                    severity={
                      primaryHotspot.severity
                    }
                    aqi={
                      primaryHotspot.aqi
                    }
                    pollutants={
                      []
                    }
                  />
                ) : (
                  <div className="card">
                    {hotspotsLoading
                      ? "Loading hotspots..."
                      : hotspotsError
                      ? `Hotspot error: ${hotspotsError}`
                      : "No hotspots found."}
                  </div>
                )}

                <RiskClusters
                  clusters={
                    liveZones.map(
                      (zone) => ({
                        cluster_id:
                          zone.zone_id,

                        name:
                          zone.name,

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

          <div className="dashboard-ai-grid">
            <AIAnalysis />

            <AIChat />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;