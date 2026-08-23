import { useEffect, useState } from "react";
import { getHotspots } from "../services/hotspotService";

export function useHotspots(zoneId) {
  const [hotspots, setHotspots] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const hotspotData = await getHotspots(zoneId);

        if (!cancelled) {
          setHotspots(hotspotData || []);
          setClusters([]);
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

    loadData();

    return () => {
      cancelled = true;
    };
  }, [zoneId]);

  return {
    hotspots,
    clusters,
    loading,
    error,
  };
}