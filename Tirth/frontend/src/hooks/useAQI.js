import { useEffect, useState } from "react";
import { getCurrentAQI } from "../services/aqiService";

export function useAQI(zoneId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAQI() {
      setLoading(true);
      setError(null);

      try {
        const result = await getCurrentAQI(zoneId);

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

    loadAQI();

    return () => {
      cancelled = true;
    };
  }, [zoneId]);

  return {
    data,
    loading,
    error,
  };
}