import {
  useEffect,
  useState,
} from "react";

import {
  explainForecast,
} from "../../services/aiService";


function isTemporaryAIError(error) {
  const message =
    String(
      error?.message ??
      error ??
      ""
    ).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("503") ||
    message.includes("resource_exhausted") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("temporarily unavailable")
  );
}


function getCleanErrorMessage(error) {
  if (
    isTemporaryAIError(
      error
    )
  ) {
    return (
      "AI explanation is temporarily unavailable. " +
      "Showing the live forecast fallback instead."
    );
  }

  return (
    "AI explanation is temporarily unavailable. " +
    "Live forecast data is still available."
  );
}


function cleanAIText(text) {
  if (!text) {
    return "";
  }

  return String(text)
    /*
     * Remove markdown formatting.
     */
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")

    /*
     * Do not expose internal zone IDs
     * such as zone_001 to the user.
     */
    .replace(
      /\bzone_\d+\b/gi,
      "the selected zone"
    )

    /*
     * Clean repeated spaces.
     */
    .replace(/[ \t]+/g, " ")

    /*
     * Make section labels easier to read.
     */
    .replace(
      /Prediction:/gi,
      "\nPrediction:"
    )
    .replace(
      /Risk Increase:/gi,
      "\nRisk Increase:"
    )
    .replace(
      /Influencing Factors & Confidence:/gi,
      "\nInfluencing Factors & Confidence:"
    )
    .trim();
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
      .map(
        (item) =>
          Number(
            item?.predicted_aqi
          )
      )
      .filter(
        (value) =>
          Number.isFinite(value)
      );


  if (
    values.length === 0
  ) {
    return (
      "Live forecast data is available, " +
      "but an AQI trend could not be calculated."
    );
  }


  const first =
    values[0];

  const last =
    values[
      values.length - 1
    ];

  const peak =
    Math.max(
      ...values
    );

  const lowest =
    Math.min(
      ...values
    );

  const difference =
    last - first;


  let trend =
    "remain relatively stable";

  if (
    difference >= 10
  ) {
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
  zoneId,
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
        !Array.isArray(
          forecast
        ) ||
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


        const aiExplanation =
          data?.explanation ||
          data?.summary ||
          data?.analysis;


        if (aiExplanation) {
          setExplanation(
            cleanAIText(
              aiExplanation
            )
          );

          setUsingFallback(
            false
          );
        } else {
          setExplanation(
            getFallbackExplanation(
              forecast
            )
          );

          setUsingFallback(
            true
          );
        }


        const factors =
          Array.isArray(
            data?.key_factors
          )
            ? data.key_factors
            : [];


        setKeyFactors(
          factors.map(
            (factor) =>
              cleanAIText(
                factor
              )
          )
        );

      } catch (err) {
        if (cancelled) {
          return;
        }


        console.error(
          "Forecast explanation failed:",
          err
        );


        setError(
          getCleanErrorMessage(
            err
          )
        );


        setExplanation(
          getFallbackExplanation(
            forecast
          )
        );


        setKeyFactors(
          []
        );


        setUsingFallback(
          true
        );

      } finally {
        if (!cancelled) {
          setLoading(
            false
          );
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
          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          gap:
            "12px",
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


          <p
            style={{
              whiteSpace:
                "pre-line",

              lineHeight:
                1.6,
            }}
          >
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