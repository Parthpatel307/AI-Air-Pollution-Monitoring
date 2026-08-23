import { useEffect, useState } from "react";
import { explainForecast } from "../../services/aiService";

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

  return "Unable to explain forecast.";
}

function ForecastExplanation({
  zoneId = "zone_001",
  forecast = [],
}) {
  const [explanation, setExplanation] = useState("");
  const [keyFactors, setKeyFactors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadExplanation() {
      if (!zoneId || !forecast || forecast.length === 0) {
        setExplanation("");
        setKeyFactors([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await explainForecast({
          zoneId,
          forecast,
        });

        if (cancelled) {
          return;
        }

        const data = response?.data || response;

        setExplanation(
          data?.explanation ||
            data?.summary ||
            data?.analysis ||
            "No explanation available."
        );

        setKeyFactors(
          Array.isArray(data?.key_factors)
            ? data.key_factors
            : []
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Forecast explanation failed:",
          err
        );

        setError(getErrorMessage(err));
        setExplanation("");
        setKeyFactors([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadExplanation();

    return () => {
      cancelled = true;
    };
  }, [zoneId, forecast]);

  return (
    <section>
      <h2>Forecast Explanation</h2>

      {loading ? (
        <p>Generating AI forecast explanation...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <p>
            {explanation ||
              "No explanation available yet."}
          </p>

          {keyFactors.length > 0 && (
            <>
              <h3>Key Factors</h3>

              <ul>
                {keyFactors.map((factor) => (
                  <li key={factor}>
                    {factor}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}

export default ForecastExplanation;