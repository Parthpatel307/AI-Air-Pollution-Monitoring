import asyncio
import json

from app.services.websocket_manager import WebSocketManager


class DummyWS:
    def __init__(self):
        self.sent = []

    async def send_text(self, text):
        self.sent.append(text)


class FailingWS:
    async def send_text(self, text):
        raise RuntimeError("disconnected")


def test_subscribe_and_broadcast():
    mgr = WebSocketManager()
    ws = DummyWS()

    async def _run():
        await mgr.connect(ws)
        await mgr.subscribe(ws, "zone_001")
        await mgr.broadcast_event("AQI_UPDATED", {"aqi": 50}, zone_id="zone_001")
        assert len(ws.sent) == 1
        payload = json.loads(ws.sent[0])
        assert payload == {"event": "AQI_UPDATED", "data": {"aqi": 50}}

    asyncio.run(_run())


def test_broadcast_filters_by_zone_and_unsubscribe_removes_target():
    mgr = WebSocketManager()
    zone_one = DummyWS()
    zone_two = DummyWS()

    async def _run():
        await mgr.connect(zone_one)
        await mgr.connect(zone_two)
        await mgr.subscribe(zone_one, "zone_001")
        await mgr.subscribe(zone_two, "zone_002")
        await mgr.broadcast_event("HOTSPOT_DETECTED", {"id": "hotspot-1"}, zone_id="zone_001")
        await mgr.unsubscribe(zone_one, "zone_001")
        await mgr.broadcast_event("HOTSPOT_DETECTED", {"id": "hotspot-2"}, zone_id="zone_001")

        assert len(zone_one.sent) == 1
        assert zone_two.sent == []

    asyncio.run(_run())


def test_failed_websocket_is_removed_without_crashing_broadcast():
    mgr = WebSocketManager()
    failing = FailingWS()
    healthy = DummyWS()

    async def _run():
        await mgr.connect(failing)
        await mgr.connect(healthy)
        await mgr.broadcast_event("ALERT_CREATED", {"alert_id": "alert-1"})

        assert healthy.sent
        assert failing not in mgr._connections

    asyncio.run(_run())
