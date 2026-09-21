import {
  useState,
} from "react";

import {
  analyzeAI,
} from "../../services/aiService";

import {
  getLiveAQI,
} from "../../services/aqiService";

import {
  useAppContext,
} from "../../context/AppContext";


function isTemporaryAIError(error) {
  const message = String(
    error?.message ??
      error ??
      ""
  ).toLowerCase();

  return (
    message.includes("503") ||
    message.includes("429") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("quota") ||
    message.includes("rate limit")
  );
}


function cleanText(text) {
  return String(
    text ?? ""
  )
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .replace(
      /\bzone_\d+\b/gi,
      "the selected zone"
    )
    .trim();
}


function formatCategory(
  value = "UNKNOWN"
) {
  return String(value)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}


function createFallbackAnalysis(
  data,
  question
) {
  if (!data) {
    return (
      "Live environmental data is currently unavailable. " +
      "Please try again shortly."
    );
  }


  const aqi =
    Number(data.aqi ?? 0);

  const pm25 =
    Number(data.pm25 ?? 0);

  const pm10 =
    Number(data.pm10 ?? 0);

  const wind =
    Number(data.wind_speed ?? 0);

  const category =
    formatCategory(
      data.category
    );


  const reasons = [];

  if (pm25 >= 35) {
    reasons.push(
      `PM2.5 is elevated at ${pm25} µg/m³`
    );
  }

  if (pm10 >= 50) {
    reasons.push(
      `PM10 is elevated at ${pm10} µg/m³`
    );
  }

  if (
    wind > 0 &&
    wind < 5
  ) {
    reasons.push(
      `low wind speed (${wind} km/h) may reduce pollutant dispersion`
    );
  }


  const reasonText =
    reasons.length > 0
      ? reasons.join(", ")
      : "no single major pollutant spike is visible in the current readings";


  return (
    `Current AQI is ${Math.round(aqi)}, classified as ${category}. ` +
    `Based on the live measurements, ${reasonText}. ` +
    `This is a live-data fallback assessment while the AI model is temporarily unavailable.`
  );
}


