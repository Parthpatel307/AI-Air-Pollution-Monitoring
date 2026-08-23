from unittest.mock import patch

from app.routers.ai import (
    ai_analyze,
    ai_chat,
    ai_evidence_analyze,
    ai_forecast_explain,
    ai_source_detection,
)


AUTHORITY_USER = {
    "uid": "authority-1",
    "role": "AUTHORITY",
}


@patch("app.routers.ai._get_latest_aqi_reading")
@patch("app.routers.ai._load_parth_integrations")
def test_ai_analyze(mock_load, mock_reading):
    mock_reading.return_value = {
        "aqi": 142,
        "pm25": 78.4,
        "pm10": 121.2,
        "no2": 24,
        "so2": 12,
        "co": 0.8,
        "temperature": 31,
        "humidity": 55,
        "wind_speed": 4.2,
    }

    mock_load.return_value = {
        "air_quality": lambda **kwargs: {
            "success": True,
            "analysis": "Air quality analysis complete.",
        }
    }

    result = ai_analyze(
        payload={
            "zone_id": "zone_001",
            "question": "Why is AQI high?",
        },
        user=AUTHORITY_USER,
    )

    assert result["success"] is True
    assert "analysis" in result


@patch("app.routers.ai._get_latest_aqi_reading")
@patch("app.routers.ai._load_parth_integrations")
def test_ai_chat(mock_load, mock_reading):
    mock_reading.return_value = {
        "aqi": 142,
        "pm25": 78.4,
        "pm10": 121.2,
        "no2": 24,
        "so2": 12,
        "co": 0.8,
        "temperature": 31,
        "humidity": 55,
        "wind_speed": 4.2,
    }

    mock_load.return_value = {
        "chat": lambda **kwargs: {
            "success": True,
            "response": "AQI is currently elevated.",
        }
    }

    result = ai_chat(
        payload={
            "message": "What is the current air quality?",
            "zone_id": "zone_001",
        },
        user=AUTHORITY_USER,
    )

    assert result["success"] is True
    assert "response" in result


@patch("app.routers.ai._get_latest_aqi_reading")
@patch("app.routers.ai._load_parth_integrations")
def test_ai_source_detection(mock_load, mock_reading):
    mock_reading.return_value = {
        "aqi": 142,
        "pm25": 78.4,
        "pm10": 121.2,
        "no2": 24,
        "so2": 12,
        "co": 0.8,
        "temperature": 31,
        "humidity": 55,
        "wind_speed": 4.2,
    }

    mock_load.return_value = {
        "source_detection": lambda data: {
            "success": True,
            "source": "vehicle_emissions",
            "confidence": 0.88,
        }
    }

    result = ai_source_detection(
        payload={
            "zone_id": "zone_001",
            "pollutants": {
                "pm25": 78.4,
                "pm10": 121.2,
            },
            "weather": {
                "temperature": 31,
                "humidity": 55,
                "wind_speed": 4.2,
            },
        },
        user=AUTHORITY_USER,
    )

    assert result["success"] is True
    assert result["source"] == "vehicle_emissions"


@patch("app.routers.ai.get_firestore")
@patch("app.routers.ai._load_parth_integrations")
def test_ai_forecast_explain(mock_load, mock_firestore):
    mock_load.return_value = {
        "forecast_explanation": lambda **kwargs: {
            "success": True,
            "explanation": "AQI may remain elevated.",
        }
    }

    result = ai_forecast_explain(
        payload={
            "zone_id": "zone_001",
            "forecast": {
                "predicted_aqi": 155,
                "risk_level": "HIGH",
                "confidence": 0.91,
                "key_factors": [
                    "high PM2.5",
                    "low wind speed",
                ],
            },
        },
        user=AUTHORITY_USER,
    )

    assert result["success"] is True
    assert "explanation" in result


@patch("app.routers.ai.Path.exists")
@patch("app.routers.ai.get_firestore")
@patch("app.routers.ai._load_parth_integrations")
def test_ai_evidence_analyze(
    mock_load,
    mock_firestore,
    mock_exists,
):
    mock_exists.return_value = True

    evidence_document = mock_firestore.return_value.collection.return_value.document.return_value.get.return_value
    evidence_document.exists = True
    evidence_document.to_dict.return_value = {
        "storage_path": "private_uploads/evidence/test.jpg",
        "content_type": "image/jpeg",
    }

    mock_load.return_value = {
        "evidence": lambda image_path: {
            "success": True,
            "classification": "VISIBLE_SMOKE",
            "confidence": 0.91,
        }
    }

    result = ai_evidence_analyze(
        payload={
            "evidence_id": "evidence_001",
        },
        user=AUTHORITY_USER,
    )

    assert result["success"] is True
    assert result["classification"] == "VISIBLE_SMOKE"