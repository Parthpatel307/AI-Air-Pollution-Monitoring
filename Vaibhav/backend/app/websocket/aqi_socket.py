"""AQI WebSocket endpoint.

Provides a `/ws/aqi` WebSocket route that accepts subscriptions. This is a
minimal implementation that accepts a connection and waits for a simple
subscription message. It intentionally does not expose any private data or
credentials.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import manager
import json

router = APIRouter()


@router.websocket("/ws/aqi")
async def websocket_aqi(websocket: WebSocket):
	await websocket.accept()
	await manager.connect(websocket)

	try:
		while True:
			text = await websocket.receive_text()

			# Expect JSON like {"subscribe": ["zone_001"]}
			try:
				payload = json.loads(text)
			except Exception:
				await websocket.send_text(json.dumps({"error": "invalid message format"}))
				continue

			if "subscribe" in payload:
				zones = payload["subscribe"]
				if not isinstance(zones, list) or not all(isinstance(zone, str) for zone in zones):
					await websocket.send_text(json.dumps({"success": False, "error": {"code": "INVALID_SUBSCRIPTION", "message": "subscribe must be a list of zone IDs."}}))
					continue
				for zone in zones:
					await manager.subscribe(websocket, zone)

				await websocket.send_text(json.dumps({"success": True, "message": "subscribed"}))
			elif "unsubscribe" in payload:
				zones = payload["unsubscribe"]
				if not isinstance(zones, list) or not all(isinstance(zone, str) for zone in zones):
					await websocket.send_text(json.dumps({"success": False, "error": {"code": "INVALID_SUBSCRIPTION", "message": "unsubscribe must be a list of zone IDs."}}))
					continue
				for zone in zones:
					await manager.unsubscribe(websocket, zone)

				await websocket.send_text(json.dumps({"success": True, "message": "unsubscribed"}))
			else:
				await websocket.send_text(json.dumps({"success": False, "error": {"code": "UNKNOWN_COMMAND", "message": "Unknown websocket command."}}))

	except WebSocketDisconnect:
		await manager.disconnect(websocket)
		return
	except Exception:
		await manager.disconnect(websocket)
		return