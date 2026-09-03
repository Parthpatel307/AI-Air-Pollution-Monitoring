"""Google Maps Platform integrations."""

from typing import Any

import httpx

from app.config import get_settings


AIR_QUALITY_URL = (
    "https://airquality.googleapis.com/"
    "v1/currentConditions:lookup"
)

WEATHER_URL = (
    "https://weather.googleapis.com/"
    "v1/currentConditions:lookup"
)


def _get_api_key() -> str:
    settings = get_settings()

    api_key = settings.google_maps_api_key

    if not api_key:
        raise RuntimeError(
            "GOOGLE_MAPS_API_KEY is not configured."
        )

    return api_key


def _pollutant_map(
    pollutants: list[dict[str, Any]],
) -> dict[str, Any]:
    result: dict[str, Any] = {}

    for pollutant in pollutants:
        code = str(
            pollutant.get(
                "code",
                "",
            )
        ).lower()

        concentration = (
            pollutant.get("concentration")
            or {}
        )

        value = concentration.get(
            "value"
        )

        units = concentration.get(
            "units"
        )

        if code:
            result[code] = {
                "value": value,
                "units": units,
                "display_name": pollutant.get(
                    "displayName"
                ),
                "full_name": pollutant.get(
                    "fullName"
                ),
                "additional_info": pollutant.get(
                    "additionalInfo"
                )
                or {},
            }

    return result


def get_current_air_quality(
    *,
    latitude: float,
    longitude: float,
) -> dict[str, Any]:
    """
    Fetch current hourly air-quality information
    from Google Air Quality API.
    """

    api_key = _get_api_key()

    request_body = {
        "universalAqi": True,
        "location": {
            "latitude": latitude,
            "longitude": longitude,
        },
        "extraComputations": [
            "HEALTH_RECOMMENDATIONS",
            "DOMINANT_POLLUTANT_CONCENTRATION",
            "POLLUTANT_CONCENTRATION",
            "LOCAL_AQI",
            "POLLUTANT_ADDITIONAL_INFO",
        ],
        "languageCode": "en",
    }

    with httpx.Client(
        timeout=20.0
    ) as client:
        response = client.post(
            AIR_QUALITY_URL,
            params={
                "key": api_key,
            },
            json=request_body,
        )

    response.raise_for_status()

    data = response.json()

    indexes = (
        data.get("indexes")
        or []
    )

    pollutants = _pollutant_map(
        data.get("pollutants")
        or []
    )

    universal_index = None
    local_index = None

    for index in indexes:
        code = str(
            index.get(
                "code",
                "",
            )
        ).lower()

        if code == "uaqi":
            universal_index = index

        else:
            if local_index is None:
                local_index = index

    selected_index = (
        local_index
        or universal_index
        or {}
    )

    return {
        "source": "google_air_quality",
        "latitude": latitude,
        "longitude": longitude,
        "date_time": data.get(
            "dateTime"
        ),
        "region_code": data.get(
            "regionCode"
        ),
        "aqi": selected_index.get(
            "aqi"
        ),
        "aqi_display": selected_index.get(
            "aqiDisplay"
        ),
        "aqi_category": selected_index.get(
            "category"
        ),
        "dominant_pollutant": (
            selected_index.get(
                "dominantPollutant"
            )
        ),
        "index_code": selected_index.get(
            "code"
        ),
        "index_name": selected_index.get(
            "displayName"
        ),
        "universal_aqi": (
            universal_index.get("aqi")
            if universal_index
            else None
        ),
        "pm25": (
            pollutants.get(
                "pm25",
                {},
            ).get("value")
        ),
        "pm10": (
            pollutants.get(
                "pm10",
                {},
            ).get("value")
        ),
        "no2": (
            pollutants.get(
                "no2",
                {},
            ).get("value")
        ),
        "so2": (
            pollutants.get(
                "so2",
                {},
            ).get("value")
        ),
        "co": (
            pollutants.get(
                "co",
                {},
            ).get("value")
        ),
        "pollutants": pollutants,
        "health_recommendations": (
            data.get(
                "healthRecommendations"
            )
            or {}
        ),
    }


def get_current_weather(
    *,
    latitude: float,
    longitude: float,
) -> dict[str, Any]:
    """
    Fetch current weather conditions
    from Google Weather API.
    """

    api_key = _get_api_key()

    with httpx.Client(
        timeout=20.0
    ) as client:
        response = client.get(
            WEATHER_URL,
            params={
                "key": api_key,
                "location.latitude": (
                    latitude
                ),
                "location.longitude": (
                    longitude
                ),
                "unitsSystem": "METRIC",
            },
        )

    response.raise_for_status()

    data = response.json()

    temperature = (
        data.get("temperature")
        or {}
    )

    feels_like = (
        data.get(
            "feelsLikeTemperature"
        )
        or {}
    )

    wind = (
        data.get("wind")
        or {}
    )

    wind_speed = (
        wind.get("speed")
        or {}
    )

    wind_direction = (
        wind.get("direction")
        or {}
    )

    condition = (
        data.get(
            "weatherCondition"
        )
        or {}
    )

    description = (
        condition.get("description")
        or {}
    )

    return {
        "source": "google_weather",
        "latitude": latitude,
        "longitude": longitude,
        "current_time": data.get(
            "currentTime"
        ),
        "temperature": temperature.get(
            "degrees"
        ),
        "temperature_unit": temperature.get(
            "unit"
        ),
        "feels_like": feels_like.get(
            "degrees"
        ),
        "humidity": data.get(
            "relativeHumidity"
        ),
        "wind_speed": wind_speed.get(
            "value"
        ),
        "wind_speed_unit": wind_speed.get(
            "unit"
        ),
        "wind_direction_degrees": (
            wind_direction.get(
                "degrees"
            )
        ),
        "wind_direction": (
            wind_direction.get(
                "cardinal"
            )
        ),
        "condition": description.get(
            "text"
        ),
        "condition_type": condition.get(
            "type"
        ),
        "cloud_cover": data.get(
            "cloudCover"
        ),
        "uv_index": data.get(
            "uvIndex"
        ),
    }


def get_live_environment_data(
    *,
    latitude: float,
    longitude: float,
) -> dict[str, Any]:
    """
    Fetch both air-quality and weather data
    for one location.
    """

    air_quality = get_current_air_quality(
        latitude=latitude,
        longitude=longitude,
    )

    weather = get_current_weather(
        latitude=latitude,
        longitude=longitude,
    )

    return {
        "latitude": latitude,
        "longitude": longitude,
        "air_quality": air_quality,
        "weather": weather,
    }