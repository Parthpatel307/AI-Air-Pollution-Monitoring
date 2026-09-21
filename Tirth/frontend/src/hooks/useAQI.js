import {
  useEffect,
  useState,
} from "react";

import {
  getLiveAQI,
} from "../services/aqiService";


export function useAQI(zoneId) {
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


    async function loadAQI() {
      if (!zoneId) {
        setData(null);
        setError(null);
        setLoading(false);
        return;
      }


      setLoading(true);
      setError(null);


      try {
        const result =
          await getLiveAQI(
            zoneId
          );


        /*
         * Backend may return:
         *
         * {
         *   success: true,
         *   data: {...}
         * }
         *
         * Some apiRequest versions may
         * already unwrap data.
         */
        const normalized =
          result?.data?.aqi !==
          undefined
            ? result.data
            : result;


        if (!cancelled) {
          setData(
            normalized
          );
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);

          setError(
            err?.message ||
              "Live AQI data unavailable."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    loadAQI();


    return () => {
      cancelled = true;
    };
  }, [
    zoneId,
  ]);


  return {
    data,
    loading,
    error,
  };
}