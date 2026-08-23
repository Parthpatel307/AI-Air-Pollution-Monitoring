import { useEffect, useState } from "react";
import { detectPollutionSource } from "../../services/aiService";

function getErrorMessage(error) {
  const value = error?.message ?? error;

  if (typeof value === "string") {
    return value;
  }

  if (value?.detail?.error?.message) {
    return value.detail.error.message;
  }

  if (value?.error?.message) {
    return value.error.message;
  }

  return "Source detection failed.";
}

function SourceAttribution({
  zoneId = "zone_001",
  aqiData = null,
}) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSourceDetection() {
      if (!zoneId) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await detectPollutionSource({
          zoneId,
          pollutants: {
            pm25: Number(aqiData?.pm25 ?? 0),
            pm10: Number(aqiData?.pm10 ?? 0),
            no2: Number(aqiData?.no2 ?? 0),
            so2: Number(aqiData?.so2 ?? 0),
            co: Number(aqiData?.co ?? 0),
          },
          weather: {
            temperature: Number(
              aqiData?.temperature ?? 0
            ),
            humidity: Number(
              aqiData?.humidity ?? 0
            ),
            wind_speed: Number(
              aqiData?.wind_speed ?? 0
            ),
          },
        });

        if (cancelled) {
          return;
        }

        const data = response?.data || response;

        setSources(
          Array.isArray(data?.probable_sources)
            ? data.probable_sources
            : []
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Source detection failed:",
          err
        );

        setSources([]);
        setError(getErrorMessage(err));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSourceDetection();

    return () => {
      cancelled = true;
    };
  }, [
    zoneId,
    aqiData?.pm25,
    aqiData?.pm10,
    aqiData?.no2,
    aqiData?.so2,
    aqiData?.co,
    aqiData?.temperature,
    aqiData?.humidity,
    aqiData?.wind_speed,
  ]);

  return (
    <section className="card source-card">
      <div className="card-header">
        <div>
          <span className="card-kicker">
            PROBABLE SOURCE ANALYSIS
          </span>

          <h2>Source Attribution</h2>
        </div>

        <span className="ai-pill">
          {loading ? "..." : "AI"}
        </span>
      </div>

      {loading ? (
        <p>Running pollution source model...</p>
      ) : error ? (
        <p>{error}</p>
      ) : sources.length === 0 ? (
        <p>No source attribution available.</p>
      ) : (
        <div className="source-list">
          {sources.map((item) => {
            const confidence =
              Number(item.confidence) || 0;

            const percentage = Math.round(
              confidence * 100
            );

            return (
              <div
                className="source-item"
                key={item.source}
              >
                <div className="source-heading">
                  <span>
                    {String(item.source)
                      .replaceAll("_", " ")}
                  </span>

                  <strong>
                    {percentage}%
                  </strong>
                </div>

                <div className="source-track">
                  <div
                    className="source-progress"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="analysis-warning">
        Probabilistic attribution — not definitive evidence.
      </div>
    </section>
  );
}

export default SourceAttribution;