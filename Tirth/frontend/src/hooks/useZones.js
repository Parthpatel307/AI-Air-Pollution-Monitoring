import { useEffect, useState } from "react";

import {
  getZones,
} from "../services/zoneService";

import {
  getCurrentAQI,
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
        const zoneData =
          await getZones();

        const zonesWithAQI =
          await Promise.all(
            (zoneData || []).map(
              async (zone) => {
                try {
                  const aqiData =
                    await getCurrentAQI(
                      zone.zone_id
                    );

                  return {
                    ...zone,

                    current_aqi:
                      aqiData.aqi,

                    aqi:
                      aqiData.aqi,

                    pm25:
                      aqiData.pm25,

                    pm10:
                      aqiData.pm10,

                    no2:
                      aqiData.no2,

                    so2:
                      aqiData.so2,

                    co:
                      aqiData.co,

                    o3:
                      aqiData.o3,

                    temperature:
                      aqiData.temperature,

                    humidity:
                      aqiData.humidity,

                    wind_speed:
                      aqiData.wind_speed,

                    category:
                      aqiData.category,

                    risk_level:
                      aqiData.category,

                    timestamp:
                      aqiData
                        .air_quality_timestamp ??
                      aqiData
                        .weather_timestamp ??
                      null,

                    source:
                      aqiData.source ??
                      "open_meteo",

                    live: true,

                    trend: 0,
                  };
                } catch (err) {
                  return {
                    ...zone,

                    current_aqi:
                      null,

                    aqi:
                      null,

                    live: false,

                    error:
                      err?.message ??
                      "Live AQI unavailable",
                  };
                }
              }
            )
          );

        if (!cancelled) {
          setZones(
            zonesWithAQI
          );

          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load zones."
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