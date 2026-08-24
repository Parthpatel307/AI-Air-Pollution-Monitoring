"""AI routes."""

from pathlib import Path
import sys
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database import get_firestore
from app.dependencies import require_roles


router = APIRouter(
    prefix="/api/v1/ai",
    tags=["AI"],
)


# ---------------------------------------------------------
# Parth AI/ML integration path
# ---------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parents[4]
PARTH_AI_ML_PATH = REPO_ROOT / "Parth" / "ai-ml"

if str(PARTH_AI_ML_PATH) not in sys.path:
    sys.path.insert(0, str(PARTH_AI_ML_PATH))


def _load_parth_integrations():
    """
    Lazy-load Parth AI/ML public integration functions.

    Lazy import keeps backend startup safe even when an optional
    AI dependency is unavailable.
    """

    try:
        from integration.gemini import (
            run_air_quality_analysis,
            run_forecast_explanation,
            run_chat,
        )

        from integration.source_detection import (
            run_source_detection,
        )

        from integration.vision import (
            run_evidence_analysis,
        )

        return {
            "air_quality": run_air_quality_analysis,
            "forecast_explanation": run_forecast_explanation,
            "chat": run_chat,
            "source_detection": run_source_detection,
            "evidence": run_evidence_analysis,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "success": False,
                "error": {
                    "code": "AI_MODULE_LOAD_FAILED",
                    "message": str(exc),
                },
            },
        ) from exc


def _get_latest_aqi_reading(
    zone_id: str,
) -> dict[str, Any]:
    db = get_firestore()

    zone_document = (
        db.collection("zones")
        .document(zone_id)
        .get()
    )

    if not zone_document.exists:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "ZONE_NOT_FOUND",
                    "message": (
                        f"Zone '{zone_id}' was not found."
                    ),
                },
            },
        )

    documents = (
        db.collection("aqi_readings")
        .where("zone_id", "==", zone_id)
        .order_by(
            "timestamp",
            direction="DESCENDING",
        )
        .limit(1)
        .stream()
    )

    readings = list(documents)

    if not readings:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "AQI_DATA_NOT_FOUND",
                    "message": (
                        f"No AQI data found for zone "
                        f"'{zone_id}'."
                    ),
                },
            },
        )

    return readings[0].to_dict()


def _number(
    data: dict[str, Any],
    key: str,
    default: float = 0.0,
) -> float:
    value = data.get(key, default)

    if value is None:
        return default

    try:
        return float(value)
    except (TypeError, ValueError):
        return default


# ---------------------------------------------------------
# Existing lightweight insight endpoint
# ---------------------------------------------------------

@router.get("/insights")
def get_ai_insights(
    zone_id: str = Query(...),
) -> dict:
    reading = _get_latest_aqi_reading(
        zone_id
    )

    aqi = _number(
        reading,
        "aqi",
    )

    if aqi >= 201:
        risk_level = "SEVERE"
        recommendation = (
            "Avoid outdoor exposure and follow "
            "local health advisories."
        )

    elif aqi >= 151:
        risk_level = "HIGH"
        recommendation = (
            "Reduce prolonged outdoor activity "
            "and use protective measures."
        )

    elif aqi >= 101:
        risk_level = "MODERATE"
        recommendation = (
            "Sensitive individuals should reduce "
            "prolonged outdoor activity."
        )

    else:
        risk_level = "LOW"
        recommendation = (
            "Air quality is relatively acceptable "
            "for normal outdoor activity."
        )

    return {
        "success": True,
        "data": {
            "zone_id": zone_id,
            "aqi": aqi,
            "risk_level": risk_level,
            "recommendation": recommendation,
        },
    }


# ---------------------------------------------------------
# Pollution source detection
# ---------------------------------------------------------

@router.post("/source-detection")
def ai_source_detection(
    payload: dict,
    user: dict = Depends(
        require_roles(
            ["AUTHORITY", "ADMIN"]
        )
    ),
) -> dict:
    integrations = _load_parth_integrations()

    zone_id = payload.get(
        "zone_id"
    )

    if not zone_id:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "ZONE_ID_REQUIRED",
                    "message": "zone_id is required.",
                },
            },
        )

    # Frontend sends pollutants and weather separately.
    pollutants = (
        payload.get("pollutants")
        or {}
    )

    weather = (
        payload.get("weather")
        or {}
    )

    if not isinstance(
        pollutants,
        dict,
    ):
        pollutants = {}

    if not isinstance(
        weather,
        dict,
    ):
        weather = {}

    reading = _get_latest_aqi_reading(
        zone_id
    )

    source_input = {
        "zone_id": zone_id,
        "aqi": _number(
            pollutants,
            "aqi",
            _number(
                reading,
                "aqi",
            ),
        ),
        "pm25": _number(
            pollutants,
            "pm25",
            _number(
                reading,
                "pm25",
            ),
        ),
        "pm10": _number(
            pollutants,
            "pm10",
            _number(
                reading,
                "pm10",
            ),
        ),
        "no2": _number(
            pollutants,
            "no2",
            _number(
                reading,
                "no2",
            ),
        ),
        "so2": _number(
            pollutants,
            "so2",
            _number(
                reading,
                "so2",
            ),
        ),
        "co": _number(
            pollutants,
            "co",
            _number(
                reading,
                "co",
            ),
        ),
        "temperature": _number(
            weather,
            "temperature",
            _number(
                reading,
                "temperature",
            ),
        ),
        "humidity": _number(
            weather,
            "humidity",
            _number(
                reading,
                "humidity",
            ),
        ),
        "wind_speed": _number(
            weather,
            "wind_speed",
            _number(
                reading,
                "wind_speed",
            ),
        ),
    }

    try:
        return integrations[
            "source_detection"
        ](
            source_input
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "SOURCE_DETECTION_FAILED"
                    ),
                    "message": str(exc),
                },
            },
        ) from exc


