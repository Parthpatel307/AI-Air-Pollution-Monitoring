import { useEffect, useRef, useState } from "react";
import { getCurrentAQI } from "../services/aqiService";

const REFRESH_INTERVAL_MS = 15 * 60 * 1000;

export function useAQI(zoneId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentZoneRef = useRef(zoneId);

  useEffect(() => {
    let cancelled = false;

    currentZoneRef.current = zoneId;

    if (!zoneId) {
      setData(null);
      setLoading(false);
      setError(null);

      return undefined;
    }

    // Zone changed:
    // clear previous zone data so wrong city's AQI
    // is not temporarily displayed.
    setData(null);
    setError(null);

    async function loadAQI({
      initial = false,
    } = {}) {
      if (initial) {
        setLoading(true);
      }

      try {
        const result =
          await getCurrentAQI(zoneId);

        if (
          !cancelled &&
          currentZoneRef.current === zoneId
        ) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (
          !cancelled &&
          currentZoneRef.current === zoneId
        ) {
          setError(
            err?.message ||
              "Unable to load live AQI data."
          );

          // On automatic refresh failure,
          // keep the previous live data visible.
        }
      } finally {
        if (
          initial &&
          !cancelled &&
          currentZoneRef.current === zoneId
        ) {
          setLoading(false);
        }
      }
    }

    // Initial fetch
    loadAQI({
      initial: true,
    });

    // Refresh automatically every 15 minutes.
    const intervalId = window.setInterval(
      () => {
        loadAQI();
      },
      REFRESH_INTERVAL_MS
    );

    // Refresh when user returns to the tab.
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible"
      ) {
        loadAQI();
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
  }, [zoneId]);

  return {
    data,
    loading,
    error,
  };
}