"""Open-Meteo live environmental data integration."""

from copy import deepcopy
from time import monotonic
from typing import Any

import httpx


AIR_QUALITY_URL = (
    "https://air-quality-api.open-meteo.com/"
    "v1/air-quality"
)

WEATHER_URL = (
    "https://api.open-meteo.com/"
    "v1/forecast"
)


# Cache successful live responses for 5 minutes.
# This prevents repeated frontend refreshes from
# continuously calling Open-Meteo.
LIVE_CACHE_TTL_SECONDS = 300.0


_SINGLE_LIVE_CACHE: dict[
    tuple[float, float],
    tuple[float, dict[str, Any]],
] = {}


_BULK_LIVE_CACHE: dict[
    tuple[
        tuple[str, float, float],
        ...
    ],
    tuple[
        float,
        list[dict[str, Any]],
    ],
] = {}


# ---------------------------------------------------------
# AQI category
# ---------------------------------------------------------

def _aqi_category(
    aqi: float | int | None,
) -> str:
    """
    Convert US AQI value to a readable category.
    """

    if aqi is None:
        return "UNKNOWN"

    value = float(aqi)

    if value <= 50:
        return "GOOD"

    if value <= 100:
        return "MODERATE"

    if value <= 150:
        return "UNHEALTHY_FOR_SENSITIVE_GROUPS"

    if value <= 200:
        return "UNHEALTHY"

    if value <= 300:
        return "VERY_UNHEALTHY"

    return "HAZARDOUS"


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

def _as_location_list(
    data: Any,
) -> list[dict[str, Any]]:
    """
    Open-Meteo returns:
    - dict for one location
    - list of dicts for multiple locations
    """

    if isinstance(
        data,
        list,
    ):
        return [
            item
            for item in data
            if isinstance(
                item,
                dict,
            )
        ]

    if isinstance(
        data,
        dict,
    ):
        return [
            data
        ]

    return []


def _coordinate_string(
    locations: list[
        dict[str, Any]
    ],
    field: str,
) -> str:
    """
    Convert coordinates into comma-separated
    Open-Meteo multi-location format.
    """

    return ",".join(
        str(
            float(
                location[
                    field
                ]
            )
        )
        for location in locations
    )


def _parse_air_quality(
    data: dict[str, Any],
    *,
    fallback_latitude: float,
    fallback_longitude: float,
) -> dict[str, Any]:

    current = (
        data.get(
            "current"
        )
        or {}
    )

    units = (
        data.get(
            "current_units"
        )
        or {}
    )

    aqi = (
        current.get(
            "us_aqi"
        )
    )

    return {
        "source":
            "open_meteo",

        "latitude":
            data.get(
                "latitude",
                fallback_latitude,
            ),

        "longitude":
            data.get(
                "longitude",
                fallback_longitude,
            ),

        "timezone":
            data.get(
                "timezone"
            ),

        "timestamp":
            current.get(
                "time"
            ),

        "aqi":
            aqi,

        "category":
            _aqi_category(
                aqi
            ),

        "pm25":
            current.get(
                "pm2_5"
            ),

        "pm10":
            current.get(
                "pm10"
            ),

        "no2":
            current.get(
                "nitrogen_dioxide"
            ),

        "so2":
            current.get(
                "sulphur_dioxide"
            ),

        "co":
            current.get(
                "carbon_monoxide"
            ),

        "o3":
            current.get(
                "ozone"
            ),

        "units": {
            "aqi":
                units.get(
                    "us_aqi"
                ),

            "pm25":
                units.get(
                    "pm2_5"
                ),

            "pm10":
                units.get(
                    "pm10"
                ),

            "no2":
                units.get(
                    "nitrogen_dioxide"
                ),

            "so2":
                units.get(
                    "sulphur_dioxide"
                ),

            "co":
                units.get(
                    "carbon_monoxide"
                ),

            "o3":
                units.get(
                    "ozone"
                ),
        },
    }


def _parse_weather(
    data: dict[str, Any],
    *,
    fallback_latitude: float,
    fallback_longitude: float,
) -> dict[str, Any]:

    current = (
        data.get(
            "current"
        )
        or {}
    )

    units = (
        data.get(
            "current_units"
        )
        or {}
    )

    return {
        "source":
            "open_meteo",

        "latitude":
            data.get(
                "latitude",
                fallback_latitude,
            ),

        "longitude":
            data.get(
                "longitude",
                fallback_longitude,
            ),

        "timezone":
            data.get(
                "timezone"
            ),

        "timestamp":
            current.get(
                "time"
            ),

        "temperature":
            current.get(
                "temperature_2m"
            ),

        "humidity":
            current.get(
                "relative_humidity_2m"
            ),

        "feels_like":
            current.get(
                "apparent_temperature"
            ),

        "weather_code":
            current.get(
                "weather_code"
            ),

        "cloud_cover":
            current.get(
                "cloud_cover"
            ),

        "wind_speed":
            current.get(
                "wind_speed_10m"
            ),

        "wind_direction":
            current.get(
                "wind_direction_10m"
            ),

        "units": {
            "temperature":
                units.get(
                    "temperature_2m"
                ),

            "humidity":
                units.get(
                    "relative_humidity_2m"
                ),

            "wind_speed":
                units.get(
                    "wind_speed_10m"
                ),

            "wind_direction":
                units.get(
                    "wind_direction_10m"
                ),
        },
    }


