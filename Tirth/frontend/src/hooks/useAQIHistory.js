import { useEffect, useState } from "react";
import { getAQIHistory } from "../services/aqiService";

export function useAQIHistory(zoneId, limit = 24) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setLoading(true);
      setError(null);

      try {
        const result = await getAQIHistory({
          zoneId,
          limit,
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

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [zoneId, limit]);

  return {
    data,
    loading,
    error,
  };
}