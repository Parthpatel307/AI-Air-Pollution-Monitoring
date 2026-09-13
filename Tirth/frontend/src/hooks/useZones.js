import {
  useEffect,
  useState,
} from "react";

import {
  getLiveAQINetwork,
} from "../services/aqiService";


const REFRESH_INTERVAL_MS =
  15 * 60 * 1000;


export function useZones() {
  const [
    zones,
    setZones,
  ] = useState([]);

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


    async function loadZones({
      initial = false,
    } = {}) {
      if (initial) {
        setLoading(true);
      }

      try {
        /*
         * IMPORTANT:
         *
         * This is now ONE backend request.
         *
         * Old:
         * 46 x /aqi/live
         *
         * New:
         * 1 x /aqi/live-network
         */
        const networkData =
          await getLiveAQINetwork();


        const liveNetwork =
          Array.isArray(
            networkData?.zones
          )
            ? networkData.zones
            : [];


        const normalizedZones =
          liveNetwork.map(
            (zone) => ({
              ...zone,

              current_aqi:
                zone.aqi,

              risk_level:
                zone.category ??
                "UNKNOWN",

              timestamp:
                zone
                  .air_quality_timestamp ??
                zone
                  .weather_timestamp ??
                null,

              source:
                zone.source ??
                "open_meteo",

              live:
                zone.live !== false &&
                zone.aqi !== null &&
                zone.aqi !==
                  undefined,

              trend: 0,
            })
          );


        if (!cancelled) {
          setZones(
            normalizedZones
          );

          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          /*
           * Keep previous live data
           * if an automatic refresh
           * temporarily fails.
           */
          setError(
            err?.message ||
              "Unable to load live zone network."
          );
        }
      } finally {
        if (
          initial &&
          !cancelled
        ) {
          setLoading(false);
        }
      }
    }


    loadZones({
      initial: true,
    });


    const intervalId =
      window.setInterval(
        () => {
          loadZones();
        },
        REFRESH_INTERVAL_MS
      );


    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        loadZones();
      }
    }


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    return () => {
      cancelled = true;

      window.clearInterval(
        intervalId
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);


  return {
    zones,
    loading,
    error,
  };
}