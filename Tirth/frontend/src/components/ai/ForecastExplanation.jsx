import { useEffect, useState } from "react";
import { explainForecast } from "../../services/aiService";


function isQuotaError(error) {
  const message =
    String(
      error?.message ??
      error ??
      ""
    ).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("quota") ||
    message.includes("rate limit")
  );
}


function getErrorMessage(error) {
  if (isQuotaError(error)) {
    return (
      "AI explanation is temporarily unavailable because the " +
      "AI request limit has been reached. Live forecast data " +
      "is still available."
    );
  }

  const value =
    error?.message ?? error;

  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    value?.detail?.error?.message
  ) {
    return value.detail.error.message;
  }

  if (
    value?.error?.message
  ) {
    return value.error.message;
  }

  return (
    "AI forecast explanation is temporarily unavailable."
  );
}


function getFallbackExplanation(
  forecast
) {
  if (
    !Array.isArray(forecast) ||
    forecast.length === 0
  ) {
    return "";
  }

  const values =
    forecast
      .map((item) =>
        Number(
          item?.predicted_aqi
        )
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );


  if (values.length === 0) {
    return (
      "Live forecast data is available, but an AQI trend " +
      "could not be calculated."
    );
  }


  const first =
    values[0];

  const last =
    values[
      values.length - 1
    ];

  const peak =
    Math.max(...values);

  const lowest =
    Math.min(...values);

  const difference =
    last - first;


  let trend =
    "remain relatively stable";

  if (difference >= 10) {
    trend =
      "increase over the forecast period";
  } else if (
    difference <= -10
  ) {
    trend =
      "decrease over the forecast period";
  }


  return (
    `Live forecast indicates AQI may ${trend}. ` +
    `Current forecast starts near ${Math.round(first)}, ` +
    `with a projected range of ${Math.round(lowest)} to ` +
    `${Math.round(peak)} during the next 24 hours.`
  );
}


function ForecastExplanation({
  zoneId = "zone_001",
  forecast = [],
}) {
  const [
    explanation,
    setExplanation,
  ] = useState("");

  const [
    keyFactors,
    setKeyFactors,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    usingFallback,
    setUsingFallback,
  ] = useState(false);


  useEffect(() => {
    let cancelled = false;


    async function loadExplanation() {
      if (
        !zoneId ||
        !forecast ||
        forecast.length === 0
      ) {
        setExplanation("");
        setKeyFactors([]);
        setError("");
        setUsingFallback(false);
        return;
      }


      setLoading(true);
      setError("");
      setUsingFallback(false);


      try {
        const response =
          await explainForecast({
            zoneId,
            forecast,
          });


        if (cancelled) {
          return;
        }


        const data =
          response?.data ??
          response;


        setExplanation(
          data?.explanation ||
          data?.summary ||
          data?.analysis ||
          getFallbackExplanation(
            forecast
          )
        );


        setKeyFactors(
          Array.isArray(
            data?.key_factors
          )
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


        const quotaExceeded =
          isQuotaError(err);


        if (quotaExceeded) {
          setError(
            getErrorMessage(err)
          );

          setExplanation(
            getFallbackExplanation(
              forecast
            )
          );

          setKeyFactors([
            "Live AQI forecast remains available",
            "AI explanation will resume when API quota becomes available",
          ]);

          setUsingFallback(true);
        } else {
          setError(
            getErrorMessage(err)
          );

          setExplanation(
            getFallbackExplanation(
              forecast
            )
          );

          setKeyFactors([]);
          setUsingFallback(true);
        }
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
  }, [
    zoneId,
    forecast,
  ]);


  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "12px",
        }}
      >
        <h2>
          Forecast Explanation
        </h2>


        <span
          style={{
            padding:
              "5px 9px",
            borderRadius:
              "20px",
            fontSize:
              "10px",
            fontWeight:
              700,
            background:
              usingFallback
                ? "rgba(251,191,36,.08)"
                : "rgba(45,212,191,.08)",
            border:
              usingFallback
                ? "1px solid rgba(251,191,36,.2)"
                : "1px solid rgba(45,212,191,.2)",
            color:
              usingFallback
                ? "#fbbf24"
                : "#5eead4",
          }}
        >
          {usingFallback
            ? "LIVE FALLBACK"
            : "AI"}
        </span>
      </div>


      {loading ? (
        <p>
          Generating AI forecast
          explanation...
        </p>
      ) : (
        <>
          {error && (
            <div
              style={{
                marginBottom:
                  "14px",
                padding:
                  "11px 12px",
                borderRadius:
                  "10px",
                background:
                  "rgba(251,191,36,.06)",
                border:
                  "1px solid rgba(251,191,36,.15)",
                color:
                  "#d9c98f",
                fontSize:
                  "13px",
                lineHeight:
                  1.5,
              }}
            >
              {error}
            </div>
          )}


          <p>
            {explanation ||
              "No explanation available yet."}
          </p>


          {keyFactors.length >
            0 && (
            <>
              <h3>
                Key Factors
              </h3>

              <ul>
                {keyFactors.map(
                  (
                    factor,
                    index
                  ) => (
                    <li
                      key={`${factor}-${index}`}
                    >
                      {factor}
                    </li>
                  )
                )}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}


export default ForecastExplanation;