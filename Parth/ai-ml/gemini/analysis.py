import os
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types


load_dotenv()


def get_client() -> genai.Client:
    api_key = os.getenv(
        "GEMINI_API_KEY"
    )

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured."
        )

    return genai.Client(
        api_key=api_key
    )


def get_model_name() -> str:
    return os.getenv(
        "GEMINI_MODEL",
        "gemini-3.6-flash",
    )


def generate_text(
    prompt: str,
) -> str:
    client = get_client()

    response = client.models.generate_content(
        model=get_model_name(),
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
            max_output_tokens=220,
            automatic_function_calling=
                types.AutomaticFunctionCallingConfig(
                    disable=True
                ),
        ),
    )

    text = getattr(
        response,
        "text",
        None,
    )

    if not text:
        raise RuntimeError(
            "Gemini returned an empty response."
        )

    return text.strip()


def explain_forecast(
    *,
    zone_id: str,
    predicted_aqi: float,
    risk_level: str,
    confidence: float,
    key_factors: list[str],
) -> dict[str, Any]:

    factors_text = (
        ", ".join(key_factors)
        if key_factors
        else "No key factors supplied"
    )

    prompt = f"""
You are AirGuard AI, an air-quality forecast explanation assistant.

Use ONLY the forecast information provided below.

Predicted AQI: {predicted_aqi}
Risk level: {risk_level}
Model confidence: {confidence}
Key factors: {factors_text}

Return plain text in this structure:

Forecast Summary
One short sentence explaining the forecast.

Key Factors
- First important factor.
- Second important factor.

Guidance
One short practical recommendation.

Rules:
- Maximum 90 words.
- Do not calculate a new AQI.
- Do not modify the predicted AQI.
- Do not invent measurements.
- Do not mention internal zone IDs.
- Do not claim certainty.
- Do not use markdown bold.
- Do not use tables.
- Do not add separator lines.
""".strip()

    explanation = generate_text(
        prompt
    )

    return {
        "zone_id":
            zone_id,

        "predicted_aqi":
            predicted_aqi,

        "risk_level":
            risk_level,

        "confidence":
            confidence,

        "explanation":
            explanation,
    }


def analyze_air_quality(
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
    zone_name: str | None = None,
) -> dict[str, Any]:

    location_name = (
        str(zone_name).strip()
        if zone_name
        else "the selected monitoring area"
    )

    prompt = f"""
You are AirGuard AI, an intelligent air-quality analysis assistant.

Selected location:
{location_name}

Current live measurements:
AQI: {aqi}
PM2.5: {pm25} µg/m³
PM10: {pm10} µg/m³
NO2: {no2} µg/m³
SO2: {so2} µg/m³
CO: {co} µg/m³
Temperature: {temperature} °C
Humidity: {humidity} %
Wind speed: {wind_speed} km/h

User question:
{question}

Answer using ONLY the measurements above.

Return plain text in this structure:

Current Air Quality
One concise sentence directly answering the user's question and mentioning the AQI.

Key Factors
- Mention the most relevant factor.
- Mention the second most relevant factor.
- Add a third factor only if genuinely useful.

Insight
Give one or two short sentences explaining what the measurements may indicate for {location_name}.

Rules:
- Maximum 110 words.
- Keep the answer concise and natural.
- Do not repeat every measurement.
- Mention only values relevant to the question.
- Never display the internal zone ID.
- Refer to the location as "{location_name}".
- Do not invent pollution sources.
- Describe possible causes only as possible contributors.
- Do not claim that AQI is rising or falling unless trend data is supplied.
- Do not provide medical diagnosis.
- Do not use markdown bold.
- Do not use tables.
- Do not add separator lines.
""".strip()

    answer = generate_text(
        prompt
    )

    return {
        "zone_id":
            zone_id,

        "zone_name":
            location_name,

        "answer":
            answer,

        "sources": [
            "AQI measurements",
            "Pollutant measurements",
            "Weather measurements",
        ],
    }