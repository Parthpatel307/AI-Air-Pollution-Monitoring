import pandas as pd

from forecasting.inference.service import forecast_from_records


def test_forecast_from_records():
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

    result = forecast_from_records(records)

    assert result["zone_id"] == "zone_001"
    assert "predicted_aqi" in result
    assert "risk_level" in result
    assert "model_version" in result