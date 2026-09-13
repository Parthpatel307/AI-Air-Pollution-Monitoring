"""AI routes."""

from pathlib import Path
import sys
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.database import get_firestore
from app.dependencies import require_roles
from app.integrations.open_meteo import (
    get_live_environment_data,
)


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
    sys.path.insert(
        0,
        str(PARTH_AI_ML_PATH),
    )


def _load_parth_integrations():
    """
    Lazy-load Parth AI/ML public integration functions.
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


# ---------------------------------------------------------
# Common helpers
# ---------------------------------------------------------

def _number(
    data: dict[str, Any],
    key: str,
    default: float = 0.0,
) -> float:
    value = data.get(
        key,
        default,
    )

    if value is None:
        return default

    try:
        return float(value)

    except (
        TypeError,
        ValueError,
    ):
        return default


def _get_zone(
    zone_id: str,
) -> dict[str, Any]:
    """
    Load zone information from Firestore.
    """

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

    zone = (
        zone_document.to_dict()
        or {}
    )

    zone["zone_id"] = zone_id

    return zone


def _get_latest_aqi_reading(
    zone_id: str,
) -> dict[str, Any]:
    """
    Load latest stored Firestore AQI reading.
    """

    _get_zone(
        zone_id
    )

    db = get_firestore()

    documents = (
        db.collection("aqi_readings")
        .where(
            "zone_id",
            "==",
            zone_id,
        )
        .order_by(
            "timestamp",
            direction="DESCENDING",
        )
        .limit(1)
        .stream()
    )

    readings = list(
        documents
    )

    if not readings:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": "AQI_DATA_NOT_FOUND",
                    "message": (
                        "No AQI data found for zone "
                        f"'{zone_id}'."
                    ),
                },
            },
        )

    return (
        readings[0].to_dict()
        or {}
    )


def _get_live_ai_context(
    zone_id: str,
) -> dict[str, Any]:
    """
    Get live/current air-quality + weather data.

    Open-Meteo is the primary source.
    Firestore is used as a fallback if live data
    is temporarily unavailable.
    """

    zone = _get_zone(
        zone_id
    )

    latitude = zone.get(
        "latitude"
    )

    longitude = zone.get(
        "longitude"
    )

    if (
        latitude is None
        or longitude is None
    ):
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "ZONE_COORDINATES_MISSING",
                    "message": (
                        "Latitude and longitude are "
                        "required for live AI data."
                    ),
                },
            },
        )

    try:
        latitude = float(
            latitude
        )

        longitude = float(
            longitude
        )

    except (
        TypeError,
        ValueError,
    ) as exc:
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code": "INVALID_ZONE_COORDINATES",
                    "message": (
                        "Zone latitude or longitude "
                        "is invalid."
                    ),
                },
            },
        ) from exc

    # -----------------------------------------------------
    # Primary source: Open-Meteo
    # -----------------------------------------------------

    try:
        live_data = (
            get_live_environment_data(
                latitude=latitude,
                longitude=longitude,
            )
        )

        air_quality = (
            live_data.get(
                "air_quality"
            )
            or {}
        )

        weather = (
            live_data.get(
                "weather"
            )
            or {}
        )

        return {
            "zone_id": zone_id,

            "zone_name": str(
                zone.get(
                    "name",
                    zone_id,
                )
            ),

            "latitude": latitude,
            "longitude": longitude,

            "data_source": (
                "open_meteo_live"
            ),

            "aqi": _number(
                air_quality,
                "aqi",
            ),

            "category": str(
                air_quality.get(
                    "category",
                    "UNKNOWN",
                )
            ),

            "pm25": _number(
                air_quality,
                "pm25",
            ),

            "pm10": _number(
                air_quality,
                "pm10",
            ),

            "no2": _number(
                air_quality,
                "no2",
            ),

            "so2": _number(
                air_quality,
                "so2",
            ),

            "co": _number(
                air_quality,
                "co",
            ),

            "o3": _number(
                air_quality,
                "o3",
            ),

            "temperature": _number(
                weather,
                "temperature",
            ),

            "humidity": _number(
                weather,
                "humidity",
            ),

            "wind_speed": _number(
                weather,
                "wind_speed",
            ),

            "wind_direction": _number(
                weather,
                "wind_direction",
            ),

            "feels_like": _number(
                weather,
                "feels_like",
            ),

            "cloud_cover": _number(
                weather,
                "cloud_cover",
            ),

            "risk_level": str(
                zone.get(
                    "risk_level",
                    "UNKNOWN",
                )
            ),

            "air_quality_timestamp": (
                air_quality.get(
                    "timestamp"
                )
            ),

            "weather_timestamp": (
                weather.get(
                    "timestamp"
                )
            ),
        }

    except HTTPException:
        raise

    except Exception:
        # -------------------------------------------------
        # Fallback: existing Firestore AQI data
        # -------------------------------------------------

        reading = (
            _get_latest_aqi_reading(
                zone_id
            )
        )

        timestamp = reading.get(
            "timestamp"
        )

        if timestamp is not None:
            timestamp = str(
                timestamp
            )

        return {
            "zone_id": zone_id,

            "zone_name": str(
                zone.get(
                    "name",
                    zone_id,
                )
            ),

            "latitude": latitude,
            "longitude": longitude,

            "data_source": (
                "firestore_fallback"
            ),

            "aqi": _number(
                reading,
                "aqi",
            ),

            "category": str(
                reading.get(
                    "category",
                    "UNKNOWN",
                )
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

            "o3": _number(
                reading,
                "o3",
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

            "wind_direction": _number(
                reading,
                "wind_direction",
            ),

            "feels_like": _number(
                reading,
                "temperature",
            ),

            "cloud_cover": _number(
                reading,
                "cloud_cover",
            ),

            "risk_level": str(
                zone.get(
                    "risk_level",
                    "UNKNOWN",
                )
            ),

            "air_quality_timestamp": (
                timestamp
            ),

            "weather_timestamp": (
                timestamp
            ),
        }


# ---------------------------------------------------------
# Existing lightweight insight endpoint
# ---------------------------------------------------------

@router.get("/insights")
def get_ai_insights(
    zone_id: str = Query(...),
) -> dict:
    reading = (
        _get_latest_aqi_reading(
            zone_id
        )
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
            [
                "AUTHORITY",
                "ADMIN",
            ]
        )
    ),
) -> dict:
    integrations = (
        _load_parth_integrations()
    )

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
                    "message": (
                        "zone_id is required."
                    ),
                },
            },
        )

    pollutants = (
        payload.get(
            "pollutants"
        )
        or {}
    )

    weather = (
        payload.get(
            "weather"
        )
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

    reading = (
        _get_latest_aqi_reading(
            zone_id
        )
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
# Gemini AQI analysis - LIVE DATA
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
    integrations = (
        _load_parth_integrations()
    )

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
                    "message": (
                        "zone_id is required."
                    ),
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
                    "message": (
                        "question is required."
                    ),
                },
            },
        )

    # Live Open-Meteo context
    context = (
        _get_live_ai_context(
            zone_id
        )
    )

    try:
        result = integrations[
            "air_quality"
        ](
            zone_id=zone_id,

            aqi=context[
                "aqi"
            ],

            pm25=context[
                "pm25"
            ],

            pm10=context[
                "pm10"
            ],

            no2=context[
                "no2"
            ],

            so2=context[
                "so2"
            ],

            co=context[
                "co"
            ],

            temperature=context[
                "temperature"
            ],

            humidity=context[
                "humidity"
            ],

            wind_speed=context[
                "wind_speed"
            ],

            question=str(
                question
            ),
        )

        # Add metadata without breaking
        # Parth's existing response contract.
        if isinstance(
            result,
            dict,
        ):
            result.setdefault(
                "zone_name",
                context[
                    "zone_name"
                ],
            )

            result.setdefault(
                "data_source",
                context[
                    "data_source"
                ],
            )

            result.setdefault(
                "live_aqi",
                context[
                    "aqi"
                ],
            )

            result.setdefault(
                "data_timestamp",
                context[
                    "air_quality_timestamp"
                ],
            )

        return result

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
# Gemini chat - LIVE DATA
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
    integrations = (
        _load_parth_integrations()
    )

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
                    "message": (
                        "message is required."
                    ),
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
                    "message": (
                        "zone_id is required."
                    ),
                },
            },
        )

    context = (
        _get_live_ai_context(
            zone_id
        )
    )

    try:
        result = integrations[
            "chat"
        ](
            message=str(
                message
            ),
            zone_id=zone_id,
            context=context,
        )

        if isinstance(
            result,
            dict,
        ):
            result.setdefault(
                "data_source",
                context[
                    "data_source"
                ],
            )

            result.setdefault(
                "live_aqi",
                context[
                    "aqi"
                ],
            )

            result.setdefault(
                "data_timestamp",
                context[
                    "air_quality_timestamp"
                ],
            )

        return result

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
            [
                "AUTHORITY",
                "ADMIN",
            ]
        )
    ),
) -> dict:
    integrations = (
        _load_parth_integrations()
    )

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
                    "message": (
                        "zone_id is required."
                    ),
                },
            },
        )

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

    if not forecast_item:
        db = get_firestore()

        forecast_documents = (
            db.collection(
                "forecasts"
            )
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
            or {}
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
            [
                "AUTHORITY",
                "ADMIN",
            ]
        )
    ),
) -> dict:
    integrations = (
        _load_parth_integrations()
    )

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
        db.collection(
            "evidence"
        )
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

    storage_path = (
        evidence.get(
            "storage_path"
        )
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
            str(
                image_path
            )
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