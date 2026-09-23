import {
  useEffect,
  useState,
} from "react";

import {
  detectPollutionSource,
} from "../../services/aiService";

import {
  useAuth,
} from "../../context/AuthContext";


function getErrorMessage(
  error
) {
  const value =
    error?.message ??
    error;


  if (
    typeof value ===
    "string"
  ) {
    return value;
  }


  if (
    value?.detail
      ?.error
      ?.message
  ) {
    return (
      value.detail
        .error
        .message
    );
  }


  if (
    value?.error
      ?.message
  ) {
    return (
      value.error.message
    );
  }


  if (
    value?.detail
  ) {
    if (
      typeof value.detail ===
      "string"
    ) {
      return value.detail;
    }

    try {
      return JSON.stringify(
        value.detail
      );
    } catch {
      return (
        "Source detection failed."
      );
    }
  }


  return (
    "Source detection failed."
  );
}


function getSourceLabel(
  source
) {
  if (
    source === null ||
    source === undefined
  ) {
    return "UNKNOWN";
  }


  if (
    typeof source ===
    "string"
  ) {
    return source;
  }


  if (
    typeof source ===
    "number"
  ) {
    return String(
      source
    );
  }


  if (
    typeof source ===
    "object"
  ) {
    const possibleLabel =
      source.label ??
      source.name ??
      source.source_name ??
      source.source_type ??
      source.category ??
      source.class_name ??
      source.class ??
      source.type ??
      source.value;


    if (
      possibleLabel !==
        undefined &&
      possibleLabel !==
        null
    ) {
      if (
        typeof possibleLabel ===
        "object"
      ) {
        return getSourceLabel(
          possibleLabel
        );
      }

      return String(
        possibleLabel
      );
    }


    const values =
      Object.values(
        source
      );


    const firstText =
      values.find(
        (value) =>
          typeof value ===
          "string"
      );


    if (firstText) {
      return firstText;
    }
  }


  return "UNKNOWN";
}


function formatSourceLabel(
  source
) {
  return getSourceLabel(
    source
  )
    .replaceAll(
      "_",
      " "
    )
    .replaceAll(
      "-",
      " "
    )
    .trim()
    .toUpperCase();
}


function getConfidencePercentage(
  value
) {
  const number =
    Number(value);


  if (
    !Number.isFinite(
      number
    )
  ) {
    return 0;
  }


  const percentage =
    number <= 1
      ? number * 100
      : number;


  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        percentage
      )
    )
  );
}


function normalizeSources(
  data
) {
  const probableSources =
    data?.probable_sources ??
    data?.sources ??
    [];


  if (
    Array.isArray(
      probableSources
    )
  ) {
    return probableSources;
  }


  if (
    probableSources &&
    typeof probableSources ===
      "object"
  ) {
    return Object.entries(
      probableSources
    ).map(
      ([
        source,
        confidence,
      ]) => ({
        source,

        confidence:
          typeof confidence ===
          "object"
            ? confidence
                ?.confidence ??
              confidence
                ?.probability ??
              confidence
                ?.score ??
              0
            : confidence,
      })
    );
  }


  return [];
}


function SourceAttribution({
  zoneId = "zone_001",
  aqiData = null,
}) {
  const {
    user,
    isCitizen,
    isAuthority,
  } = useAuth();


  const isAdmin =
    user?.role ===
    "ADMIN";


  const canUseSourceDetection =
    Boolean(
      isAdmin ||
      isAuthority
    );


  const [
    sources,
    setSources,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    let cancelled =
      false;


    async function loadSourceDetection() {
      /*
       * CITIZEN:
       *
       * Do not call protected
       * source-detection endpoint.
       *
       * This removes unnecessary
       * 403 requests from backend.
       */
      if (
        !canUseSourceDetection
      ) {
        setSources(
          []
        );

        setError(
          ""
        );

        setLoading(
          false
        );

        return;
      }


      if (!zoneId) {
        return;
      }


      setLoading(
        true
      );

      setError(
        ""
      );


      try {
        const response =
          await detectPollutionSource({
            zoneId,

            pollutants: {
              pm25:
                Number(
                  aqiData
                    ?.pm25 ??
                  0
                ),

              pm10:
                Number(
                  aqiData
                    ?.pm10 ??
                  0
                ),

              no2:
                Number(
                  aqiData
                    ?.no2 ??
                  0
                ),

              so2:
                Number(
                  aqiData
                    ?.so2 ??
                  0
                ),

              co:
                Number(
                  aqiData
                    ?.co ??
                  0
                ),
            },

            weather: {
              temperature:
                Number(
                  aqiData
                    ?.temperature ??
                  0
                ),

              humidity:
                Number(
                  aqiData
                    ?.humidity ??
                  0
                ),

              wind_speed:
                Number(
                  aqiData
                    ?.wind_speed ??
                  0
                ),
            },
          });


        if (
          cancelled
        ) {
          return;
        }


        const data =
          response?.data ??
          response;


        setSources(
          normalizeSources(
            data
          )
        );

      } catch (err) {
        if (
          cancelled
        ) {
          return;
        }


        console.error(
          "Source detection failed:",
          err
        );


        setSources(
          []
        );


        setError(
          getErrorMessage(
            err
          )
        );

      } finally {
        if (
          !cancelled
        ) {
          setLoading(
            false
          );
        }
      }
    }


    loadSourceDetection();


    return () => {
      cancelled =
        true;
    };
  }, [
    canUseSourceDetection,
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

          <h2>
            Source Attribution
          </h2>
        </div>


        <span className="ai-pill">
          {!canUseSourceDetection
            ? "LOCKED"
            : loading
            ? "..."
            : "AI"}
        </span>

      </div>


      {!canUseSourceDetection ? (
        <div
          style={{
            padding:
              "12px 13px",

            borderRadius:
              "10px",

            background:
              "rgba(56,189,248,.05)",

            border:
              "1px solid rgba(56,189,248,.12)",

            color:
              "#8aa59f",

            fontSize:
              "13px",

            lineHeight:
              1.55,
          }}
        >
          Source attribution is
          available to Authority
          and Admin accounts.
        </div>

      ) : loading ? (
        <p>
          Running pollution source
          model...
        </p>

      ) : error ? (
        <p>
          {error}
        </p>

      ) : sources.length ===
        0 ? (
        <p>
          No source attribution
          available.
        </p>

      ) : (
        <div className="source-list">

          {sources.map(
            (
              item,
              index
            ) => {
              const label =
                formatSourceLabel(
                  item?.source ??
                  item?.label ??
                  item?.name ??
                  item
                );


              const percentage =
                getConfidencePercentage(
                  item
                    ?.confidence ??
                  item
                    ?.probability ??
                  item
                    ?.score ??
                  0
                );


              return (
                <div
                  className="source-item"
                  key={`${label}-${index}`}
                >

                  <div className="source-heading">
                    <span>
                      {label}
                    </span>

                    <strong>
                      {percentage}%
                    </strong>
                  </div>


                  <div className="source-track">
                    <div
                      className="source-progress"
                      style={{
                        width:
                          `${percentage}%`,
                      }}
                    />
                  </div>

                </div>
              );
            }
          )}

        </div>
      )}


      <div className="analysis-warning">
        {canUseSourceDetection
          ? (
            <>
              Probabilistic attribution —
              not definitive evidence.
            </>
          )
          : isCitizen
          ? (
            <>
              Citizen access keeps
              advanced attribution
              controls restricted.
            </>
          )
          : (
            <>
              Authority access required.
            </>
          )}
      </div>

    </section>
  );
}


export default SourceAttribution;