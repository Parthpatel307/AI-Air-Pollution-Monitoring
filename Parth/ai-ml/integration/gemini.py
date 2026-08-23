from typing import Any

from gemini.analysis import (
    analyze_air_quality,
    explain_forecast,
)
from gemini.chat import chat


def run_air_quality_analysis(
    *,
    zone_id: str,
    aqi: float,
    pm25: float,
    pm10: float,
    no2: float,
    so2: float,
    co: float,
    temperature: float,
    humidity: float,
    wind_speed: float,
    question: str,
) -> dict[str, Any]:
    """
    Public interface for grounded Gemini air-quality analysis.
    """

    return analyze_air_quality(
        zone_id=zone_id,
        aqi=aqi,
        pm25=pm25,
        pm10=pm10,
        no2=no2,
        so2=so2,
        co=co,
        temperature=temperature,
        humidity=humidity,
        wind_speed=wind_speed,
        question=question,
    )


def run_forecast_explanation(
    *,
    zone_id: str,
    predicted_aqi: float,
    risk_level: str,
    confidence: float,
    key_factors: list[str],
) -> dict[str, Any]:
    """
    Public interface for explaining an existing ML forecast.
    """

    return explain_forecast(
        zone_id=zone_id,
        predicted_aqi=predicted_aqi,
        risk_level=risk_level,
        confidence=confidence,
        key_factors=key_factors,
    )


def run_chat(
    *,
    message: str,
    zone_id: str,
    context: dict[str, Any],
) -> dict[str, Any]:
    """
    Public interface for grounded Gemini chat.
    """

    return chat(
        message=message,
        zone_id=zone_id,
        context=context,
    )