function AIAnalysis() {
  const {
    selectedZone,
  } = useAppContext();


  const [
    question,
    setQuestion,
  ] = useState(
    "Why is AQI high?"
  );

  const [
    result,
    setResult,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    fallback,
    setFallback,
  ] = useState(false);

  const [
    statusMessage,
    setStatusMessage,
  ] = useState("");


  async function handleAnalyze() {
    const trimmed =
      question.trim();

    if (!trimmed) {
      return;
    }


    setLoading(true);
    setResult("");
    setFallback(false);
    setStatusMessage("");


    try {
      const response =
        await analyzeAI({
          zoneId:
            selectedZone,

          question:
            trimmed,
        });


      const data =
        response?.data ??
        response;


      const answer =
        data?.analysis ||
        data?.answer ||
        data?.response ||
        data?.message;


      if (answer) {
        setResult(
          cleanText(
            answer
          )
        );

        setFallback(
          false
        );
      } else {
        throw new Error(
          "AI response unavailable"
        );
      }

    } catch (error) {
      try {
        const liveResponse =
          await getLiveAQI(
            selectedZone
          );


        const liveData =
          liveResponse?.data ??
          liveResponse;


        setResult(
          createFallbackAnalysis(
            liveData,
            trimmed
          )
        );

        setFallback(true);


        if (
          isTemporaryAIError(
            error
          )
        ) {
          setStatusMessage(
            "AI model is temporarily busy. Showing a live-data assessment."
          );
        } else {
          setStatusMessage(
            "AI analysis could not be generated. Showing a live-data assessment."
          );
        }

      } catch {
        setResult(
          "Analysis is temporarily unavailable."
        );

        setFallback(
          true
        );

        setStatusMessage(
          "Live data could not be loaded."
        );
      }

    } finally {
      setLoading(
        false
      );
    }
  }


  return (
    <section
      className="card"
      style={{
        padding: "24px",
        minHeight: "520px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "flex-start",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <span className="card-kicker">
            GEMINI INTELLIGENCE
          </span>

          <h2
            style={{
              margin:
                "8px 0 0",
            }}
          >
            AI Analysis
          </h2>
        </div>


        <span
          style={{
            padding:
              "7px 12px",
            borderRadius:
              "999px",
            fontSize:
              "11px",
            fontWeight:
              700,
            border:
              fallback
                ? "1px solid rgba(251,191,36,.25)"
                : "1px solid rgba(45,212,191,.25)",
            background:
              fallback
                ? "rgba(251,191,36,.08)"
                : "rgba(45,212,191,.08)",
            color:
              fallback
                ? "#fbbf24"
                : "#5eead4",
          }}
        >
          {fallback
            ? "LIVE FALLBACK"
            : "AI READY"}
        </span>
      </div>


      <div
        style={{
          marginBottom:
            "18px",
        }}
      >
        <label
          style={{
            display:
              "block",
            marginBottom:
              "9px",
            color:
              "#849d96",
            fontSize:
              "12px",
            fontWeight:
              700,
            letterSpacing:
              ".08em",
          }}
        >
          ASK FOR AN ENVIRONMENTAL INSIGHT
        </label>

        <textarea
          value={question}
          onChange={(
            event
          ) =>
            setQuestion(
              event.target.value
            )
          }
          placeholder="Example: Why is AQI high?"
          style={{
            width: "100%",
            minHeight: "110px",
            resize: "vertical",
            boxSizing:
              "border-box",
            borderRadius:
              "14px",
            border:
              "1px solid rgba(212,241,232,.10)",
            background:
              "rgba(3,18,17,.55)",
            color:
              "#ecf5f1",
            padding:
              "16px",
            fontSize:
              "15px",
            lineHeight:
              1.55,
            outline:
              "none",
          }}
        />
      </div>


      <button
        type="button"
        onClick={
          handleAnalyze
        }
        disabled={
          loading ||
          !question.trim()
        }
        style={{
          width: "100%",
          minHeight: "48px",
          borderRadius:
            "12px",
          border:
            "1px solid rgba(45,212,191,.25)",
          background:
            loading
              ? "rgba(45,212,191,.08)"
              : "rgba(45,212,191,.14)",
          color:
            "#ecf5f1",
          fontWeight:
            700,
          cursor:
            loading
              ? "wait"
              : "pointer",
        }}
      >
        {loading
          ? "Analyzing environment..."
          : "Analyze Environment"}
      </button>


      {statusMessage && (
        <div
          style={{
            marginTop:
              "18px",
            padding:
              "12px 14px",
            borderRadius:
              "12px",
            background:
              "rgba(251,191,36,.06)",
            border:
              "1px solid rgba(251,191,36,.16)",
            color:
              "#d9c98f",
            fontSize:
              "13px",
            lineHeight:
              1.5,
          }}
        >
          {statusMessage}
        </div>
      )}


      {result && (
        <div
          style={{
            marginTop:
              "18px",
            padding:
              "18px",
            borderRadius:
              "16px",
            background:
              "rgba(45,212,191,.045)",
            border:
              "1px solid rgba(45,212,191,.12)",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap:
                "12px",
              marginBottom:
                "12px",
            }}
          >
            <strong
              style={{
                fontSize:
                  "14px",
                color:
                  "#62dce8",
              }}
            >
              Environmental Insight
            </strong>

            <span
              style={{
                fontSize:
                  "10px",
                color:
                  "#849d96",
              }}
            >
              {fallback
                ? "LIVE DATA"
                : "GEMINI AI"}
            </span>
          </div>


          <p
            style={{
              margin: 0,
              color:
                "#b7cbc5",
              fontSize:
                "15px",
              lineHeight:
                1.7,
              whiteSpace:
                "pre-line",
            }}
          >
            {result}
          </p>
        </div>
      )}


      <div
        style={{
          marginTop:
            "18px",
          display:
            "flex",
          flexWrap:
            "wrap",
          gap:
            "8px",
        }}
      >
        {[
          "AQI Data",
          "Weather",
          "Pollutants",
        ].map(
          (item) => (
            <span
              key={item}
              style={{
                padding:
                  "6px 9px",
                borderRadius:
                  "999px",
                background:
                  "rgba(255,255,255,.035)",
                border:
                  "1px solid rgba(255,255,255,.06)",
                color:
                  "#849d96",
                fontSize:
                  "10px",
                fontWeight:
                  700,
              }}
            >
              {item}
            </span>
          )
        )}
      </div>
    </section>
  );
}


export default AIAnalysis;