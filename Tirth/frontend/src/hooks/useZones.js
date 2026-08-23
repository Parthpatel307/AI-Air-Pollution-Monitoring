import { useEffect, useState } from "react";
import { getZones } from "../services/zoneService";
import { getCurrentAQI } from "../services/aqiService";

export function useZones() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadZones() {
      setLoading(true);
      setError(null);

      try {
        const zoneData = await getZones();

        const zonesWithAQI = await Promise.all(
          (zoneData || []).map(async (zone) => {
            try {
              const aqiData = await getCurrentAQI(zone.zone_id);

              return {
                ...zone,
                aqi: aqiData.aqi,
                pm25: aqiData.pm25,
                pm10: aqiData.pm10,
                risk_level: aqiData.category,
                trend: 0,
              };
            } catch {
              return {
                ...zone,
                aqi: 0,
                pm25: 0,
                pm10: 0,
                risk_level: zone.risk_level || "UNKNOWN",
                trend: 0,
              };
            }
          })
        );

        if (!cancelled) {
          setZones(zonesWithAQI);
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

    loadZones();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    zones,
    loading,
    error,
  };
}