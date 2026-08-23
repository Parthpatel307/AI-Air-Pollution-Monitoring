import { useEffect, useState } from "react";
import { getForecast } from "../services/forecastService";

export function useForecast(zoneId, hours = 24) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadForecast() {
      setLoading(true);
      setError(null);

      try {
        const result = await getForecast({
          zoneId,
          hours,
        });

        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadForecast();

    return () => {
      cancelled = true;
    };
  }, [zoneId, hours]);

  return {
    data,
    loading,
    error,
  };
}