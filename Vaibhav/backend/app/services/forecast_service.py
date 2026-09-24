"""Live AQI forecast service."""

from datetime import (
    datetime,
    timezone,
)

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
    Return future hourly AQI forecast
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
                    "code":
                        "ZONE_NOT_FOUND",

                    "message": (
                        f"Zone '{zone_id}' "
                        "was not found."
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
                    "code":
                        "ZONE_COORDINATES_MISSING",

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
                    "code":
                        "INVALID_ZONE_COORDINATES",

                    "message": (
                        "Zone latitude or longitude "
                        "is invalid."
                    ),
                },
            },
        ) from exc

    # Ask for one extra hour because Open-Meteo
    # can include the current hour.
    request_hours = min(
        int(hours) + 1,
        168,
    )

    try:
        live_forecast = (
            get_air_quality_forecast(
                latitude=latitude,
                longitude=longitude,
                hours=request_hours,
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "success": False,
                "error": {
                    "code":
                        "LIVE_FORECAST_UNAVAILABLE",

                    "message": (
                        "Could not fetch live AQI "
                        "forecast from Open-Meteo."
                    ),
                },
            },
        ) from exc

    now_utc = datetime.now(
        timezone.utc
    )

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

        raw_timestamp = str(
            timestamp_value
        )

        if raw_timestamp.endswith(
            "Z"
        ):
            raw_timestamp = (
                raw_timestamp[:-1]
                + "+00:00"
            )

        try:
            timestamp = (
                datetime.fromisoformat(
                    raw_timestamp
                )
            )

        except ValueError:
            continue

        if timestamp.tzinfo is None:
            timestamp = (
                timestamp.replace(
                    tzinfo=timezone.utc
                )
            )

        # IMPORTANT:
        # Never return current/past hour
        # as a future forecast.
        if timestamp <= now_utc:
            continue

        records.append(
            ForecastRecord(
                zone_id=zone_id,

                timestamp=
                    timestamp,

                predicted_aqi=
                    float(
                        predicted_aqi
                    ),

                risk_level=
                    str(
                        item.get(
                            "risk_level",
                            "UNKNOWN",
                        )
                    ),

                confidence=0.0,
            )
        )

    return records[
        :hours
    ]
