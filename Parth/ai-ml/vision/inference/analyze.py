import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai

from vision.preprocessing.image_utils import validate_image


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
        "gemini-3.6-flash",
    )


def load_prompt() -> str:
    prompt_path = (
        Path(__file__).resolve().parents[1]
        / "prompts"
        / "evidence_analysis.txt"
    )

    return prompt_path.read_text(
        encoding="utf-8"
    )


def _extract_json(text: str) -> dict[str, Any]:
    """
    Parse Gemini JSON output.
    Supports plain JSON and fenced JSON.
    """

    cleaned = text.strip()

    if cleaned.startswith("```"):
        lines = cleaned.splitlines()

        if lines and lines[0].startswith("```"):
            lines = lines[1:]

        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]

        cleaned = "\n".join(lines).strip()

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Gemini returned invalid JSON."
        ) from exc

    if not isinstance(result, dict):
        raise RuntimeError(
            "Gemini JSON response must be an object."
        )

    return result


def analyze_image(
    image_path: str,
) -> dict[str, Any]:
    """
    Original free-form analysis.
    Kept for backward compatibility.
    """

    file_path = validate_image(
        image_path
    )

    client = get_client()
    prompt = load_prompt()

    uploaded_file = client.files.upload(
        file=str(file_path)
    )

    response = client.models.generate_content(
        model=get_model_name(),
        contents=[
            prompt,
            uploaded_file,
        ],
    )

    text = getattr(
        response,
        "text",
        None,
    )

    if not text:
        raise RuntimeError(
            "Gemini returned an empty vision response."
        )

    return {
        "classification": "AI_ASSESSMENT",
        "analysis": text.strip(),
        "model_version": get_model_name(),
    }


def analyze_image_structured(
    image_path: str,
) -> dict[str, Any]:
    """
    Structured evidence analysis for backend integration.
    """

    file_path = validate_image(
        image_path
    )

    client = get_client()

    prompt = """
You are an environmental evidence analysis assistant.

Analyze the supplied image only.

Return ONLY valid JSON.
Do not use markdown.
Do not use code fences.
Do not add any text before or after the JSON.

Required JSON structure:

{
  "classification": "VISIBLE_SMOKE | ROAD_DUST | OPEN_BURNING | VEHICLE_EXHAUST | INDUSTRIAL_EMISSION | FIRE | CONSTRUCTION_DUST | OTHER_POLLUTION | AMBIGUOUS_INCONCLUSIVE | NO_RELEVANT_EVIDENCE",
  "confidence": 0.0,
  "detected_objects": [],
  "explanation": "",
  "limitations": [],
  "review_required": true
}

Rules:

- confidence must be between 0.0 and 1.0.
- Use AMBIGUOUS_INCONCLUSIVE when the image does not provide enough environmental context.
- Do not invent objects that are not visible.
- Do not identify a person, company, or exact responsible entity.
- Do not claim a pollution source with certainty from visual evidence alone.
- review_required must be true for ambiguous, uncertain, or potentially consequential findings.
- limitations must contain important uncertainty.
- Treat this as an AI screening assessment for authority review, not definitive proof.
"""

    uploaded_file = client.files.upload(
        file=str(file_path)
    )

    response = client.models.generate_content(
        model=get_model_name(),
        contents=[
            prompt,
            uploaded_file,
        ],
    )

    text = getattr(
        response,
        "text",
        None,
    )

    if not text:
        raise RuntimeError(
            "Gemini returned an empty structured response."
        )

    result = _extract_json(text)

    required_fields = [
        "classification",
        "confidence",
        "detected_objects",
        "explanation",
        "limitations",
        "review_required",
    ]

    missing = [
        field
        for field in required_fields
        if field not in result
    ]

    if missing:
        raise RuntimeError(
            f"Structured response missing fields: {missing}"
        )

    try:
        confidence = float(
            result["confidence"]
        )
    except (TypeError, ValueError) as exc:
        raise RuntimeError(
            "Confidence must be numeric."
        ) from exc

    if not 0.0 <= confidence <= 1.0:
        raise RuntimeError(
            "Confidence must be between 0.0 and 1.0."
        )

    result["confidence"] = confidence

    if result["confidence"] < 0.60:
        result["review_required"] = True

    result["model_version"] = get_model_name()

    return result