from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException, Query

from app.database import get_firestore
from app.integrations.google_maps import (
    get_live_environment_data,
)
from app.schemas.aqi import (
    AQICurrentResponse,
    AQIHistoryResponse,
)


router = APIRouter(
    prefix="/api/v1/aqi",
    tags=["AQI"],
)


# ---------------------------------------------------------
# Existing Firestore current AQI
# ---------------------------------------------------------

@router.get(
    "/current",
    response_model=AQICurrentResponse,
)
def get_current_aqi(
    zone_id: str | None = None,
) -> AQICurrentResponse:
    db = get_firestore()

    if zone_id:
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
                            f"Zone '{zone_id}' was "
                            "not found."
                        ),
                    },
                },
            )

        zone = (
            zone_document.to_dict()
            or {}
        )

        zone["zone_id"] = (
            zone_document.id
        )

    else:
        documents = list(
            db.collection("zones")
            .limit(1)
            .stream()
        )

        if not documents:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": {
                        "code": (
                            "NO_ZONES_FOUND"
                        ),
                        "message": (
                            "No zones are available."
                        ),
                    },
                },
            )

        zone = (
            documents[0].to_dict()
            or {}
        )

        zone["zone_id"] = (
            documents[0].id
        )

    aqi_document = (
        db.collection("aqi_readings")
        .where(
            "zone_id",
            "==",
            zone["zone_id"],
        )
        .order_by(
            "timestamp",
            direction="DESCENDING",
        )
        .limit(1)
        .stream()
    )

    readings = list(
        aqi_document
    )

    if not readings:
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "AQI_DATA_NOT_FOUND"
                    ),
                    "message": (
                        "No AQI data found for zone "
                        f"'{zone['zone_id']}'."
                    ),
                },
            },
        )

    reading = (
        readings[0].to_dict()
        or {}
    )

    return AQICurrentResponse(
        zone_id=zone["zone_id"],
        zone_name=zone["name"],
        aqi=reading["aqi"],
        category=reading["category"],
        pm25=reading["pm25"],
        pm10=reading["pm10"],
        no2=reading["no2"],
        so2=reading["so2"],
        co=reading["co"],
        temperature=reading[
            "temperature"
        ],
        humidity=reading[
            "humidity"
        ],
        wind_speed=reading[
            "wind_speed"
        ],
        timestamp=reading[
            "timestamp"
        ],
    )


# ---------------------------------------------------------
# NEW: Google live AQI + Weather
# ---------------------------------------------------------