# ---------------------------------------------------------
# Gemini AQI analysis
# ---------------------------------------------------------

@router.post("/analyze")
def ai_analyze(
    payload: dict,
    user: dict = Depends(
        require_roles(
            [
                "AUTHORITY",
                "ADMIN",
                "CITIZEN",
            ]
        )
    ),
) -> dict:
    integrations = _load_parth_integrations()

    zone_id = payload.get(
        "zone_id"
    )

    question = payload.get(
        "question"
    )

    if not zone_id:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "ZONE_ID_REQUIRED",
                    "message": "zone_id is required.",
                },
            },
        )

    if not question:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "QUESTION_REQUIRED",
                    "message": "question is required.",
                },
            },
        )

    reading = _get_latest_aqi_reading(
        zone_id
    )

    try:
        return integrations[
            "air_quality"
        ](
            zone_id=zone_id,
            aqi=_number(
                reading,
                "aqi",
            ),
            pm25=_number(
                reading,
                "pm25",
            ),
            pm10=_number(
                reading,
                "pm10",
            ),
            no2=_number(
                reading,
                "no2",
            ),
            so2=_number(
                reading,
                "so2",
            ),
            co=_number(
                reading,
                "co",
            ),
            temperature=_number(
                reading,
                "temperature",
            ),
            humidity=_number(
                reading,
                "humidity",
            ),
            wind_speed=_number(
                reading,
                "wind_speed",
            ),
            question=str(
                question
            ),
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "AI_ANALYSIS_FAILED"
                    ),
                    "message": str(exc),
                },
            },
        ) from exc


# ---------------------------------------------------------
# Gemini chat
# ---------------------------------------------------------

@router.post("/chat")
def ai_chat(
    payload: dict,
    user: dict = Depends(
        require_roles(
            [
                "AUTHORITY",
                "ADMIN",
                "CITIZEN",
            ]
        )
    ),
) -> dict:
    integrations = _load_parth_integrations()

    message = payload.get(
        "message"
    )

    zone_id = payload.get(
        "zone_id"
    )

    if not message:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "MESSAGE_REQUIRED",
                    "message": "message is required.",
                },
            },
        )

    if not zone_id:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "ZONE_ID_REQUIRED",
                    "message": "zone_id is required.",
                },
            },
        )

    reading = _get_latest_aqi_reading(
        zone_id
    )

    # Load human-readable zone information so Gemini
    # understands that e.g. zone_001 may represent Ahmedabad.
    db = get_firestore()

    zone_document = (
        db.collection("zones")
        .document(zone_id)
        .get()
    )

    zone_data = (
        zone_document.to_dict()
        if zone_document.exists
        else {}
    )

    if not isinstance(
        zone_data,
        dict,
    ):
        zone_data = {}

    zone_name = str(
        zone_data.get(
            "name",
            zone_id,
        )
    )

    risk_level = str(
        zone_data.get(
            "risk_level",
            "UNKNOWN",
        )
    )

    reading_timestamp = reading.get(
        "timestamp"
    )

    if reading_timestamp is not None:
        reading_timestamp = str(
            reading_timestamp
        )

    context = {
        "zone_id": zone_id,
        "zone_name": zone_name,
        "latitude": _number(
            zone_data,
            "latitude",
        ),
        "longitude": _number(
            zone_data,
            "longitude",
        ),
        "risk_level": risk_level,
        "aqi": _number(
            reading,
            "aqi",
        ),
        "pm25": _number(
            reading,
            "pm25",
        ),
        "pm10": _number(
            reading,
            "pm10",
        ),
        "no2": _number(
            reading,
            "no2",
        ),
        "so2": _number(
            reading,
            "so2",
        ),
        "co": _number(
            reading,
            "co",
        ),
        "temperature": _number(
            reading,
            "temperature",
        ),
        "humidity": _number(
            reading,
            "humidity",
        ),
        "wind_speed": _number(
            reading,
            "wind_speed",
        ),
        "reading_timestamp": (
            reading_timestamp
        ),
    }

    try:
        return integrations[
            "chat"
        ](
            message=str(
                message
            ),
            zone_id=zone_id,
            context=context,
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": {
                    "code": "AI_CHAT_FAILED",
                    "message": str(exc),
                },
            },
        ) from exc