# ---------------------------------------------------------
# Single location AQI
# ---------------------------------------------------------

def get_current_air_quality(
    *,
    latitude: float,
    longitude: float,
) -> dict[str, Any]:
    """
    Fetch current air-quality data
    from Open-Meteo.
    """

    current_variables = ",".join(
        [
            "us_aqi",
            "pm10",
            "pm2_5",
            "carbon_monoxide",
            "nitrogen_dioxide",
            "sulphur_dioxide",
            "ozone",
        ]
    )

    with httpx.Client(
        timeout=20.0
    ) as client:

        response = client.get(
            AIR_QUALITY_URL,
            params={
                "latitude":
                    latitude,

                "longitude":
                    longitude,

                "current":
                    current_variables,

                "timezone":
                    "auto",
            },
        )

    response.raise_for_status()

    data = (
        response.json()
    )

    return (
        _parse_air_quality(
            data,
            fallback_latitude=
                latitude,
            fallback_longitude=
                longitude,
        )
    )


# ---------------------------------------------------------
# AQI forecast
# ---------------------------------------------------------

def get_air_quality_forecast(
    *,
    latitude: float,
    longitude: float,
    hours: int = 24,
) -> list[dict[str, Any]]:
    """
    Fetch hourly US AQI forecast
    from Open-Meteo.
    """

    safe_hours = max(
        1,
        min(
            int(
                hours
            ),
            168,
        ),
    )

    with httpx.Client(
        timeout=20.0
    ) as client:

        response = client.get(
            AIR_QUALITY_URL,
            params={
                "latitude":
                    latitude,

                "longitude":
                    longitude,

                "hourly":
                    "us_aqi",

                "forecast_hours":
                    safe_hours,

                "timezone":
                    "auto",
            },
        )

    response.raise_for_status()

    data = (
        response.json()
    )

    hourly = (
        data.get(
            "hourly"
        )
        or {}
    )

    times = (
        hourly.get(
            "time"
        )
        or []
    )

    aqis = (
        hourly.get(
            "us_aqi"
        )
        or []
    )

    forecast: list[
        dict[str, Any]
    ] = []

    for (
        timestamp,
        aqi,
    ) in zip(
        times,
        aqis,
    ):

        if aqi is None:
            continue

        forecast.append(
            {
                "timestamp":
                    timestamp,

                "predicted_aqi":
                    float(
                        aqi
                    ),

                "risk_level":
                    _aqi_category(
                        aqi
                    ),

                "confidence":
                    0.0,

                "source":
                    "open_meteo",
            }
        )

    return forecast


# ---------------------------------------------------------
# Single location weather
# ---------------------------------------------------------

def get_current_weather(
    *,
    latitude: float,
    longitude: float,
) -> dict[str, Any]:
    """
    Fetch current weather data
    from Open-Meteo.
    """

    current_variables = ",".join(
        [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m",
            "wind_direction_10m",
        ]
    )

    with httpx.Client(
        timeout=20.0
    ) as client:

        response = client.get(
            WEATHER_URL,
            params={
                "latitude":
                    latitude,

                "longitude":
                    longitude,

                "current":
                    current_variables,

                "timezone":
                    "auto",
            },
        )

    response.raise_for_status()

    data = (
        response.json()
    )

    return (
        _parse_weather(
            data,
            fallback_latitude=
                latitude,
            fallback_longitude=
                longitude,
        )
    )


# ---------------------------------------------------------
# Single location combined environment
# ---------------------------------------------------------

def get_live_environment_data(
    *,
    latitude: float,
    longitude: float,
) -> dict[str, Any]:
    """
    Fetch live/current AQI and weather
    for one geographical location.

    Successful results are cached
    for five minutes.
    """

    cache_key = (
        round(
            float(
                latitude
            ),
            5,
        ),
        round(
            float(
                longitude
            ),
            5,
        ),
    )

    now = (
        monotonic()
    )

    cached = (
        _SINGLE_LIVE_CACHE.get(
            cache_key
        )
    )

    if (
        cached is not None
        and
        now - cached[0]
        < LIVE_CACHE_TTL_SECONDS
    ):
        return deepcopy(
            cached[1]
        )

    air_quality = (
        get_current_air_quality(
            latitude=
                latitude,

            longitude=
                longitude,
        )
    )

    weather = (
        get_current_weather(
            latitude=
                latitude,

            longitude=
                longitude,
        )
    )

    result = {
        "source":
            "open_meteo",

        "latitude":
            latitude,

        "longitude":
            longitude,

        "air_quality":
            air_quality,

        "weather":
            weather,
    }

    _SINGLE_LIVE_CACHE[
        cache_key
    ] = (
        monotonic(),
        deepcopy(
            result
        ),
    )

    return result


