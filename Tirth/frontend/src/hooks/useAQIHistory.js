import {
  useEffect,
  useState,
} from "react";

import {
  getLiveAQIHistory,
} from "../services/aqiService";


export function useAQIHistory(
  zoneId,
  hours = 24
) {
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


    async function loadHistory() {
      if (!zoneId) {
        setData(null);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);


      try {
        const result =
          await getLiveAQIHistory({
            zoneId,
            hours,
          });


        /*
         * Backend history-live returns:
         *
         * {
         *   success: true,
         *   data: {
         *     zone_id,
         *     readings: [...]
         *   }
         * }
         *
         * This also supports apiRequest
         * implementations that already
         * unwrap "data".
         */
        const normalized =
          result?.data?.readings
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
              "Unable to load AQI history."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }


    loadHistory();


    return () => {
      cancelled = true;
    };
  }, [
    zoneId,
    hours,
  ]);


  return {
    data,
    loading,
    error,
  };
}