"""AI routes."""

from fastapi import APIRouter, Query, HTTPException, Depends, status

from app.database import get_firestore
from app.dependencies import require_roles

router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI"],
)


@router.get("/insights")
def get_ai_insights(
    zone_id: str = Query(...),
) -> dict:
    db = get_firestore()

    zone_document = db.collection("zones").document(zone_id).get()

    if not zone_document.exists:
        return {
            "success": False,
            "error": {
                "code": "ZONE_NOT_FOUND",
                "message": f"Zone '{zone_id}' was not found.",
            },
        }

    aqi_documents = (
        db.collection("aqi_readings")
        .where("zone_id", "==", zone_id)
        .order_by("timestamp", direction="DESCENDING")
        .limit(1)
        .stream()
    )

    readings = list(aqi_documents)

    if not readings:
        return {
            "success": False,
            "error": {
                "code": "AQI_DATA_NOT_FOUND",
                "message": f"No AQI data found for zone '{zone_id}'.",
            },
        }

    reading = readings[0].to_dict()

    aqi = float(reading.get("aqi", 0))

    if aqi >= 201:
        risk_level = "SEVERE"
        recommendation = "Avoid outdoor exposure and follow local health advisories."
    elif aqi >= 151:
        risk_level = "HIGH"
        recommendation = "Reduce prolonged outdoor activity and use protective measures."
    elif aqi >= 101:
        risk_level = "MODERATE"
        recommendation = "Sensitive individuals should reduce prolonged outdoor activity."
    else:
        risk_level = "LOW"
        recommendation = "Air quality is relatively acceptable for normal outdoor activity."

    return {
        "success": True,
        "data": {
            "zone_id": zone_id,
            "aqi": aqi,
            "risk_level": risk_level,
            "recommendation": recommendation,
        },
    }


@router.post("/source-detection")
def ai_source_detection(
    zone_id: str,
    user: dict = Depends(require_roles(["AUTHORITY", "ADMIN"])),
) -> dict:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "success": False,
            "error": {
                "code": "AI_INTEGRATION_NOT_CONFIGURED",
                "message": "AI integrations are not configured in this environment.",
            },
        },
    )


@router.post("/analyze")
def ai_analyze(
    payload: dict,
    user: dict = Depends(require_roles(["AUTHORITY", "ADMIN"])),
) -> dict:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "success": False,
            "error": {
                "code": "AI_INTEGRATION_NOT_CONFIGURED",
                "message": "AI integrations are not configured in this environment.",
            },
        },
    )


@router.post("/chat")
def ai_chat(
    message: str,
    user: dict = Depends(require_roles(["AUTHORITY", "ADMIN"])),
) -> dict:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "success": False,
            "error": {
                "code": "AI_INTEGRATION_NOT_CONFIGURED",
                "message": "AI integrations are not configured in this environment.",
            },
        },
    )


@router.post("/forecast/explain")
def ai_forecast_explain(
    zone_id: str,
    user: dict = Depends(require_roles(["AUTHORITY", "ADMIN"])),
) -> dict:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "success": False,
            "error": {
                "code": "AI_INTEGRATION_NOT_CONFIGURED",
                "message": "AI integrations are not configured in this environment.",
            },
        },
    )


@router.post("/evidence/analyze")
def ai_evidence_analyze(
    evidence_id: str,
    user: dict = Depends(require_roles(["AUTHORITY", "ADMIN"])),
) -> dict:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail={
            "success": False,
            "error": {
                "code": "AI_INTEGRATION_NOT_CONFIGURED",
                "message": "AI integrations are not configured in this environment.",
            },
        },
    )