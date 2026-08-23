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
import { useAppContext } from "../context/AppContext";

function Dashboard() {
  const { selectedZone } = useAppContext();

  const {
    data: apiAQI,
    loading,
    error,
  } = useAQI(selectedZone);

  const {
    data: forecastData,
    loading: forecastLoading,
    error: forecastError,
  } = useForecast(selectedZone, 24);

  const {
    hotspots,
    loading: hotspotsLoading,
    error: hotspotsError,
  } = useHotspots(selectedZone);

  const demoAQI = {
    zone_id: selectedZone,
    zone_name: "Ahmedabad",
    aqi: 142,
    category: "UNHEALTHY",
    pm25: 78.4,
    pm10: 121.2,
    temperature: 31.4,
    humidity: 62,
    wind_speed: 8.2,
    timestamp: new Date().toISOString(),
  };

  const currentAQI = apiAQI || demoAQI;

  const forecast = forecastData?.forecast || [];

  const latestForecast =
    forecast.length > 0
      ? forecast[0]
      : null;

  const primaryHotspot =
    hotspots?.length > 0
      ? hotspots[0]
      : null;

  const zones = [
    {
      zone_id: "zone_001",
      name: "Ahmedabad",
      current_aqi: 142,
    },
    {
      zone_id: "zone_002",
      name: "Gandhinagar",
      current_aqi: 96,
    },
    {
      zone_id: "zone_003",
      name: "Vadodara",
      current_aqi: 118,
    },
  ];

  return (
    <div>
      <div className="dashboard-header dashboard-v2-header">
        <div>
          <p className="eyebrow">
            REAL-TIME ENVIRONMENT INTELLIGENCE
          </p>

          <h1>
            {currentAQI.zone_name || "Air Quality"}

            <span className="dashboard-title-accent">
              {" "}Air Quality
            </span>
          </h1>

          <p>
            Live pollution monitoring, predictive AQI intelligence,
            hotspot detection and AI-assisted environmental analysis.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <div
            className={
              error
                ? "data-status demo"
                : "data-status live"
            }
          >
            <span className="status-dot" />

            {error
              ? "DEMO DATA"
              : loading
              ? "SYNCING"
              : "LIVE DATA"}
          </div>

          <div className="dashboard-time">
            <span>LAST UPDATED</span>

            <strong>
              {new Date(
                currentAQI.timestamp
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </strong>
          </div>
        </div>
      </div>

      <div className="dashboard-stat-row">
        <AQICard
          aqi={currentAQI.aqi}
          category={currentAQI.category}
          timestamp={currentAQI.timestamp}
        />

        <PM25Card
          pm25={currentAQI.pm25}
          pm10={currentAQI.pm10}
        />

        <WeatherContext
          temperature={currentAQI.temperature}
          humidity={currentAQI.humidity}
          windSpeed={currentAQI.wind_speed}
        />

        <ForecastRiskCard
          predictedAQI={
            latestForecast?.predicted_aqi ?? 0
          }
          riskLevel={
            latestForecast?.risk_level ?? "UNKNOWN"
          }
          confidence={
            latestForecast?.confidence ?? 0
          }
          timestamp={
            latestForecast?.timestamp ??
            new Date().toISOString()
          }
        />
      </div>

      {forecastLoading && (
        <p>Loading forecast...</p>
      )}

      {forecastError && (
        <p>
          Forecast unavailable: {forecastError}
        </p>
      )}

      <div className="dashboard-main-grid">
        <div className="dashboard-main-column">
          <PollutionMap
            zones={zones}
            hotspots={hotspots}
          />

          <RiskTrajectory
            forecast={forecast}
          />

          <div className="dashboard-two-column">
            {primaryHotspot ? (
              <HotspotCard
                hotspotId={primaryHotspot.hotspot_id}
                latitude={primaryHotspot.latitude}
                longitude={primaryHotspot.longitude}
                severity={primaryHotspot.severity}
                aqi={primaryHotspot.aqi}
                pollutants={[]}
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
              clusters={[
                {
                  cluster_id: "cluster_001",
                  risk_level: "HIGH",
                  aqi: 164,
                },
                {
                  cluster_id: "cluster_002",
                  risk_level: "MODERATE",
                  aqi: 118,
                },
              ]}
            />
          </div>
        </div>

        <div className="dashboard-side-column">
          <HealthAdvisory
            category={currentAQI.category}
          />

          <SourceAttribution
            zoneId={selectedZone}
            aqiData={currentAQI}
          />

          <AIDiagnosis
            summary="AQI is elevated due to increased particulate matter and limited wind dispersion."
            factors={[
              "High PM2.5 concentration",
              "High PM10 concentration",
              "Low wind dispersion",
            ]}
          />

          <ForecastExplanation
            zoneId={selectedZone}
            forecast={forecast}
          />
          
        </div>
      </div>

      <div className="dashboard-ai-grid">
        <AIAnalysis />
        <AIChat />
      </div>
    </div>
  );
}

export default Dashboard;