@router.get("/live")
def get_live_aqi(
    zone_id: str = Query(...),
) -> dict:
    """
    Fetch current AQI and weather data
    from Google APIs using a zone's coordinates.

    This endpoint does NOT replace /current yet.
    Firestore remains the existing fallback source.
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
                        f"Zone '{zone_id}' was "
                        "not found."
                    ),
                },
            },
        )

    zone = (
        zone_document.to_dict()
        or {}
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
                    "code": (
                        "ZONE_COORDINATES_MISSING"
                    ),
                    "message": (
                        "Latitude and longitude are "
                        "required for live data."
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
                    "code": (
                        "INVALID_ZONE_COORDINATES"
                    ),
                    "message": (
                        "Zone latitude or longitude "
                        "is invalid."
                    ),
                },
            },
        ) from exc

    try:
        live_data = (
            get_live_environment_data(
                latitude=latitude,
                longitude=longitude,
            )
        )

    except RuntimeError as exc:
        # This will happen for now because
        # GOOGLE_MAPS_API_KEY is not configured yet.
        raise HTTPException(
            status_code=503,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "LIVE_DATA_NOT_CONFIGURED"
                    ),
                    "message": str(exc),
                },
            },
        ) from exc

    except httpx.HTTPStatusError as exc:
        status_code = (
            exc.response.status_code
        )

        raise HTTPException(
            status_code=502,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "GOOGLE_LIVE_DATA_FAILED"
                    ),
                    "message": (
                        "Google live environmental "
                        "data request failed with "
                        f"status {status_code}."
                    ),
                },
            },
        ) from exc

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "GOOGLE_LIVE_DATA_UNAVAILABLE"
                    ),
                    "message": (
                        "Could not connect to the "
                        "Google live data service."
                    ),
                },
            },
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "LIVE_DATA_FAILED"
                    ),
                    "message": str(exc),
                },
            },
        ) from exc

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
        "success": True,
        "data": {
            "zone_id": zone_id,
            "zone_name": zone.get(
                "name",
                zone_id,
            ),
            "latitude": latitude,
            "longitude": longitude,

            "source": (
                "google_live"
            ),

            "aqi": air_quality.get(
                "aqi"
            ),
            "universal_aqi": (
                air_quality.get(
                    "universal_aqi"
                )
            ),
            "category": (
                air_quality.get(
                    "aqi_category"
                )
            ),
            "dominant_pollutant": (
                air_quality.get(
                    "dominant_pollutant"
                )
            ),

            "pm25": air_quality.get(
                "pm25"
            ),
            "pm10": air_quality.get(
                "pm10"
            ),
            "no2": air_quality.get(
                "no2"
            ),
            "so2": air_quality.get(
                "so2"
            ),
            "co": air_quality.get(
                "co"
            ),

            "temperature": (
                weather.get(
                    "temperature"
                )
            ),
            "feels_like": (
                weather.get(
                    "feels_like"
                )
            ),
            "humidity": (
                weather.get(
                    "humidity"
                )
            ),
            "wind_speed": (
                weather.get(
                    "wind_speed"
                )
            ),
            "wind_direction": (
                weather.get(
                    "wind_direction"
                )
            ),
            "weather_condition": (
                weather.get(
                    "condition"
                )
            ),
            "cloud_cover": (
                weather.get(
                    "cloud_cover"
                )
            ),
            "uv_index": (
                weather.get(
                    "uv_index"
                )
            ),

            "health_recommendations": (
                air_quality.get(
                    "health_recommendations"
                )
            ),

            "air_quality_timestamp": (
                air_quality.get(
                    "date_time"
                )
            ),
            "weather_timestamp": (
                weather.get(
                    "current_time"
                )
            ),
        },
    }


# ---------------------------------------------------------
# Existing Firestore AQI history
# ---------------------------------------------------------

@router.get(
    "/history",
    response_model=AQIHistoryResponse,
)
def get_aqi_history(
    zone_id: str = Query(...),
    limit: int = Query(
        default=24,
        ge=1,
        le=168,
    ),
) -> AQIHistoryResponse:
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
                        f"Zone '{zone_id}' was "
                        "not found."
                    ),
                },
            },
        )

    zone = (
        zone_document.to_dict()
        or {}
    )

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
        .limit(limit)
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
                    "code": (
                        "AQI_HISTORY_NOT_FOUND"
                    ),
                    "message": (
                        "No AQI history found for "
                        f"zone '{zone_id}'."
                    ),
                },
            },
        )

    history: list[
        AQICurrentResponse
    ] = []

    for document in readings:
        data = (
            document.to_dict()
            or {}
        )

        history.append(
            AQICurrentResponse(
                zone_id=zone_id,
                zone_name=zone["name"],
                aqi=data["aqi"],
                category=data[
                    "category"
                ],
                pm25=data["pm25"],
                pm10=data["pm10"],
                no2=data["no2"],
                so2=data["so2"],
                co=data["co"],
                temperature=data[
                    "temperature"
                ],
                humidity=data[
                    "humidity"
                ],
                wind_speed=data[
                    "wind_speed"
                ],
                timestamp=data[
                    "timestamp"
                ],
            )
        )

    return AQIHistoryResponse(
        zone_id=zone_id,
        zone_name=zone["name"],
        readings=history,
    )