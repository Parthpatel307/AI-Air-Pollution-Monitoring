"""AQI routes."""

import logging
import httpx

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.database import (
    get_firestore,
)

from app.integrations.open_meteo import (
    get_air_quality_history,
    get_bulk_environment_data,
    get_live_environment_data,
)

from app.schemas.aqi import (
    AQICurrentResponse,
    AQIHistoryResponse,
)

from app.services.live_aqi_cache import (
    get_cached_network,
    get_cached_zone,
    save_live_network,
    save_live_zone,
)


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/aqi",
    tags=["AQI"],
)


# =========================================================
# HELPERS
# =========================================================

def _get_zone_or_404(
    zone_id: str,
) -> dict:
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

    zone["zone_id"] = (
        zone_document.id
    )

    return zone


def _get_zone_coordinates(
    zone: dict,
) -> tuple[
    float,
    float,
]:
    latitude = zone.get(
        "latitude"
    )

    longitude = zone.get(
        "longitude"
    )

    if (
        latitude is None
        or
        longitude is None
    ):
        raise HTTPException(
            status_code=400,
            detail={
                "success": False,
                "error": {
                    "code":
                        "ZONE_COORDINATES_MISSING",

                    "message": (
                        "Latitude and longitude "
                        "are required for live data."
                    ),
                },
            },
        )

    try:
        return (
            float(latitude),
            float(longitude),
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
                        "Zone latitude or "
                        "longitude is invalid."
                    ),
                },
            },
        ) from exc


def _raise_open_meteo_error(
    exc: Exception,
) -> None:
    if isinstance(
        exc,
        httpx.HTTPStatusError,
    ):
        raise HTTPException(
            status_code=502,
            detail={
                "success": False,
                "error": {
                    "code":
                        "OPEN_METEO_REQUEST_FAILED",

                    "message": (
                        "Open-Meteo returned status "
                        f"{exc.response.status_code}."
                    ),
                },
            },
        ) from exc

    if isinstance(
        exc,
        httpx.RequestError,
    ):
        raise HTTPException(
            status_code=502,
            detail={
                "success": False,
                "error": {
                    "code":
                        "OPEN_METEO_UNAVAILABLE",

                    "message": (
                        "Could not connect "
                        "to Open-Meteo."
                    ),
                },
            },
        ) from exc

    raise HTTPException(
        status_code=500,
        detail={
            "success": False,
            "error": {
                "code":
                    "LIVE_DATA_FAILED",

                "message":
                    str(exc),
            },
        },
    ) from exc


# =========================================================
# FIRESTORE CURRENT AQI
# =========================================================

@router.get(
    "/current",
    response_model=
        AQICurrentResponse,
)
def get_current_aqi(
    zone_id: str | None = None,
) -> AQICurrentResponse:
    db = get_firestore()

    if zone_id:
        zone = (
            _get_zone_or_404(
                zone_id
            )
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
                    "success":
                        False,

                    "error": {
                        "code":
                            "NO_ZONES_FOUND",

                        "message":
                            "No zones are available.",
                    },
                },
            )

        zone = (
            documents[0]
            .to_dict()
            or {}
        )

        zone["zone_id"] = (
            documents[0].id
        )

    documents = (
        db.collection(
            "aqi_readings"
        )
        .where(
            "zone_id",
            "==",
            zone["zone_id"],
        )
        .order_by(
            "timestamp",
            direction=
                "DESCENDING",
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
                "success":
                    False,

                "error": {
                    "code":
                        "AQI_DATA_NOT_FOUND",

                    "message": (
                        "No AQI data found "
                        f"for zone "
                        f"'{zone['zone_id']}'."
                    ),
                },
            },
        )

    reading = (
        readings[0]
        .to_dict()
        or {}
    )

    return AQICurrentResponse(
        zone_id=
            zone["zone_id"],

        zone_name=
            zone["name"],

        aqi=
            reading["aqi"],

        category=
            reading["category"],

        pm25=
            reading["pm25"],

        pm10=
            reading["pm10"],

        no2=
            reading["no2"],

        so2=
            reading["so2"],

        co=
            reading["co"],

        temperature=
            reading["temperature"],

        humidity=
            reading["humidity"],

        wind_speed=
            reading["wind_speed"],

        timestamp=
            reading["timestamp"],
    )


