import os
from typing import Any

from dotenv import load_dotenv
from google import genai


load_dotenv()


def get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")

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
        "gemini-2.5-flash",
    )


def generate_text(prompt: str) -> str:
    client = get_client()

    response = client.models.generate_content(
        model=get_model_name(),
        contents=prompt,
    )

    text = getattr(response, "text", None)

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
    """
    Explain an already-generated ML forecast.
    Gemini does NOT calculate or alter the predicted AQI.
    """

    prompt = f"""
You are an air-quality explanation assistant.

Use ONLY the supplied forecast information.

Do not invent sensor readings.
Do not change the predicted AQI.
Do not generate a new numerical prediction.

Zone:
{zone_id}

Predicted AQI:
{predicted_aqi}

Risk level:
{risk_level}

Model confidence:
{confidence}

Key factors:
{", ".join(key_factors)}

Return a concise explanation for a dashboard user.

Mention:
1. What the model predicts.
2. Why the risk may increase.
3. Which supplied factors influenced the forecast.

Do not claim certainty.
"""

    explanation = generate_text(prompt)

    return {
        "zone_id": zone_id,
        "predicted_aqi": predicted_aqi,
        "risk_level": risk_level,
        "confidence": confidence,
        "explanation": explanation,
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
) -> dict[str, Any]:
    """
    Generate a grounded natural-language explanation
    using supplied measured values.
    """

    prompt = f"""
You are an air-quality analysis assistant.

Answer the user's question using ONLY the provided measurements.

Do not invent missing measurements.
Do not create unsupported numerical claims.

Zone:
{zone_id}

AQI:
{aqi}

PM2.5:
{pm25}

PM10:
{pm10}

NO2:
{no2}

SO2:
{so2}

CO:
{co}

Temperature:
{temperature}

Humidity:
{humidity}

Wind speed:
{wind_speed}

User question:
{question}

Provide a concise, understandable answer.
Clearly distinguish measured information from interpretation.
"""

    answer = generate_text(prompt)

    return {
        "zone_id": zone_id,
        "answer": answer,
        "sources": [
            "AQI measurements",
            "Pollutant measurements",
            "Weather measurements",
        ],
    }