from typing import Any

from gemini.analysis import generate_text


def chat(
    *,
    message: str,
    zone_id: str,
    context: dict[str, Any],
) -> dict[str, Any]:
    """
    Ground Gemini chat in the supplied zone context.
    """

    prompt = f"""
You are an air-quality assistant.

Use ONLY the supplied zone context.

Do not invent AQI values.
Do not invent pollutant measurements.
Do not provide medical diagnosis.
Do not make unsupported claims.

Zone:
{zone_id}

Context:
{context}

User:
{message}

Answer clearly and briefly.
If the available context is insufficient,
say that more data is required.
"""

    answer = generate_text(prompt)

    return {
        "zone_id": zone_id,
        "answer": answer,
    }