# ---------------------------------------------------------
# Gemini forecast explanation
# ---------------------------------------------------------

@router.post("/forecast/explain")
def ai_forecast_explain(
    payload: dict,
    user: dict = Depends(
        require_roles(
            ["AUTHORITY", "ADMIN"]
        )
    ),
) -> dict:
    integrations = _load_parth_integrations()

    zone_id = payload.get(
        "zone_id"
    )

    forecast = payload.get(
        "forecast"
    )

    if not zone_id:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "ZONE_ID_REQUIRED",
                    "message": "zone_id is required.",
                },
            },
        )

    # Frontend may send complete forecast array
    # or a single forecast object.
    if isinstance(
        forecast,
        list,
    ):
        forecast_item = (
            forecast[0]
            if forecast
            else {}
        )

    elif isinstance(
        forecast,
        dict,
    ):
        forecast_item = forecast

    else:
        forecast_item = {}

    # If frontend does not provide forecast,
    # use latest stored Firestore forecast.
    if not forecast_item:
        db = get_firestore()

        forecast_documents = (
            db.collection("forecasts")
            .where(
                "zone_id",
                "==",
                zone_id,
            )
            .order_by(
                "timestamp"
            )
            .limit(1)
            .stream()
        )

        records = list(
            forecast_documents
        )

        if not records:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": {
                        "code": (
                            "FORECAST_DATA_NOT_FOUND"
                        ),
                        "message": (
                            "No forecast data found "
                            f"for zone '{zone_id}'."
                        ),
                    },
                },
            )

        forecast_item = (
            records[0].to_dict()
        )

    predicted_aqi = _number(
        forecast_item,
        "predicted_aqi",
    )

    risk_level = str(
        forecast_item.get(
            "risk_level",
            "UNKNOWN",
        )
    )

    confidence = _number(
        forecast_item,
        "confidence",
    )

    key_factors = (
        forecast_item.get(
            "key_factors",
            [],
        )
    )

    if not isinstance(
        key_factors,
        list,
    ):
        key_factors = []

    try:
        return integrations[
            "forecast_explanation"
        ](
            zone_id=zone_id,
            predicted_aqi=predicted_aqi,
            risk_level=risk_level,
            confidence=confidence,
            key_factors=[
                str(item)
                for item in key_factors
            ],
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "FORECAST_EXPLANATION_FAILED"
                    ),
                    "message": str(exc),
                },
            },
        ) from exc


# ---------------------------------------------------------
# Vision evidence analysis
# ---------------------------------------------------------

@router.post("/evidence/analyze")
def ai_evidence_analyze(
    payload: dict,
    user: dict = Depends(
        require_roles(
            ["AUTHORITY", "ADMIN"]
        )
    ),
) -> dict:
    integrations = _load_parth_integrations()

    evidence_id = payload.get(
        "evidence_id"
    )

    if not evidence_id:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "EVIDENCE_ID_REQUIRED"
                    ),
                    "message": (
                        "evidence_id is required."
                    ),
                },
            },
        )

    db = get_firestore()

    evidence_document = (
        db.collection("evidence")
        .document(
            str(evidence_id)
        )
        .get()
    )

    if not evidence_document.exists:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "EVIDENCE_NOT_FOUND"
                    ),
                    "message": (
                        f"Evidence '{evidence_id}' "
                        "was not found."
                    ),
                },
            },
        )

    evidence = (
        evidence_document.to_dict()
        or {}
    )

    storage_path = evidence.get(
        "storage_path"
    )

    if not storage_path:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "EVIDENCE_FILE_NOT_FOUND"
                    ),
                    "message": (
                        "Evidence storage path "
                        "is unavailable."
                    ),
                },
            },
        )

    content_type = str(
        evidence.get(
            "content_type",
            "",
        )
    )

    if not content_type.startswith(
        "image/"
    ):
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "IMAGE_EVIDENCE_REQUIRED"
                    ),
                    "message": (
                        "AI vision analysis currently "
                        "supports image evidence only."
                    ),
                },
            },
        )

    image_path = Path(
        storage_path
    )

    if not image_path.is_absolute():
        backend_root = (
            Path(__file__)
            .resolve()
            .parents[2]
        )

        image_path = (
            backend_root
            / image_path
        )

    if not image_path.exists():
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "EVIDENCE_FILE_MISSING"
                    ),
                    "message": (
                        "The uploaded evidence file "
                        "does not exist on disk."
                    ),
                },
            },
        )

    try:
        return integrations[
            "evidence"
        ](
            str(image_path)
        )

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "EVIDENCE_ANALYSIS_FAILED"
                    ),
                    "message": str(exc),
                },
            },
        ) from exc