# =========================================================
# LIVE NETWORK
# =========================================================

@router.get(
    "/live-network"
)
def get_live_network() -> dict:
    db = get_firestore()

    documents = list(
        db.collection(
            "zones"
        ).stream()
    )

    if not documents:
        raise HTTPException(
            status_code=404,
            detail={
                "success":
                    False,

                "error": {
                    "code":
                        "NO_ZONES_FOUND",

                    "message":
                        "No zones are available.",
                },
            },
        )

    locations = []

    for document in documents:
        zone = (
            document.to_dict()
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
            or
            longitude is None
        ):
            continue

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
        ):
            continue

        locations.append(
            {
                "zone_id":
                    document.id,

                "name":
                    zone.get(
                        "name",
                        document.id,
                    ),

                "state":
                    zone.get(
                        "state"
                    ),

                "latitude":
                    latitude,

                "longitude":
                    longitude,
            }
        )

    if not locations:
        raise HTTPException(
            status_code=400,
            detail={
                "success":
                    False,

                "error": {
                    "code":
                        "NO_VALID_ZONE_COORDINATES",

                    "message": (
                        "No zones with valid "
                        "coordinates are available."
                    ),
                },
            },
        )

    try:
        live_zones = (
            get_bulk_environment_data(
                locations
            )
        )

        # AQI can be fresh even when Open-Meteo weather is rate-limited.
        # In that case keep fresh AQI and reuse the last successful
        # cached weather values.
        try:
            cached_weather_zones = {
                item.get("zone_id"): item
                for item in get_cached_network()
                if item.get("zone_id")
            }
        except Exception:
            cached_weather_zones = {}

        weather_fields = (
            "temperature",
            "humidity",
            "feels_like",
            "weather_code",
            "cloud_cover",
            "wind_speed",
            "wind_direction",
            "weather_timestamp",
            "weather_units",
        )

        for live_zone in live_zones:
            live_zone["stale"] = False

            if live_zone.get("weather_timestamp"):
                live_zone["weather_stale"] = False
                continue

            live_zone["weather_stale"] = True

            cached_weather = cached_weather_zones.get(
                live_zone.get("zone_id")
            )

            if not cached_weather:
                continue

            for field in weather_fields:
                if live_zone.get(field) is None:
                    live_zone[field] = cached_weather.get(field)

        try:
            save_live_network(
                live_zones
            )

        except Exception:
            pass

    except Exception as exc:
        logger.warning(
            "Open-Meteo live-network failed; "
            "using fallback cache: %s: %s",
            type(exc).__name__,
            exc,
        )

        if not isinstance(
            exc,
            (
                httpx.HTTPStatusError,
                httpx.RequestError,
            ),
        ):
            _raise_open_meteo_error(
                exc
            )

        try:
            cached_zones = (
                get_cached_network()
            )

        except Exception:
            cached_zones = []

        if cached_zones:
            usable_cached_zones = []

            for cached_zone in (
                cached_zones
            ):
                cached_zone = dict(
                    cached_zone
                )

                cached_zone[
                    "source"
                ] = (
                    "firestore_cache"
                )

                cached_zone[
                    "stale"
                ] = True

                cached_zone["live"] = False

                usable_cached_zones.append(
                    cached_zone
                )

            successful_cached = [
                zone
                for zone
                in usable_cached_zones
                if zone.get(
                    "live"
                )
            ]

            return {
                "success":
                    True,

                "data": {
                    "source":
                        "firestore_cache",

                    "stale":
                        True,

                    "total_zones":
                        len(
                            locations
                        ),

                    "live_zones":
                        len(
                            successful_cached
                        ),

                    "zones":
                        usable_cached_zones,
                },
            }

        _raise_open_meteo_error(
            exc
        )

    successful = [
        zone
        for zone
        in live_zones
        if zone.get(
            "live"
        )
    ]

    return {
        "success":
            True,

        "data": {
            "source":
                "open_meteo",

            "stale":
                False,

            "total_zones":
                len(
                    locations
                ),

            "live_zones":
                len(
                    successful
                ),

            "zones":
                live_zones,
        },
    }


