import asyncio
import json
import inspect
from typing import Any, Dict, Set


class WebSocketManager:
    def __init__(self) -> None:
        # Mapping zone_id -> set of websocket connections
        self._subscriptions: Dict[str, Set[Any]] = {}
        self._connections: Set[Any] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: Any) -> None:
        async with self._lock:
            self._connections.add(websocket)

    async def disconnect(self, websocket: Any) -> None:
        async with self._lock:
            self._connections.discard(websocket)
            # remove from any subscription sets
            for subs in self._subscriptions.values():
                subs.discard(websocket)

    async def subscribe(self, websocket: Any, zone_id: str) -> None:
        async with self._lock:
            self._subscriptions.setdefault(zone_id, set()).add(websocket)

    async def unsubscribe(self, websocket: Any, zone_id: str) -> None:
        async with self._lock:
            if zone_id in self._subscriptions:
                self._subscriptions[zone_id].discard(websocket)
                if not self._subscriptions[zone_id]:
                    del self._subscriptions[zone_id]

    async def broadcast_event(self, event_type: str, data: dict, zone_id: str | None = None) -> None:
        payload = json.dumps({"event": event_type, "data": data})

        targets = []
        async with self._lock:
            if zone_id:
                targets = list(self._subscriptions.get(zone_id, []))
            else:
                targets = list(self._connections)

        deliveries = []
        for ws in targets:
            send = getattr(ws, "send_text", None)
            if send is None:
                continue

            if inspect.iscoroutinefunction(send):
                deliveries.append((ws, send(payload)))
            else:
                # call sync send_text in threadpool
                loop = asyncio.get_running_loop()
                deliveries.append((ws, loop.run_in_executor(None, send, payload)))

        if deliveries:
            results = await asyncio.gather(
                *(delivery[1] for delivery in deliveries),
                return_exceptions=True,
            )
            for (websocket, _), result in zip(deliveries, results):
                if isinstance(result, Exception):
                    await self.disconnect(websocket)


# singleton manager instance
manager = WebSocketManager()
