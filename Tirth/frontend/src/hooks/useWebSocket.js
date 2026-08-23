import { useEffect, useRef, useState } from "react";

export function useWebSocket(zoneIds = []) {
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const WS_URL =
      import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/aqi";

    const socket = new WebSocket(WS_URL);

    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      setError(null);

      socket.send(
        JSON.stringify({
          action: "subscribe",
          zone_ids: zoneIds,
        })
      );
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setLastEvent(parsed);
      } catch {
        setError("Invalid WebSocket message received.");
      }
    };

    socket.onerror = () => {
      setError("WebSocket connection error.");
    };

    socket.onclose = () => {
      setConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [JSON.stringify(zoneIds)]);

  return {
    connected,
    lastEvent,
    error,
  };
}