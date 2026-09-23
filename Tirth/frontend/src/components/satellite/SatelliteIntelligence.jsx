import {
  Activity,
  Clock3,
  Satellite,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAppContext,
} from "../../context/AppContext";

import {
  getSatellitePollution,
} from "../../services/satelliteService";


function SatelliteIntelligence() {
  const {
    selectedZone,
  } = useAppContext();

  const [
    data,
    setData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);


  useEffect(() => {
    let cancelled = false;

    async function loadSatelliteData() {
      if (!selectedZone) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await getSatellitePollution(
            selectedZone,
            5
          );

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load satellite data."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSatelliteData();

    return () => {
      cancelled = true;
    };
  }, [selectedZone]);


  const no2Micromoles =
    useMemo(() => {
      const value =
        Number(data?.no2);

      if (
        !Number.isFinite(value)
      ) {
        return null;
      }

      return value * 1_000_000;
    }, [data?.no2]);


  const formattedTimestamp =
    useMemo(() => {
      if (
        !data?.satellite_timestamp
      ) {
        return "Unavailable";
      }

      const date =
        new Date(
          data.satellite_timestamp
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "Unavailable";
      }

      return date.toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    }, [
      data?.satellite_timestamp,
    ]);


  return (
    <section className="satellite-card">

      <div className="satellite-header">

        <div>
          <div className="satellite-title-row">
            <Satellite size={20} />

            <h2>
              Satellite Intelligence
            </h2>
          </div>

          <p>
            Sentinel-5P atmospheric
            pollution analysis powered by
            Google Earth Engine
          </p>
        </div>


        <span className="satellite-source-badge">
          GOOGLE EARTH ENGINE
        </span>

      </div>


      {loading && (
        <div className="satellite-state">
          Loading satellite observation...
        </div>
      )}


      {!loading && error && (
        <div className="satellite-state satellite-error">
          {error}
        </div>
      )}


      {!loading &&
        !error &&
        data && (
          <>
            <div className="satellite-zone-row">

              <div>
                <span>
                  MONITORED AREA
                </span>

                <strong>
                  {data.zone_name}
                  {data.state
                    ? `, ${data.state}`
                    : ""}
                </strong>
              </div>


              <div>
                <span>
                  ANALYSIS WINDOW
                </span>

                <strong>
                  Last{" "}
                  {data.period_days || 5}
                  {" "}Days
                </strong>
              </div>

            </div>


            <div className="satellite-metrics">

              <div className="satellite-metric">

                <div className="satellite-metric-icon">
                  <Activity size={18} />
                </div>

                <span>
                  NO₂ COLUMN
                </span>

                <strong>
                  {no2Micromoles !== null
                    ? no2Micromoles.toFixed(
                        2
                      )
                    : "N/A"}
                </strong>

                <small>
                  µmol/m²
                </small>

              </div>


              <div className="satellite-metric">

                <div className="satellite-metric-icon">
                  <Satellite size={18} />
                </div>

                <span>
                  SATELLITE IMAGES
                </span>

                <strong>
                  {data.image_count ?? 0}
                </strong>

                <small>
                  observations
                </small>

              </div>


              <div className="satellite-metric">

                <div className="satellite-metric-icon">
                  <Clock3 size={18} />
                </div>

                <span>
                  LATEST OBSERVATION
                </span>

                <strong className="satellite-time">
                  {formattedTimestamp}
                </strong>

                <small>
                  Satellite timestamp
                </small>

              </div>

            </div>


            <div className="satellite-note">
              <strong>
                Satellite context:
              </strong>

              {" "}
              This NO₂ value represents
              atmospheric column density
              averaged across the selected
              area. It is not the same as
              ground-level AQI or NO₂
              concentration in µg/m³.
            </div>


            <div className="satellite-footer">
              Source:{" "}
              {data.source ||
                "Sentinel-5P / Google Earth Engine"}
            </div>
          </>
        )}

    </section>
  );
}


export default SatelliteIntelligence;