# ---------------------------------------------------------
# BULK LIVE NETWORK
# ---------------------------------------------------------

def get_bulk_environment_data(
    locations: list[
        dict[str, Any]
    ],
) -> list[dict[str, Any]]:
    """
    Fetch current AQI + weather
    for many locations.

    Instead of:
        46 cities x 2 requests
        = 92 upstream requests

    this uses:
        1 air-quality request
        1 weather request

    Successful results are cached
    for five minutes.
    """

    valid_locations = [
        location
        for location in locations
        if (
            location.get(
                "latitude"
            )
            is not None

            and

            location.get(
                "longitude"
            )
            is not None
        )
    ]

    if not valid_locations:
        return []

    cache_key = tuple(
        (
            str(
                location.get(
                    "zone_id",
                    "",
                )
            ),

            round(
                float(
                    location[
                        "latitude"
                    ]
                ),
                5,
            ),

            round(
                float(
                    location[
                        "longitude"
                    ]
                ),
                5,
            ),
        )
        for location in valid_locations
    )

    now = (
        monotonic()
    )

    cached = (
        _BULK_LIVE_CACHE.get(
            cache_key
        )
    )

    if (
        cached is not None
        and
        now - cached[0]
        < LIVE_CACHE_TTL_SECONDS
    ):
        return deepcopy(
            cached[1]
        )

    latitudes = (
        _coordinate_string(
            valid_locations,
            "latitude",
        )
    )

    longitudes = (
        _coordinate_string(
            valid_locations,
            "longitude",
        )
    )

    air_variables = ",".join(
        [
            "us_aqi",
            "pm10",
            "pm2_5",
            "carbon_monoxide",
            "nitrogen_dioxide",
            "sulphur_dioxide",
            "ozone",
        ]
    )

    weather_variables = ",".join(
        [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m",
            "wind_direction_10m",
        ]
    )

    with httpx.Client(
        timeout=30.0
    ) as client:

        air_response = (
            client.get(
                AIR_QUALITY_URL,
                params={
                    "latitude":
                        latitudes,

                    "longitude":
                        longitudes,

                    "current":
                        air_variables,

                    "timezone":
                        "auto",
                },
            )
        )

        air_response.raise_for_status()

        weather_response = (
            client.get(
                WEATHER_URL,
                params={
                    "latitude":
                        latitudes,

                    "longitude":
                        longitudes,

                    "current":
                        weather_variables,

                    "timezone":
                        "auto",
                },
            )
        )

        weather_response.raise_for_status()

    air_results = (
        _as_location_list(
            air_response.json()
        )
    )

    weather_results = (
        _as_location_list(
            weather_response.json()
        )
    )

    results: list[
        dict[str, Any]
    ] = []

    for (
        index,
        location,
    ) in enumerate(
        valid_locations
    ):

        latitude = float(
            location[
                "latitude"
            ]
        )

        longitude = float(
            location[
                "longitude"
            ]
        )

        air_data = (
            air_results[
                index
            ]
            if (
                index
                < len(
                    air_results
                )
            )
            else {}
        )

        weather_data = (
            weather_results[
                index
            ]
            if (
                index
                < len(
                    weather_results
                )
            )
            else {}
        )

        air_quality = (
            _parse_air_quality(
                air_data,
                fallback_latitude=
                    latitude,
                fallback_longitude=
                    longitude,
            )
        )

        weather = (
            _parse_weather(
                weather_data,
                fallback_latitude=
                    latitude,
                fallback_longitude=
                    longitude,
            )
        )

        results.append(
            {
                "zone_id":
                    location.get(
                        "zone_id"
                    ),

                "name":
                    location.get(
                        "name"
                    ),

                "state":
                    location.get(
                        "state"
                    ),

                "latitude":
                    latitude,

                "longitude":
                    longitude,

                "source":
                    "open_meteo",

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

                "humidity":
                    weather.get(
                        "humidity"
                    ),

                "feels_like":
                    weather.get(
                        "feels_like"
                    ),

                "weather_code":
                    weather.get(
                        "weather_code"
                    ),

                "cloud_cover":
                    weather.get(
                        "cloud_cover"
                    ),

                "wind_speed":
                    weather.get(
                        "wind_speed"
                    ),

                "wind_direction":
                    weather.get(
                        "wind_direction"
                    ),

                "air_quality_timestamp":
                    air_quality.get(
                        "timestamp"
                    ),

                "weather_timestamp":
                    weather.get(
                        "timestamp"
                    ),

                "live":
                    (
                        air_quality.get(
                            "aqi"
                        )
                        is not None
                    ),
            }
        )

    _BULK_LIVE_CACHE[
        cache_key
    ] = (
        monotonic(),
        deepcopy(
            results
        ),
    )

    return results