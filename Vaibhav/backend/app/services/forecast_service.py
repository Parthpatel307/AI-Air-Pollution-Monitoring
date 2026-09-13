"""Live AQI forecast service."""

from datetime import datetime

from fastapi import HTTPException

from app.database import get_firestore
from app.integrations.open_meteo import (
    get_air_quality_forecast,
)
from app.models.forecast import ForecastRecord


def get_forecast(
    zone_id: str,
    hours: int,
) -> list[ForecastRecord]:
    """
    Return live hourly AQI forecast
    from Open-Meteo for the requested zone.
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
                        "required for live forecast."
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

    try:
        live_forecast = (
            get_air_quality_forecast(
                latitude=latitude,
                longitude=longitude,
                hours=hours,
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "success": False,
                "error": {
                    "code": (
                        "LIVE_FORECAST_UNAVAILABLE"
                    ),
                    "message": (
                        "Could not fetch live AQI "
                        "forecast from Open-Meteo."
                    ),
                },
            },
        ) from exc

    records: list[
        ForecastRecord
    ] = []

    for item in live_forecast:
        timestamp_value = (
            item.get(
                "timestamp"
            )
        )

        predicted_aqi = (
            item.get(
                "predicted_aqi"
            )
        )

        if (
            timestamp_value is None
            or predicted_aqi is None
        ):
            continue

        try:
            timestamp = (
                datetime.fromisoformat(
                    str(
                        timestamp_value
                    )
                )
            )

        except ValueError:
            continue

        records.append(
            ForecastRecord(
                zone_id=zone_id,
                timestamp=timestamp,
                predicted_aqi=float(
                    predicted_aqi
                ),
                risk_level=str(
                    item.get(
                        "risk_level",
                        "UNKNOWN",
                    )
                ),
                # Open-Meteo does not provide
                # a confidence percentage.
                confidence=0.0,
            )
        )

    return records