# =========================================================
# LIVE SINGLE ZONE
# =========================================================

@router.get(
    "/live"
)
def get_live_aqi(
    zone_id: str = Query(...),
) -> dict:
    zone = (
        _get_zone_or_404(
            zone_id
        )
    )

    (
        latitude,
        longitude,
    ) = _get_zone_coordinates(
        zone
    )

    try:
        live_data = (
            get_live_environment_data(
                latitude=
                    latitude,

                longitude=
                    longitude,
            )
        )

    except Exception as exc:
        logger.warning(
            "Open-Meteo live zone %s failed; "
            "using fallback cache: %s: %s",
            zone_id,
            type(exc).__name__,
            exc,
        )

        if not isinstance(
            exc,
            (
                httpx.HTTPStatusError,
                httpx.RequestError,
            ),
        ):
            _raise_open_meteo_error(
                exc
            )

        try:
            cached = (
                get_cached_zone(
                    zone_id
                )
            )

        except Exception:
            cached = None

        if (
            cached
            and
            cached.get(
                "aqi"
            )
            is not None
        ):
            cached = dict(
                cached
            )

            cached[
                "zone_id"
            ] = zone_id

            cached[
                "zone_name"
            ] = (
                cached.get(
                    "zone_name"
                )
                or
                cached.get(
                    "name"
                )
                or
                zone.get(
                    "name",
                    zone_id,
                )
            )

            cached[
                "name"
            ] = (
                cached.get(
                    "name"
                )
                or
                zone.get(
                    "name",
                    zone_id,
                )
            )

            cached[
                "state"
            ] = (
                cached.get(
                    "state"
                )
                or
                zone.get(
                    "state"
                )
            )

            cached[
                "latitude"
            ] = cached.get(
                "latitude",
                latitude,
            )

            cached[
                "longitude"
            ] = cached.get(
                "longitude",
                longitude,
            )

            cached[
                "source"
            ] = (
                "firestore_cache"
            )

            cached[
                "stale"
            ] = True

            cached["live"] = False

            return {
                "success":
                    True,

                "data":
                    cached,
            }

        _raise_open_meteo_error(
            exc
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

    weather_stale = bool(
        live_data.get(
            "weather_stale"
        )
    )

    if not weather.get(
        "timestamp"
    ):
        try:
            cached_weather = (
                get_cached_zone(
                    zone_id
                )
            )
        except Exception:
            cached_weather = None

        if cached_weather:
            weather = {
                "temperature":
                    cached_weather.get(
                        "temperature"
                    ),

                "humidity":
                    cached_weather.get(
                        "humidity"
                    ),

                "feels_like":
                    cached_weather.get(
                        "feels_like"
                    ),

                "weather_code":
                    cached_weather.get(
                        "weather_code"
                    ),

                "cloud_cover":
                    cached_weather.get(
                        "cloud_cover"
                    ),

                "wind_speed":
                    cached_weather.get(
                        "wind_speed"
                    ),

                "wind_direction":
                    cached_weather.get(
                        "wind_direction"
                    ),

                "timestamp":
                    cached_weather.get(
                        "weather_timestamp"
                    ),

                "units":
                    cached_weather.get(
                        "weather_units"
                    )
                    or {},
            }

            weather_stale = True

    response_data = {
        "zone_id":
            zone_id,

        "zone_name":
            zone.get(
                "name",
                zone_id,
            ),

        "name":
            zone.get(
                "name",
                zone_id,
            ),

        "state":
            zone.get(
                "state"
            ),

        "latitude":
            latitude,

        "longitude":
            longitude,

        "source":
            "open_meteo",

        "stale":
            False,


        "weather_stale":
            weather_stale,

        "live":
            (
                air_quality.get(
                    "aqi"
                )
                is not None
            ),

        "aqi":
            air_quality.get(
                "aqi"
            ),

        "category":
            air_quality.get(
                "category"
            ),

        "pm25":
            air_quality.get(
                "pm25"
            ),

        "pm10":
            air_quality.get(
                "pm10"
            ),

        "no2":
            air_quality.get(
                "no2"
            ),

        "so2":
            air_quality.get(
                "so2"
            ),

        "co":
            air_quality.get(
                "co"
            ),

        "o3":
            air_quality.get(
                "o3"
            ),

        "temperature":
            weather.get(
                "temperature"
            ),

        "feels_like":
            weather.get(
                "feels_like"
            ),

        "humidity":
            weather.get(
                "humidity"
            ),

        "wind_speed":
            weather.get(
                "wind_speed"
            ),

        "wind_direction":
            weather.get(
                "wind_direction"
            ),

        "cloud_cover":
            weather.get(
                "cloud_cover"
            ),

        "weather_code":
            weather.get(
                "weather_code"
            ),

        "air_quality_timestamp":
            air_quality.get(
                "timestamp"
            ),

        "weather_timestamp":
            weather.get(
                "timestamp"
            ),

        "air_quality_units":
            air_quality.get(
                "units"
            ),

        "weather_units":
            weather.get(
                "units"
            ),
    }

    try:
        save_live_zone(
            response_data
        )

    except Exception:
        pass

    return {
        "success":
            True,

        "data":
            response_data,
    }


# =========================================================
# OPEN-METEO HISTORICAL AQI
# NEW ROUTE FOR HISTORY PAGE
# =========================================================

@router.get(
    "/history-live"
)
def get_live_aqi_history(
    zone_id: str = Query(...),

    hours: int = Query(
        default=24,
        ge=1,
        le=720,
    ),
) -> dict:
    zone = (
        _get_zone_or_404(
            zone_id
        )
    )

    (
        latitude,
        longitude,
    ) = _get_zone_coordinates(
        zone
    )

    try:
        readings = (
            get_air_quality_history(
                latitude=
                    latitude,

                longitude=
                    longitude,

                hours=
                    hours,
            )
        )

    except Exception as exc:
        _raise_open_meteo_error(
            exc
        )

    return {
        "success":
            True,

        "data": {
            "zone_id":
                zone_id,

            "zone_name":
                zone.get(
                    "name",
                    zone_id,
                ),

            "source":
                "open_meteo",

            "hours":
                hours,

            "total_readings":
                len(
                    readings
                ),

            "readings":
                readings,
        },
    }


# =========================================================
# EXISTING FIRESTORE HISTORY
# =========================================================

@router.get(
    "/history",
    response_model=
        AQIHistoryResponse,
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

    zone = (
        _get_zone_or_404(
            zone_id
        )
    )

    documents = (
        db.collection(
            "aqi_readings"
        )
        .where(
            "zone_id",
            "==",
            zone_id,
        )
        .order_by(
            "timestamp",
            direction=
                "DESCENDING",
        )
        .limit(
            limit
        )
        .stream()
    )

    readings = list(
        documents
    )

    if not readings:
        raise HTTPException(
            status_code=404,
            detail={
                "success":
                    False,

                "error": {
                    "code":
                        "AQI_HISTORY_NOT_FOUND",

                    "message": (
                        "No AQI history found "
                        f"for zone '{zone_id}'."
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
                zone_id=
                    zone_id,

                zone_name=
                    zone["name"],

                aqi=
                    data["aqi"],

                category=
                    data["category"],

                pm25=
                    data["pm25"],

                pm10=
                    data["pm10"],

                no2=
                    data["no2"],

                so2=
                    data["so2"],

                co=
                    data["co"],

                temperature=
                    data[
                        "temperature"
                    ],

                humidity=
                    data[
                        "humidity"
                    ],

                wind_speed=
                    data[
                        "wind_speed"
                    ],

                timestamp=
                    data[
                        "timestamp"
                    ],
            )
        )

    return AQIHistoryResponse(
        zone_id=
            zone_id,

        zone_name=
            zone["name"],

        readings=
            history,
    )

