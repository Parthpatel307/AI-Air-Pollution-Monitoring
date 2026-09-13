"""Open-Meteo live environmental data integration."""

from datetime import datetime
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
                "latitude": latitude,
                "longitude": longitude,
                "current": current_variables,
                "timezone": "auto",
            },
        )

    response.raise_for_status()

    data = response.json()

    current = (
        data.get("current")
        or {}
    )

    units = (
        data.get("current_units")
        or {}
    )

    aqi = current.get(
        "us_aqi"
    )

    return {
        "source": "open_meteo",
        "latitude": data.get(
            "latitude",
            latitude,
        ),
        "longitude": data.get(
            "longitude",
            longitude,
        ),
        "timezone": data.get(
            "timezone"
        ),
        "timestamp": current.get(
            "time"
        ),

        "aqi": aqi,
        "category": _aqi_category(
            aqi
        ),

        "pm25": current.get(
            "pm2_5"
        ),
        "pm10": current.get(
            "pm10"
        ),
        "no2": current.get(
            "nitrogen_dioxide"
        ),
        "so2": current.get(
            "sulphur_dioxide"
        ),
        "co": current.get(
            "carbon_monoxide"
        ),
        "o3": current.get(
            "ozone"
        ),

        "units": {
            "aqi": units.get(
                "us_aqi"
            ),
            "pm25": units.get(
                "pm2_5"
            ),
            "pm10": units.get(
                "pm10"
            ),
            "no2": units.get(
                "nitrogen_dioxide"
            ),
            "so2": units.get(
                "sulphur_dioxide"
            ),
            "co": units.get(
                "carbon_monoxide"
            ),
            "o3": units.get(
                "ozone"
            ),
        },
    }


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
            int(hours),
            168,
        ),
    )

    with httpx.Client(
        timeout=20.0
    ) as client:
        response = client.get(
            AIR_QUALITY_URL,
            params={
                "latitude": latitude,
                "longitude": longitude,
                "hourly": "us_aqi",
                "forecast_hours": safe_hours,
                "timezone": "auto",
            },
        )

    response.raise_for_status()

    data = response.json()

    hourly = (
        data.get("hourly")
        or {}
    )

    times = (
        hourly.get("time")
        or []
    )

    aqis = (
        hourly.get("us_aqi")
        or []
    )

    forecast: list[
        dict[str, Any]
    ] = []

    for timestamp, aqi in zip(
        times,
        aqis,
    ):
        if aqi is None:
            continue

        forecast.append(
            {
                "timestamp": timestamp,
                "predicted_aqi": float(
                    aqi
                ),
                "risk_level": _aqi_category(
                    aqi
                ),
                # Open-Meteo does not expose
                # a per-hour confidence score.
                "confidence": 0.0,
                "source": "open_meteo",
            }
        )

    return forecast


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
                "latitude": latitude,
                "longitude": longitude,
                "current": current_variables,
                "timezone": "auto",
            },
        )

    response.raise_for_status()

    data = response.json()

    current = (
        data.get("current")
        or {}
    )

    units = (
        data.get("current_units")
        or {}
    )

    return {
        "source": "open_meteo",
        "latitude": data.get(
            "latitude",
            latitude,
        ),
        "longitude": data.get(
            "longitude",
            longitude,
        ),
        "timezone": data.get(
            "timezone"
        ),
        "timestamp": current.get(
            "time"
        ),

        "temperature": current.get(
            "temperature_2m"
        ),
        "humidity": current.get(
            "relative_humidity_2m"
        ),
        "feels_like": current.get(
            "apparent_temperature"
        ),
        "weather_code": current.get(
            "weather_code"
        ),
        "cloud_cover": current.get(
            "cloud_cover"
        ),
        "wind_speed": current.get(
            "wind_speed_10m"
        ),
        "wind_direction": current.get(
            "wind_direction_10m"
        ),

        "units": {
            "temperature": units.get(
                "temperature_2m"
            ),
            "humidity": units.get(
                "relative_humidity_2m"
            ),
            "wind_speed": units.get(
                "wind_speed_10m"
            ),
            "wind_direction": units.get(
                "wind_direction_10m"
            ),
        },
    }


def get_live_environment_data(
    *,
    latitude: float,
    longitude: float,
) -> dict[str, Any]:
    """
    Fetch live/current AQI and weather
    for one geographical location.
    """

    air_quality = (
        get_current_air_quality(
            latitude=latitude,
            longitude=longitude,
        )
    )

    weather = (
        get_current_weather(
            latitude=latitude,
            longitude=longitude,
        )
    )

    return {
        "source": "open_meteo",
        "latitude": latitude,
        "longitude": longitude,
        "air_quality": air_quality,
        "weather": weather,
    }