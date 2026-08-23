from app.main import app
from app.websocket.aqi_socket import router as websocket_router


def test_required_http_routes_are_registered():
    paths = set(app.openapi()["paths"])

    assert {
        "/api/v1/ai/source-detection",
        "/api/v1/ai/analyze",
        "/api/v1/ai/chat",
        "/api/v1/ai/forecast/explain",
        "/api/v1/ai/evidence/analyze",
        "/api/v1/evidence",
        "/api/v1/incidents/{incident_id}/action",
    } <= paths


def test_aqi_websocket_route_is_registered():
    assert any(route.path == "/ws/aqi" for route in websocket_router.routes)
