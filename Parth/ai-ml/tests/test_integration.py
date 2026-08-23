import pandas as pd

from integration.forecast import run_forecast
from integration.source_detection import (
    run_source_detection,
)


def test_forecast_integration():
    timestamps = pd.date_range(
        "2026-01-01",
        periods=50,
        freq="h",
        tz="UTC",
    )

    records = []

    for i, timestamp in enumerate(timestamps):
        records.append(
            {
                "timestamp": timestamp,
                "zone_id": "zone_001",
                "aqi": 100 + i,
                "pm25": 50 + i,
                "pm10": 80 + i,
                "no2": 30,
                "so2": 10,
                "co": 0.8,
                "temperature": 30,
                "humidity": 60,
                "wind_speed": 8,
            }
        )

    result = run_forecast(records)

    assert "predicted_aqi" in result
    assert "risk_level" in result


def test_source_detection_integration():
    data = {
        "pm25": 75,
        "pm10": 100,
        "no2": 58,
        "so2": 10,
        "co": 0.9,
        "temperature": 30,
        "humidity": 60,
        "wind_speed": 5,
    }

    result = run_source_detection(data)

    assert "probable_sources" in result
    assert "top_source" in result
    assert "top_confidence" in result