from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Explicitly load Vaibhav/backend/.env
BACKEND_ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = BACKEND_ROOT / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

from app.routers.ai import router as ai_router
from app.routers.aqi import router as aqi_router
from app.routers.alerts import router as alerts_router
from app.routers.auth import router as auth_router
from app.routers.citizen_reports import router as citizen_reports_router
from app.routers.evidence import router as evidence_router
from app.routers.forecast import router as forecast_router
from app.routers.hotspots import router as hotspots_router
from app.routers.incidents import router as incidents_router
from app.routers.reports import router as reports_router
from app.routers.zones import router as zones_router
from app.websocket.aqi_socket import router as ws_router


app = FastAPI(
    title="AI Air Pollution Monitoring API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-air-pollution-monitoring.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health_check() -> dict:
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "service": "air-quality-api",
            "version": "1.0.0",
        },
    }


app.include_router(zones_router)
app.include_router(aqi_router)
app.include_router(forecast_router)
app.include_router(alerts_router)
app.include_router(hotspots_router)
app.include_router(incidents_router)
app.include_router(evidence_router)
app.include_router(reports_router)
app.include_router(ai_router)
app.include_router(auth_router)
app.include_router(citizen_reports_router)
app.include_router(ws_router)